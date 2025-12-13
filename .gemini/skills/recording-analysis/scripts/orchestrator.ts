import { parseArgs } from 'node:util'
import { spawn } from 'bun'

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

  const outputDir = `.gemini/planning/${Date.now()}_recording_analysis`
  await Bun.spawn(['mkdir', '-p', outputDir]).exited // Ensure dir exists

  console.log(`📂 Output directory: ${outputDir}`)

  // 3. Spawn Vision Processor
  // Determine path to python script relative to this script or CWD
  // Assuming run from project root as per GEMINI.md instructions
  const pythonScript = '.gemini/skills/recording-analysis/tools/vision_processor.py'

  const cmd = ['python', pythonScript, '--backend', config.backend, '--input', inputFile!, '--output', outputDir]

  console.log(`Debugger: Running ${cmd.join(' ')}`)

  const proc = spawn(cmd, { stdout: 'inherit', stderr: 'inherit' })
  const exitCode = await proc.exited

  if (exitCode === 0) {
    console.log('✅ Analysis complete.')
  }
  else {
    console.error('❌ Analysis failed.')
    process.exit(exitCode)
  }
}

main()
