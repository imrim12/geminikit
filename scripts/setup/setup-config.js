const fs = require('fs');
const path = require('path');

function setupConfig() {
  // The package's .gemini folder (source)
  const sourceDir = path.join(__dirname, '../../.gemini');

  // The consumer's project root
  // INIT_CWD is set by npm/bun during install to the directory where the user ran the command.
  // If not set, we assume we are in node_modules/@thecodeorigin/geminikit/scripts/setup and go up 4 levels to root.
  const destRoot = process.env.INIT_CWD || path.resolve(__dirname, '../../../../'); 
  const destDir = path.join(destRoot, '.gemini');

  // Ensure node_modules/.gemini/telemetry exists
  const telemetryDir = path.join(destRoot, 'node_modules', '.gemini', 'telemetry');
  if (!fs.existsSync(telemetryDir)) {
    try {
      fs.mkdirSync(telemetryDir, { recursive: true });
    } catch (err) {
      console.warn('[geminikit] Warning: Skip creating telemetry directory:', err.message);
    }
  }

  console.log(`[geminikit] Linking configuration from ${sourceDir} to ${destDir}...`);

  if (!fs.existsSync(sourceDir)) {
    console.error('[geminikit] Error: Source .gemini folder not found! This might be a local install issue.');
    // In local dev, we might be running this in the repo itself, where sourceDir exists.
    // If it doesn't exist, we can't copy.
    return;
  }

  // Safety check: Don't copy if source == dest (e.g. running postinstall in the repo itself)
  if (path.resolve(sourceDir) === path.resolve(destDir)) {
    console.log('[geminikit] Source and destination are the same. Skipping copy.');
    return;
  }

  try {
    linkRecursiveSync(sourceDir, destDir);
    console.log('[geminikit] Successfully configured .gemini workspace.');
  } catch (err) {
    console.error('[geminikit] Failed to link configuration:', err);
  }
}

// Function to link recursively
function linkRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      linkRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Skip if file exists (User requirement: not overriding)
    if (fs.existsSync(dest)) {
      return;
    }
    
    try {
      // Create hard link to save space and maintain source of truth
      fs.linkSync(src, dest);
    } catch (err) {
      console.warn(`[geminikit] Warning: Failed to link ${path.basename(src)}. Falling back to copy. Error: ${err.message}`);
      try {
        fs.copyFileSync(src, dest);
      } catch (copyErr) {
        console.error(`[geminikit] Error: Failed to copy ${path.basename(src)}: ${copyErr.message}`);
      }
    }
  }
}

module.exports = setupConfig;
