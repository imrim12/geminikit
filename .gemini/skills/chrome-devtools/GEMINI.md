---
name: chrome-devtools
description: Browser automation, debugging, and performance analysis using Puppeteer CLI scripts. Use for automating browsers, taking screenshots, analyzing performance, monitoring network traffic, web scraping, form automation, and JavaScript debugging.
license: Apache-2.0
---

# Chrome DevTools Agent Skill

Browser automation via executable Puppeteer scripts. All scripts output JSON for easy parsing.

## Quick Start

**CRITICAL**: Always check `pwd` before running scripts.

### Installation

#### Step 1: Install System Dependencies (Linux/WSL only)

On Linux/WSL, Chrome requires system libraries. Install them first:

```bash
pwd  # Should show current working directory
cd .gemini/skills/chrome-devtools/scripts
./install-deps.sh  # Auto-detects OS and installs required libs
```

Supports: Ubuntu, Debian, Fedora, RHEL, CentOS, Arch, Manjaro

**macOS/Windows**: Skip this step (dependencies bundled with Chrome)

#### Step 2: Install Node Dependencies

```bash
bun install  # Installs puppeteer, debug, yargs
```

#### Step 3: Install ImageMagick (Optional, Recommended)

ImageMagick enables automatic screenshot compression to keep files under 5MB:

**macOS:**
```bash
brew install imagemagick
```

**Ubuntu/Debian/WSL:**
```bash
sudo apt-get install imagemagick
```

**Verify:**
```bash
magick -version  # or: convert -version
```

Without ImageMagick, screenshots >5MB will not be compressed (may fail to load in Gemini/Claude).

### Test
```bash
bun navigate.ts --url https://example.com
# Output: {"success": true, "url": "https://example.com", "title": "Example Domain"}
```

## Available Scripts

All scripts are in `.gemini/skills/chrome-devtools/scripts/`

**CRITICAL**: Always check `pwd` before running scripts.

### Script Usage
- `./scripts/README.md`

### Core Automation
- `navigate.ts` - Navigate to URLs
- `screenshot.ts` - Capture screenshots (full page or element)
- `click.ts` - Click elements
- `fill.ts` - Fill form fields
- `evaluate.ts` - Execute JavaScript in page context

### Analysis & Monitoring
- `snapshot.ts` - Extract interactive elements with metadata
- `console.ts` - Monitor console messages/errors
- `network.ts` - Track HTTP requests/responses
- `performance.ts` - Measure Core Web Vitals + record traces

## Usage Patterns

### Single Command
```bash
pwd  # Should show current working directory
cd .gemini/skills/chrome-devtools/scripts
bun screenshot.ts --url https://example.com --output ./docs/screenshots/page.png
```
**Important**: Always save screenshots to `./docs/screenshots` directory.

### Automatic Image Compression
Screenshots are **automatically compressed** if they exceed 5MB to ensure compatibility with Gemini API and Claude Code (which have 5MB limits). This uses ImageMagick internally:

```bash
# Default: auto-compress if >5MB
bun screenshot.ts --url https://example.com --output page.png

# Custom size threshold (e.g., 3MB)
bun screenshot.ts --url https://example.com --output page.png --max-size 3

# Disable compression
bun screenshot.ts --url https://example.com --output page.png --no-compress
```

**Compression behavior:**
- PNG: Resizes to 90% + quality 85 (or 75% + quality 70 if still too large)
- JPEG: Quality 80 + progressive encoding (or quality 60 if still too large)
- Other formats: Converted to JPEG with compression
- Requires ImageMagick installed (see imagemagick skill)

**Output includes compression info:**
```json
{
  "success": true,
  "output": "/path/to/page.png",
  "compressed": true,
  "originalSize": 8388608,
  "size": 3145728,
  "compressionRatio": "62.50%",
  "url": "https://example.com"
}
```

### Chain Commands (reuse browser)
```bash
# Keep browser open with --close false
bun navigate.ts --url https://example.com/login --close false
bun fill.ts --selector "#email" --value "user@example.com" --close false
bun fill.ts --selector "#password" --value "secret" --close false
bun click.ts --selector "button[type=submit]"
```

### Parse JSON Output
```bash
# Extract specific fields with jq
bun performance.ts --url https://example.com | jq '.vitals.LCP'

# Save to file
bun network.ts --url https://example.com --output /tmp/requests.json
```

## Execution Protocol

### Working Directory Verification

BEFORE executing any script:
1. Check current working directory with `pwd`
2. Verify in `.gemini/skills/chrome-devtools/scripts/` directory
3. If wrong directory, `cd` to correct location
4. Use absolute paths for all output files

Example:
```bash
pwd  # Should show: .../chrome-devtools/scripts
# If wrong:
cd .gemini/skills/chrome-devtools/scripts
```

