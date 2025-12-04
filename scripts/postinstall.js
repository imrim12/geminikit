const fs = require('fs');
const path = require('path');

// The package's .gemini folder (source)
const sourceDir = path.join(__dirname, '../.gemini');

// The consumer's project root
// INIT_CWD is set by npm/bun during install to the directory where the user ran the command.
// If not set, we assume we are in node_modules/@thecodeorigin/geminikit and go up 3 levels to root.
// But safely, INIT_CWD is best.
const destRoot = process.env.INIT_CWD || path.resolve(__dirname, '../../../'); 
const destDir = path.join(destRoot, '.gemini');

console.log(`[geminikit] Copying configuration from ${sourceDir} to ${destDir}...`);

if (!fs.existsSync(sourceDir)) {
  console.error('[geminikit] Error: Source .gemini folder not found! This might be a local install issue.');
  // In local dev, we might be running this in the repo itself, where sourceDir exists.
  // If it doesn't exist, we can't copy.
  process.exit(0);
}

// Safety check: Don't copy if source == dest (e.g. running postinstall in the repo itself)
if (path.resolve(sourceDir) === path.resolve(destDir)) {
  console.log('[geminikit] Source and destination are the same. Skipping copy.');
  process.exit(0);
}

// Function to copy recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Don't overwrite if file exists? Or overwrite?
    // "configure this workspace" implies setting it up. Overwriting ensures the latest kit is applied.
    // But user might have custom settings. 
    // For now, we overwrite to ensure the "kit" distribution works as intended.
    fs.copyFileSync(src, dest);
  }
}

try {
  copyRecursiveSync(sourceDir, destDir);
  console.log('[geminikit] Successfully configured .gemini workspace.');
} catch (err) {
  console.error('[geminikit] Failed to copy configuration:', err);
}
