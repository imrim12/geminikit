import { parseArgs } from 'node:util'
import { spawn } from 'bun'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

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

  // 1. Read Config
  const configFile = Bun.file('env_config.json')
  if (!await configFile.exists()) {
    console.error('❌ env_config.json not found. Run diagnose.ts first.')
    process.exit(1)
  }
  const config = await configFile.json()
  console.log(`🚀 Starting analysis using backend: ${config.backend}`)

  // 2. Prepare Output & Temp Directories
  const timestamp = Date.now()
  const outputDir = `.gemini/planning/${timestamp}_recording_analysis`
  const framesDir = `${outputDir}/frames`
  
  if (!existsSync(framesDir)) {
    mkdirSync(framesDir, { recursive: true })
  }

  console.log(`📂 Output directory: ${outputDir}`)
  console.log(`🎞️  Frames directory: ${framesDir}`)

  // 3. Extract Frames (1 frame per second)
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

  // 4. Spawn Vision Processor
  // Assuming run from project root as per GEMINI.md instructions
  const pythonScript = '.gemini/skills/recording-analysis/tools/vision_processor.py'
  
  // Note: We pass the FRAMES directory now, not the video file
  const cmd = [
    'python', 
    pythonScript, 
    '--backend', config.backend, 
    '--input_dir', framesDir, 
    '--output', outputDir
  ]

  console.log(`Debugger: Running ${cmd.join(' ')}`)
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