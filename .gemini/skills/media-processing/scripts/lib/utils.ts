import { spawn } from 'bun'

export async function checkCommand(command: string): Promise<boolean> {
  try {
    const proc = spawn([command, '-version'], { stdout: 'ignore', stderr: 'ignore' })
    await proc.exited
    return proc.exitCode === 0
  }
  catch {
    return false
  }
}

export async function checkDependencies(): Promise<{ ffmpeg: boolean, magick: boolean }> {
  const [ffmpeg, magick] = await Promise.all([
    checkCommand('ffmpeg'),
    checkCommand('magick'),
  ])
  return { ffmpeg, magick }
}

export async function runCommand(cmd: string[], verbose: boolean = false, dryRun: boolean = false): Promise<boolean> {
  if (verbose || dryRun) {
    console.log(`Command: ${cmd.join(' ')}`)
  }

  if (dryRun) {
    return true
  }

  try {
    const proc = spawn(cmd, {
      stdout: verbose ? 'inherit' : 'ignore',
      stderr: verbose ? 'inherit' : 'pipe', // Pipe stderr to capture error message if needed
    })

    const stderrChunks: Uint8Array[] = []
    if (!verbose && proc.stderr) {
      // If not verbose, we still might want to see error output if it fails
      // Using a simple reader for stderr
      for await (const chunk of proc.stderr) {
        stderrChunks.push(chunk)
      }
    }

    await proc.exited

    if (proc.exitCode !== 0) {
      if (!verbose && stderrChunks.length > 0) {
        // eslint-disable-next-line node/prefer-global/buffer
        const stderr = Buffer.concat(stderrChunks).toString()
        console.error(stderr)
      }
      return false
    }
    return true
  }
  catch (e: any) {
    console.error(`Execution error: ${e.message}`)
    return false
  }
}
