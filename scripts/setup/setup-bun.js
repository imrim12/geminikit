const { execSync } = require('child_process');

function checkAndInstallBun() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
  } catch (e) {
    console.log('[geminikit] Bun not found. Installing Bun...');
    try {
      if (process.platform === 'win32') {
        execSync('powershell -c "irm bun.sh/install.ps1 | iex"', { stdio: 'inherit' });
      } else {
        execSync('curl -fsSL https://bun.sh/install | bash', { stdio: 'inherit' });
      }
      console.log('[geminikit] Bun installed successfully.');
    } catch (installErr) {
      console.error('[geminikit] Failed to install Bun. Please install it manually: https://bun.sh', installErr.message);
    }
  }
}

module.exports = checkAndInstallBun;
