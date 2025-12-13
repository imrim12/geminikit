import * as fs from 'node:fs'
import * as path from 'node:path'

export function runSetup() {
  console.log('[GeminiKit] Starting setup...')

  checkAndInstallBun()
  checkAndInstallGeminiCLI()
  setupConfig()

  console.log('[GeminiKit] Setup complete! 🚀')
}

function checkAndInstallBun() {
  try {
    Bun.spawnSync(['bun', '--version'], { stderr: 'ignore' })
  }
  catch {
    console.log('[GeminiKit] Bun not found. Installing Bun...')
    try {
      if (process.platform === 'win32') {
        Bun.spawnSync(['powershell', '-c', '"irm bun.sh/install.ps1 | iex"'], { stdout: 'inherit' })
      }
      else {
        Bun.spawnSync(['bash', '-c', 'curl -fsSL https://bun.sh/install | bash'], { stdout: 'inherit' })
      }
      console.log('[GeminiKit] Bun installed successfully.')
    }
    catch (installErr: any) {
      console.error('[GeminiKit] Failed to install Bun. Please install it manually: https://bun.sh', installErr.message)
    }
  }
}

function checkAndInstallGeminiCLI() {
  try {
    const result = Bun.spawnSync(['gemini', '--version'], { stderr: 'ignore' })
    if (result.exitCode !== 0)
      throw new Error('Not found')
  }
  catch {
    console.log('[GeminiKit] Gemini CLI not found. Installing @google/gemini-cli globally...')
    try {
      Bun.spawnSync(['npm', 'install', '-g', '@google/gemini-cli'], { stdout: 'inherit' })
      console.log('[GeminiKit] Gemini CLI installed successfully.')
    }
    catch (installErr: any) {
      console.error('[GeminiKit] Failed to install Gemini CLI. Please install it manually: npm install -g @google/gemini-cli', installErr.message)
    }
  }
}

function setupConfig() {
  // Locate source .gemini directory
  // Priority 1: Inside geminikit package in node_modules (Standard user install)
  // Priority 2: In monorepo root (Dev environment)

  let sourceDir = ''
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', 'geminikit', '.gemini'), // Consumer project
    path.resolve(__dirname, '..', '..', '..', '.gemini'), // Monorepo dev (dist/../../.gemini -> packages/cli/../../.gemini -> root/.gemini)
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      sourceDir = p
      break
    }
  }

  if (!sourceDir) {
    console.error('[GeminiKit] Error: Could not find source .gemini folder. Ensure "geminikit" is installed.')
    return
  }

  const destRoot = process.cwd()
  const destDir = path.join(destRoot, '.gemini')

  console.log(`[GeminiKit] Linking configuration from ${sourceDir} to ${destDir}...`)

  if (path.resolve(sourceDir) === path.resolve(destDir)) {
    console.log('[GeminiKit] Source and destination are the same. Skipping copy.')
    return
  }

  // Ensure node_modules/.gemini/telemetry exists
  const telemetryDir = path.join(destRoot, 'node_modules', '.gemini', 'telemetry')
  if (!fs.existsSync(telemetryDir)) {
    try {
      fs.mkdirSync(telemetryDir, { recursive: true })
    }
    catch (err: any) {
      console.warn('[GeminiKit] Warning: Skip creating telemetry directory:', err.message)
    }
  }

  try {
    linkRecursiveSync(sourceDir, destDir)
    console.log('[GeminiKit] Successfully configured .gemini workspace.')
  }
  catch (err) {
    console.error('[GeminiKit] Failed to link configuration:', err)
  }
}

function linkRecursiveSync(src: string, dest: string) {
  if (!fs.existsSync(src))
    return
  const stats = fs.statSync(src)
  const isDirectory = stats.isDirectory()

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    fs.readdirSync(src).forEach((childItemName) => {
      linkRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  }
  else {
    if (fs.existsSync(dest)) {
      return
    }

    try {
      fs.linkSync(src, dest)
    }
    catch (err: any) {
      console.warn(`[GeminiKit] Warning: Failed to link ${path.basename(src)}. Falling back to copy. Error: ${err.message}`)
      try {
        fs.copyFileSync(src, dest)
      }
      catch (copyErr: any) {
        console.error(`[GeminiKit] Error: Failed to copy ${path.basename(src)}: ${copyErr.message}`)
      }
    }
  }
}
