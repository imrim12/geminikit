#!/usr/bin/env bun
/**
 * Batch process media files using Gemini API.
 * Replaces gemini_batch_process.py and document_converter.py.
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";
import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

async function uploadFile(filePath: string): Promise<any> {
  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  const stats = await fs.stat(filePath);
  
  console.log(`Uploading ${path.basename(filePath)} (${mimeType})...`);
  
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });

  let file = await fileManager.getFile(uploadResult.file.name);
  
  // Poll for processing
  while (file.state === FileState.PROCESSING) {
    console.log("Processing...");
    await new Promise(r => setTimeout(r, 2000));
    file = await fileManager.getFile(uploadResult.file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error("File processing failed.");
  }

  console.log(`File active: ${file.uri}`);
  return file;
}

async function processFile(
  filePath: string | null,
  options: {
    prompt: string;
    model: string;
    task: string;
    format: string;
    aspectRatio?: string;
  }
) {
  const model = genAI.getGenerativeModel({ model: options.model });
  let result: any = { status: "success", file: filePath || "generated" };

  try {
    if (options.task === "generate") {
      // Image Generation
      // Note: The Node SDK image generation API might differ slightly or be in preview.
      // Assuming standard generateContent for now, but typical image gen models work differently.
      // For Gemini 2.0/2.5 Flash Image, we send a prompt.
      // IMPORTANT: Node SDK support for image generation specific methods might be limited compared to Python.
      // We will treat it as text-to-image via standard interface if supported, or error out if specialized client needed.
      // Currently, standard generateContent returns text/multimodal.
      // If model is 'gemini-2.5-flash-image', it might return base64 image.
      
      console.log("Generating image...");
      const response = await model.generateContent(options.prompt);
      const responseText = response.response.text();
      // Verify if response contains image data (often standard API returns text, specialized endpoint needed)
      // For now, we'll save the text response or handle if it's different.
      result.response = responseText;
      
    } else if (filePath) {
      // Multimodal Analysis / Extraction
      const stats = await fs.stat(filePath);
      const isLarge = stats.size > 20 * 1024 * 1024; // 20MB
      let parts: any[] = [{ text: options.prompt }];

      if (isLarge) {
        const file = await uploadFile(filePath);
        parts.push({
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri
          }
        });
      } else {
        const data = await fs.readFile(filePath);
        const mimeType = mime.lookup(filePath) || "application/octet-stream";
        parts.push({
          inlineData: {
            data: Buffer.from(data).toString("base64"),
            mimeType
          }
        });
      }

      // Generation config
      const generationConfig: any = {};
      if (options.format === "json") {
        generationConfig.responseMimeType = "application/json";
      }

      const resultRaw = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig
      });

      result.response = resultRaw.response.text();
    }
  } catch (e: any) {
    result.status = "error";
    result.error = e.message;
  }

  return result;
}

// CLI
yargs(hideBin(process.argv))
  .command(
    "$0",
    "Process media files",
    (yargs) => {
      return yargs
        .option("files", { array: true, type: "string", description: "Input files" })
        .option("task", { choices: ["transcribe", "analyze", "extract", "generate"], required: true })
        .option("prompt", { type: "string", description: "Prompt" })
        .option("model", { type: "string", default: "gemini-2.5-flash" })
        .option("format", { choices: ["text", "json", "markdown"], default: "text" })
        .option("output", { type: "string", description: "Output file" });
    },
    async (argv) => {
      // Defaults
      if (!argv.prompt && argv.task !== "generate") {
        if (argv.task === "transcribe") argv.prompt = "Generate a transcript.";
        if (argv.task === "extract") argv.prompt = "Extract content.";
        if (argv.task === "analyze") argv.prompt = "Analyze this.";
      }

      if (!argv.files && argv.task !== "generate") {
        console.error("Error: --files required");
        process.exit(1);
      }

      const files = (argv.files as string[]) || [];
      const results = [];

      // Single generation task
      if (argv.task === "generate") {
        const r = await processFile(null, {
          prompt: argv.prompt as string,
          model: argv.model,
          task: argv.task,
          format: argv.format
        });
        results.push(r);
      } else {
        for (const file of files) {
          const r = await processFile(file, {
            prompt: argv.prompt as string,
            model: argv.model,
            task: argv.task,
            format: argv.format
          });
          results.push(r);
        }
      }

      // Output
      if (argv.output) {
        await fs.writeFile(argv.output, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${argv.output}`);
      } else {
        console.log(JSON.stringify(results, null, 2));
      }
    }
  )
  .parse();
