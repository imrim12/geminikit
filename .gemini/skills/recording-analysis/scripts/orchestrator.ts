import { parseArgs } from 'node:util'
import { spawn } from 'bun'
import { existsSync, mkdirSync } from 'node:fs'

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
})

if (!values.input) {
  console.error('Usage: bun orchestrator.ts --input <video-path>')
  process.exit(1)
}

async function runCommand(cmd: string[]): Promise<boolean> {
  console.log(`Command: ${cmd.join(' ')}`)
  const proc = spawn(cmd, { stdout: 'inherit', stderr: 'inherit' })
  await proc.exited
  return proc.exitCode === 0
}

async function main() {
  const inputFile = values.input

  if (!process.env.GCLOUD_PROJECT && !process.env.GOOGLE_CLOUD_PROJECT) {
      console.error('❌ GCLOUD_PROJECT (or GOOGLE_CLOUD_PROJECT) environment variable is not set.')
      process.exit(1)
  }

  // 1. Prepare Output & Temp Directories
  const timestamp = Date.now()
  const outputDir = `.gemini/planning/${timestamp}_recording_analysis`
  const framesDir = `${outputDir}/frames`
  
  if (!existsSync(framesDir)) {
    mkdirSync(framesDir, { recursive: true })
  }

  console.log(`📂 Output directory: ${outputDir}`)
  console.log(`🎞️  Frames directory: ${framesDir}`)

  // 2. Extract Frames (1 frame per second)
  console.log('running ffmpeg frame extraction...')
  const ffmpegCmd = [
    'ffmpeg',
    '-i', inputFile!,
    '-vf', 'fps=1', 
    '-q:v', '2', // Good quality JPEG
    `${framesDir}/frame_%04d.jpg`
  ]

  const ffmpegSuccess = await runCommand(ffmpegCmd)
  if (!ffmpegSuccess) {
    console.error('❌ FFmpeg frame extraction failed.')
    process.exit(1)
  }

  // 3. Spawn Inspection
  const inspectScript = '.gemini/skills/screenshot-analysis/scripts/inspect.ts'
  
  if (!existsSync(inspectScript)) {
      console.error(`❌ Inspection script not found at ${inspectScript}`)
      process.exit(1)
  }

  // Use the new directory support in inspect.ts
  const cmd = [
    'bun', 
    inspectScript, 
    '--input', framesDir
  ]

  console.log(`🚀 Running inspection on extracted frames...`)
  const procSuccess = await runCommand(cmd)

  if (procSuccess) {
    console.log('✅ Analysis complete.')
  }
  else {
    console.error('❌ Analysis failed.')
    process.exit(1)
  }
}

main()