### Output Validation

AFTER screenshot/capture operations:
1. Verify file created with `ls -lh <output-path>`
2. Read screenshot using Read tool to confirm content
3. Check JSON output for success:true
4. Report file size and compression status

Example:
```bash
bun screenshot.ts --url https://example.com --output ./docs/screenshots/page.png
ls -lh ./docs/screenshots/page.png  # Verify file exists
# Then use Read tool to visually inspect
```

5. Restart working directory to the project root.

### Error Recovery

If script fails:
1. Check error message for selector issues
2. Use snapshot.ts to discover correct selectors
3. Try XPath selector if CSS selector fails
4. Verify element is visible and interactive

Example:
```bash
# CSS selector fails
bun click.ts --url https://example.com --selector ".btn-submit"
# Error: waiting for selector ".btn-submit" failed

# Discover correct selector
bun snapshot.ts --url https://example.com | jq '.elements[] | select(.tagName=="BUTTON")'

# Try XPath
bun click.ts --url https://example.com --selector "//button[contains(text(),'Submit')]"
```

### Common Mistakes

❌ Wrong working directory → output files go to wrong location
❌ Skipping output validation → silent failures
❌ Using complex CSS selectors without testing → selector errors
❌ Not checking element visibility → timeout errors

✅ Always verify `pwd` before running scripts
✅ Always validate output after screenshots
✅ Use snapshot.ts to discover selectors
✅ Test selectors with simple commands first

## Common Workflows

### Web Scraping
```bash
bun evaluate.ts --url https://example.com --script "
  Array.from(document.querySelectorAll('.item')).map(el => ({
    title: el.querySelector('h2')?.textContent,
    link: el.querySelector('a')?.href
  }))
" | jq '.result'
```

### Performance Testing
```bash
PERF=$(bun performance.ts --url https://example.com)
LCP=$(echo $PERF | jq '.vitals.LCP')
if (( $(echo "$LCP < 2500" | bc -l) )); then
  echo "✓ LCP passed: ${LCP}ms"
else
  echo "✗ LCP failed: ${LCP}ms"
fi
```

### Form Automation
```bash
bun fill.ts --url https://example.com --selector "#search" --value "query" --close false
bun click.ts --selector "button[type=submit]"
```

### Error Monitoring
```bash
bun console.ts --url https://example.com --types error,warn --duration 5000 | jq '.messageCount'
```

## Script Options

All scripts support:
- `--headless false` - Show browser window
- `--close false` - Keep browser open for chaining
- `--timeout 30000` - Set timeout (milliseconds)
- `--wait-until networkidle2` - Wait strategy

See `./scripts/README.md` for complete options.

## Output Format

All scripts output JSON to stdout:
```json
{
  "success": true,
  "url": "https://example.com",
  ... // script-specific data
}
```

Errors go to stderr:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Finding Elements

Use `snapshot.ts` to discover selectors:
```bash
bun snapshot.ts --url https://example.com | jq '.elements[] | {tagName, text, selector}'
```

## Troubleshooting

### Common Errors

**"Cannot find package 'puppeteer'"**
- Run: `bun install` in the scripts directory

**"error while loading shared libraries: libnss3.so"** (Linux/WSL)
- Missing system dependencies
- Fix: Run `./install-deps.sh` in scripts directory
- Manual install: `sudo apt-get install -y libnss3 libnspr4 libasound2t64 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1`

**"Failed to launch the browser process"**
- Check system dependencies installed (Linux/WSL)
- Verify Chrome downloaded: `ls ~/.cache/puppeteer`
- Try: `bun install` again

**Chrome not found**
- Puppeteer auto-downloads Chrome during `bun install`
- If failed, manually trigger: `npx puppeteer browsers install chrome`

### Script Issues

**Element not found**
- Get snapshot first to find correct selector: `bun snapshot.ts --url <url>`

**Script hangs**
- Increase timeout: `--timeout 60000`
- Change wait strategy: `--wait-until load` or `--wait-until domcontentloaded`

**Blank screenshot**
- Wait for page load: `--wait-until networkidle2`
- Increase timeout: `--timeout 30000`

**Permission denied on scripts**
- Make executable: `chmod +x *.sh`

**Screenshot too large (>5MB)**
- Install ImageMagick for automatic compression
- Manually set lower threshold: `--max-size 3`
- Use JPEG format instead of PNG: `--format jpeg --quality 80`
- Capture specific element instead of full page: `--selector .main-content`

**Compression not working**
- Verify ImageMagick installed: `magick -version` or `convert -version`
- Check file was actually compressed in output JSON: `"compressed": true`
- For very large pages, use `--selector` to capture only needed area
