const checkAndInstallBun = require('./setup/setup-bun');
const checkAndInstallGeminiCLI = require('./setup/setup-gemini-cli');
const setupConfig = require('./setup/setup-config');

checkAndInstallBun();
checkAndInstallGeminiCLI();
setupConfig();
