import { VertexAI } from "@google-cloud/vertexai";
import slugify from "slugify";
import { parseArgs } from "node:util";
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, basename, resolve, extname } from "node:path";

// --- Load .env from pwd ---
try {
  const envPath = join(process.cwd(), ".env");
  if (existsSync(envPath)) {
    console.log(`ℹ️  Loading environment from ${envPath}...`);
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("⚠️ Failed to load .env file:", e);
}

// --- Configuration ---
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!values.input) {
  console.error('Usage: bun inspect.ts --input "img1.png,img2.png" OR --input "./folder/of/images"');
  process.exit(1);
}

const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GCLOUD_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

if (!project) {
  console.error("❌ Error: GCLOUD_PROJECT (or GOOGLE_CLOUD_PROJECT) is not set.");
  console.error("Please set it in your .env file.");
  process.exit(1);
}

console.log(`ℹ️  Using Vertex AI Project: ${project}, Location: ${location}`);

const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// --- Types ---
interface Component {
  type: string;
  text?: string;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] scaled 0-1000
  hex_color?: string;
  [key: string]: any;
}

interface ScreenData {
  fileName: string;
  slug: string;
  width: number;
  height: number;
  components: Component[];
}

// --- Helper Functions ---

function normalizeBox(box: number[], width: number, height: number): [number, number, number, number] {
  if (!box || box.length < 4) return [0, 0, 0, 0];
  const [ymin, xmin, ymax, xmax] = box;

  const y1 = Math.round((ymin / 1000) * height);
  const x1 = Math.round((xmin / 1000) * width);
  const y2 = Math.round((ymax / 1000) * height);
  const x2 = Math.round((xmax / 1000) * width);

  return [x1, y1, x2, y2];
}

async function getImageDimensions(path: string): Promise<{ width: number; height: number }> {
  return { width: 1000, height: 1000 };
}

function getFilesFromInput(inputStr: string): string[] {
  const inputs = inputStr.split(",").map((s) => s.trim());
  let allFiles: string[] = [];

  for (const input of inputs) {
    const fullPath = resolve(input);
    if (!existsSync(fullPath)) {
      console.warn(`⚠️ Path not found: ${fullPath}, skipping.`);
      continue;
    }

    if (statSync(fullPath).isDirectory()) {
      const files = readdirSync(fullPath)
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map(f => join(fullPath, f));
      allFiles = allFiles.concat(files);
    } else {
      allFiles.push(fullPath);
    }
  }
  return allFiles;
}

// --- Main Execution ---

