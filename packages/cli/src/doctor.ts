import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

interface CheckResult {
  passed: boolean;
  details?: string;
}

function checkGeminiKitCLIVersion(): CheckResult {
  try {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return { passed: true, details: `(${packageJson.version})` };
  } catch (e) {
    return { passed: false };
  }
}

function checkGeminiKitVersion(): CheckResult {
  try {
    // Check if we are in the root of the geminikit repo
    const cwdPackageJsonPath = join(process.cwd(), 'package.json');
    if (existsSync(cwdPackageJsonPath)) {
        const pkg = JSON.parse(readFileSync(cwdPackageJsonPath, 'utf-8'));
        if (pkg.name === 'geminikit') {
            return { passed: true, details: `(${pkg.version})` };
        }
    }

    // Check if geminikit is installed in node_modules
    const nodeModulesPath = join(process.cwd(), 'node_modules', 'geminikit', 'package.json');
    if (existsSync(nodeModulesPath)) {
        const pkg = JSON.parse(readFileSync(nodeModulesPath, 'utf-8'));
        return { passed: true, details: `(${pkg.version})` };
    }

    return { passed: false, details: '(Not found)' };
  } catch (e) {
    return { passed: false };
  }
}

function checkBun(): CheckResult {
  try {
    const version = execSync('bun --version').toString().trim();
    return { passed: true, details: `(${version})` };
  } catch (e) {
    return { passed: false };
  }
}

function checkGeminiCLI(): CheckResult {
  try {
    const version = execSync('gemini --version').toString().trim();
    return { passed: true, details: `(${version})` };
  } catch (e) {
    return { passed: false };
  }
}

function checkGeminiConfig(): CheckResult {
  // We need to find where the package is installed and check for node_modules/.gemini
  // Assuming we are running from within the project or installed as a dependency
  
  // Strategy: Check current working directory's node_modules/.gemini
  // or check relative to the package location if possible, but usually we care about the user's project.
  
  const cwd = process.cwd();
  const configPath = join(cwd, 'node_modules', '.gemini');
  return { passed: existsSync(configPath) };
}

function checkEnvironment(): CheckResult {
  const env = process.env;
  const useVertex = env.GOOGLE_GENAI_USE_VERTEXAI === 'true';
  const hasVertexVars = env.GOOGLE_CLOUD_PROJECT && env.GOOGLE_CLOUD_LOCATION;
  const hasApiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;

  const vertexRecommendation = 'For a much better experience, read more at https://geminicli.com/docs/get-started/authentication/#use-vertex-ai';

  if (useVertex && hasVertexVars) {
    return { passed: true, details: '(Vertex AI configured)' };
  }
  
  if (hasApiKey) {
     return { passed: true, details: `(Google AI Studio/API Key detected. While functional, consider upgrading to Vertex AI for optimal experience and future compatibility. 
   💡 Recommendation: ${vertexRecommendation})` };
  }

  if (useVertex && !hasVertexVars) {
      return { passed: false, details: `(Vertex AI setup incomplete. GOOGLE_GENAI_USE_VERTEXAI is true, but GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION are missing. 
   💡 Action Required: Complete your Vertex AI configuration. ${vertexRecommendation})` };
  }

  return { passed: false, details: `(No valid authentication found. Geminikit cannot interact with Google APIs without proper setup. 
   💡 Action Required: Please configure authentication. We strongly recommend Vertex AI. ${vertexRecommendation})` };
}

export function runDoctor() {
  console.log('Gemini Kit Doctor 🩺\n');

  const checks = [
    { name: 'Gemini Kit Version', check: checkGeminiKitVersion },
    { name: 'Gemini Kit CLI Version', check: checkGeminiKitCLIVersion },
    { name: 'Bun Installation', check: checkBun },
    { name: 'Gemini CLI Installation', check: checkGeminiCLI },
    { name: 'Gemini Configuration (.gemini)', check: checkGeminiConfig },
    { name: 'Environment Variables', check: checkEnvironment },
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    const result = check();
    if (result.passed) {
      console.log(`✅ ${name} ${result.details || ''}`);
    } else {
      console.log(`❌ ${name} ${result.details || ''}`);
      allPassed = false;
    }
  }

  console.log('');
  if (allPassed) {
    console.log('Everything looks good! You are ready to go. 🚀');
  } else {
    console.log('Some checks failed. Please fix the issues above. 🛠️');
    process.exit(1);
  }
}
