import { spawn } from 'bun'
import { resolve } from 'path'
import { existsSync } from 'fs'

// CLI Args
const args = Bun.argv.slice(2)
const inputArgIndex = args.indexOf('--input')
const inputPath = inputArgIndex !== -1 ? args[inputArgIndex + 1] : null

if (!inputPath) {
  console.error('Error: --input argument is required')
  process.exit(1)
}

async function runAnalysis(imagePath: string): Promise<any> {
  // Resolve path to screenshot-analysis inspect.ts
  // structure: .gemini/skills/ui-development/scripts/bridge.ts
  // target:    .gemini/skills/screenshot-analysis/scripts/inspect.ts
  
  const currentDir = import.meta.dir
  const inspectScript = resolve(currentDir, '..', '..', 'screenshot-analysis', 'scripts', 'inspect.ts')
  
  if (!existsSync(inspectScript)) {
    throw new Error(`Inspect script not found at ${inspectScript}`)
  }

  const proc = spawn(['bun', inspectScript, '--input', imagePath], {
    stdout: 'pipe',
    stderr: 'inherit' // Let errors/logs pass through
  })

  const output = await new Response(proc.stdout).text()
  const exitCode = await proc.exited

  if (exitCode !== 0) {
    throw new Error(`Analysis failed with exit code ${exitCode}`)
  }

  try {
    return JSON.parse(output)
  } catch (e) {
    console.error("Failed to parse analysis output:", output)
    throw new Error("Invalid JSON from analysis tool")
  }
}

function generateSpecSheet(data: any) {
  const backend = data.backend || 'unknown'
  const components = data.ui_components || []

  let markdown = `# Frontend Specification Sheet
**Source Image:** ${inputPath}
**Analysis Backend:** ${backend.toUpperCase()}

## Layout & Components
`

  if (components.length === 0) {
    markdown += "_No specific UI components detected._\n"
    return markdown
  }

  // Basic grouping or listing
  components.forEach((comp: any, index: number) => {
    const { type, text, bbox, attributes } = comp
    const [x1, y1, x2, y2] = bbox || [0,0,0,0]
    const width = x2 - x1
    const height = y2 - y1

    markdown += `### ${index + 1}. ${type.toUpperCase()} ${text ? `"${text}"` : ''}
- **Position:** x=${x1}, y=${y1}
- **Size:** w=${width}, h=${height}
- **Layout Suggestion:** 
- **Attributes:** ${JSON.stringify(attributes)}
`
    if (attributes) {
      markdown += `- **Attributes:** ${JSON.stringify(attributes)}
`
    }
    markdown += "\n"
  })

  markdown += `
## Developer Notes
- Use the **Layout Suggestions** as a baseline for positioning, but prefer **Flexbox/Grid** layouts where possible for responsiveness.
- The coordinates are absolute pixels from the screenshot.
- Match fonts and colors as closely as possible to the visual cues (attributes).
`
  return markdown
}

async function main() {
  console.error('Generating Frontend Spec Sheet...')
  try {
    const data = await runAnalysis(inputPath!)
    const spec = generateSpecSheet(data)
    console.log(spec)
  } catch (e: any) {
    console.error("Error:", e.message)
    process.exit(1)
  }
}

main()