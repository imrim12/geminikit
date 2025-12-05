const { execSync } = require('child_process');

function checkAndInstallGeminiCLI() {
  try {
    execSync('gemini --version', { stdio: 'ignore' });
  } catch (e) {
    console.log('[geminikit] Gemini CLI not found. Installing @google/gemini-cli globally...');
    try {
      execSync('npm install -g @google/gemini-cli', { stdio: 'inherit' });
      console.log('[geminikit] Gemini CLI installed successfully.');
    } catch (installErr) {
      console.error('[geminikit] Failed to install Gemini CLI. Please install it manually: npm install -g @google/gemini-cli', installErr.message);
    }
  }
}

module.exports = checkAndInstallGeminiCLI;
