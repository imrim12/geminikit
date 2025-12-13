import * as fs from 'node:fs'
import * as path from 'node:path'
import { spawnSync } from 'bun'

interface CheckResult {
  passed: boolean
  details?: string
}

function checkGeminiKitCLIVersion(): CheckResult {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return { passed: true, details: `(${packageJson.version})` }
  }
  catch {
    return { passed: false }
  }
}

function checkGeminiKitVersion(): CheckResult {
  try {
    // Check if we are in the root of the geminikit repo
    const cwdPackageJsonPath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(cwdPackageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(cwdPackageJsonPath, 'utf-8'))
      if (pkg.name === 'geminikit') {
        return { passed: true, details: `(${pkg.version})` }
      }
    }

    // Check if geminikit is installed in node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'geminikit', 'package.json')
    if (fs.existsSync(nodeModulesPath)) {
      const pkg = JSON.parse(fs.readFileSync(nodeModulesPath, 'utf-8'))
      return { passed: true, details: `(${pkg.version})` }
    }

    return { passed: false, details: '(Not found)' }
  }
  catch {
    return { passed: false }
  }
}

function checkBun(): CheckResult {
  try {
    const { stdout } = spawnSync(['bun', '--version'])
    const version = stdout.toString().trim()
    return { passed: true, details: `(${version})` }
  }
  catch {
    return { passed: false }
  }
}

function checkGeminiCLI(): CheckResult {
  try {
    const { stdout } = spawnSync(['gemini', '--version'])
    const version = stdout.toString().trim()
    return { passed: true, details: `(${version})` }
  }
  catch {
    return { passed: false }
  }
}

function checkGeminiConfig(): CheckResult {
  const cwd = process.cwd()
  const configPath = path.join(cwd, 'node_modules', '.gemini')
  return { passed: fs.existsSync(configPath) }
}

function checkEnvironment(): CheckResult {
  const env = process.env
  const useVertex = env.GOOGLE_GENAI_USE_VERTEXAI === 'true'
  const hasVertexVars = env.GOOGLE_CLOUD_PROJECT && env.GOOGLE_CLOUD_LOCATION
  const hasApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY

  const vertexRecommendation = 'For a much better experience, read more at https://geminicli.com/docs/get-started/authentication/#use-vertex-ai'

  if (useVertex && hasVertexVars) {
    return { passed: true, details: '(Vertex AI configured)' }
  }

  if (hasApiKey) {
    return { passed: true, details: `(Google AI Studio/API Key detected. While functional, consider upgrading to Vertex AI for optimal experience and future compatibility. 
   💡 Recommendation: ${vertexRecommendation})` }
  }

  if (useVertex && !hasVertexVars) {
    return { passed: false, details: `(Vertex AI setup incomplete. GOOGLE_GENAI_USE_VERTEXAI is true, but GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION are missing. 
   💡 Action Required: Complete your Vertex AI configuration. ${vertexRecommendation})` }
  }

  return { passed: false, details: `(No valid authentication found. Geminikit cannot interact with Google APIs without proper setup. 
   💡 Action Required: Please configure authentication. We strongly recommend Vertex AI. ${vertexRecommendation})` }
}

export function runDoctor() {
  console.log('Gemini Kit Doctor 🩺\n')

  const checks = [
    { name: 'Gemini Kit Version', check: checkGeminiKitVersion },
    { name: 'Gemini Kit CLI Version', check: checkGeminiKitCLIVersion },
    { name: 'Bun Installation', check: checkBun },
    { name: 'Gemini CLI Installation', check: checkGeminiCLI },
    { name: 'Gemini Configuration (.gemini)', check: checkGeminiConfig },
    { name: 'Environment Variables', check: checkEnvironment },
  ]

  let allPassed = true

  for (const { name, check } of checks) {
    const result = check()
    if (result.passed) {
      console.log(`✅ ${name} ${result.details || ''}`)
    }
    else {
      console.log(`❌ ${name} ${result.details || ''}`)
      allPassed = false
    }
  }

  console.log('')
  if (allPassed) {
    console.log('Everything looks good! You are ready to go. 🚀')
  }
  else {
    console.log('Some checks failed. Please fix the issues above. 🛠️')
    process.exit(1)
  }
}