async function main() {
  const inputs = getFilesFromInput(values.input!);

  if (inputs.length === 0) {
    console.error("❌ No valid image files found in input.");
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = `.gemini/plans/analysis-${timestamp}`;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📂 Output Directory: ${outputDir}`);
  console.log(`🔍 Processing ${inputs.length} images...`);

  const allScreenData: ScreenData[] = [];

  // Phase 1: Individual Analysis
  for (const fullPath of inputs) {
    const fileName = basename(fullPath);
    const fileSlug = slugify(fileName, { lower: true, remove: /[*+~.()"'!:@]/g });

    console.log(`Analyzing: ${fileName}...`);

    const imageBuffer = await Bun.file(fullPath).arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = `image/${extname(fullPath).slice(1).replace('jpg', 'jpeg')}`;

    const { width, height } = await getImageDimensions(fullPath);

    const prompt = `
      Analyze this UI screenshot.
      
      Return a SINGLE JSON object with three specific keys: "structure", "html", and "description".

      1. "structure": A list of detected UI components.
         - "type": Component type (e.g., Button, Text, Image, Input, Icon, Card, Header).
         - "text": The text content (if any).
         - "box_2d": [ymin, xmin, ymax, xmax] coordinates (normalized 0-1000).
         - "hex_color": Dominant hex color.

      2. "html": A valid HTML string representing the UI.
         - Use Tailwind CSS classes for ALL styling to match the screenshot as closely as possible (layout, typography, colors, spacing, shadows, rounded corners).
         - The HTML structure should be semantic and hierarchical.
         - IMPORTANT: Add a 'data-bounding' attribute to every distinct element.
           The format must be "ymin,xmin,ymax,xmax" (using the same 0-1000 scale).
           Example: <button data-bounding="142,42,185,500" class="bg-blue-600 text-white ...">...</button>
         - Do not include <html>, <head>, or <body> tags, just the root container of the UI components.

      3. "description": A comprehensive, top-to-bottom technical description of the UI.
         - This should be a high-quality prompt for another AI agent to replicate this exact UI.
         - Describe the layout hierarchy (e.g., "Sticky header at the top", "Scrollable main content area", "Fixed navigation bar at the bottom").
         - Describe alignment and balance (e.g., "Centered content", "Space-between alignment for header items").
         - Describe styling details (colors, border radii, shadows, typography weights).
         - Do NOT list coordinates or raw data. Focus on visual relationships and structure.
    `;

    try {
      const request = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      };

      const result = await model.generateContent(request);
      const response = await result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;

      let data: any;
      try {
        data = JSON.parse(jsonStr);
      } catch (e) {
        console.error(`❌ Failed to parse JSON for ${fileName}`, e);
        await Bun.write(join(outputDir, `error-${fileSlug}.txt`), responseText);
        continue;
      }

      let components: Component[] = [];
      let htmlContent = "";
      let description = "";

      if (data.structure) {
        components = data.structure;
        htmlContent = data.html;
        description = data.description || "No description generated.";
      } else if (data.components) {
        components = data.components; // Fallback
      }

      // Save Structure JSON (Required for data, but user won't be bothered with it in chat)
      await Bun.write(join(outputDir, `structure-${fileSlug}.json`), JSON.stringify(components, null, 2));

      // Save HTML Layout
      if (htmlContent) {
        const htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName} Analysis</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { background-color: #f3f4f6; padding: 20px; font-family: sans-serif; display: flex; justify-content: center; }
      .preview-container {
        position: relative;
        max-width: 100%;
        width: 1000px; /* Scaled to 0-1000 coordinate system */
        background: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      /* Visualization of bounds on hover */
      *[data-bounding]:hover {
        outline: 2px solid red;
        cursor: crosshair;
      }
    </style>
</head>
<body>
    <div class="preview-container">
        ${htmlContent}
    </div>
</body>
</html>`;
        await Bun.write(join(outputDir, `layout-${fileSlug}.html`), htmlOutput);
      }

      // Save Markdown Report (Description Only)
      const report = `# UI Analysis: ${fileName}\n\n${description}\n`;
      await Bun.write(join(outputDir, `report-${fileSlug}.md`), report);

      allScreenData.push({
        fileName,
        slug: fileSlug,
        width,
        height,
        components: components,
      });

    } catch (error: any) {
      console.error(`❌ Error processing ${fileName}:`, error);
    }
  }

  // Phase 2: Cross-Analysis
  if (allScreenData.length > 1) {
    console.log(`🔄 Performing Cross-Analysis on ${allScreenData.length} screens...`);

    const combinedJson = allScreenData.map(d => ({
      file: d.fileName,
      components: d.components.map(c => ({ type: c.type, text: c.text, color: c.hex_color }))
    }));

    const crossPrompt = `
      You are a UI Architect. Here is the structural JSON for multiple screens of an app.
      Identify the "Reusable Components" (Design System candidates).
      
      Look for:
      1. Navigation Bars (Top/Bottom) that appear on multiple screens.
      2. Repeated Card Layouts (e.g., "Driver Card" appears on Home and History).
      3. Common UI Elements (Buttons with same color/style, standard Input fields).

      Output a Markdown report listing:
      - Component Name (e.g., "Primary Action Button")
      - Frequency (How many screens it appears on)
      - Which Screens (File names)
      - Suggestion (e.g., "Should be a React component <PrimaryButton />")
      
      Input Data:
      ${JSON.stringify(combinedJson, null, 2)}
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: crossPrompt }] }]
      });
      const response = await result.response;
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      await Bun.write(join(outputDir, `analysis-reusable-components.md`), text);
      console.log(`✅ Saved: analysis-reusable-components.md`);
    } catch (error: any) {
      console.error("❌ Cross-analysis failed:", error);
    }
  } else {
    console.log("ℹ️  Skipping cross-analysis (only 1 screen processed).");
  }
}

main();