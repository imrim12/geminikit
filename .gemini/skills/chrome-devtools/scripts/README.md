# Chrome DevTools Scripts

CLI scripts for browser automation using Puppeteer.

**CRITICAL**: Always check `pwd` before running scripts.

## Installation

### Quick Install

```bash
pwd  # Should show current working directory
cd .gemini/skills/chrome-devtools/scripts
./install.sh  # Auto-checks dependencies and installs
```

### Manual Installation

**Linux/WSL** - Install system dependencies first:
```bash
./install-deps.sh  # Auto-detects OS (Ubuntu, Debian, Fedora, etc.)
```

Or manually:
```bash
sudo apt-get install -y libnss3 libnspr4 libasound2t64 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1
```

**All platforms** - Install Node dependencies:
```bash
bun install
```

## Scripts

**CRITICAL**: Always check `pwd` before running scripts.

### navigate.ts
Navigate to a URL.

```bash
bun navigate.ts --url https://example.com [--wait-until networkidle2] [--timeout 30000]
```

### screenshot.ts
Take a screenshot with automatic compression.

**Important**: Always save screenshots to `./docs/screenshots` directory.

```bash
bun screenshot.ts --output screenshot.png [--url https://example.com] [--full-page true] [--selector .element] [--max-size 5] [--no-compress]
```

**Automatic Compression**: Screenshots >5MB are automatically compressed using ImageMagick to ensure compatibility with Gemini API and Claude Code. Install ImageMagick for this feature:
- macOS: `brew install imagemagick`
- Linux: `sudo apt-get install imagemagick`

Options:
- `--max-size N` - Custom size threshold in MB (default: 5)
- `--no-compress` - Disable automatic compression
- `--format png|jpeg` - Output format (default: png)
- `--quality N` - JPEG quality 0-100 (default: auto)

### click.ts
Click an element.

```bash
bun click.ts --selector ".button" [--url https://example.com] [--wait-for ".result"]
```

### fill.ts
Fill form fields.

```bash
bun fill.ts --selector "#input" --value "text" [--url https://example.com] [--clear true]
```

### evaluate.ts
Execute JavaScript in page context.

```bash
bun evaluate.ts --script "document.title" [--url https://example.com]
```

### snapshot.ts
Get DOM snapshot with interactive elements.

```bash
bun snapshot.ts [--url https://example.com] [--output snapshot.json]
```

### console.ts
Monitor console messages.

```bash
bun console.ts --url https://example.com [--types error,warn] [--duration 5000]
```

### network.ts
Monitor network requests.

```bash
bun network.ts --url https://example.com [--types xhr,fetch] [--output requests.json]
```

### performance.ts
Measure performance metrics and record trace.

```bash
bun performance.ts --url https://example.com [--trace trace.json] [--metrics] [--resources true]
```

## Common Options

- `--headless false` - Show browser window
- `--close false` - Keep browser open
- `--timeout 30000` - Set timeout in milliseconds
- `--wait-until networkidle2` - Wait strategy (load, domcontentloaded, networkidle0, networkidle2)

## Selector Support

Scripts that accept `--selector` (click.ts, fill.ts, screenshot.ts) support both **CSS** and **XPath** selectors.

### CSS Selectors (Default)

```bash
# Element tag
bun click.ts --selector "button" --url https://example.com

# Class selector
bun click.ts --selector ".btn-submit" --url https://example.com

# ID selector
bun fill.ts --selector "#email" --value "user@example.com" --url https://example.com

# Attribute selector
bun click.ts --selector 'button[type="submit"]' --url https://example.com

# Complex selector
bun screenshot.ts --selector "div.container > button.btn-primary" --output btn.png
```

### XPath Selectors

XPath selectors start with `/` or `(//` and are automatically detected:

```bash
# Text matching - exact
bun click.ts --selector '//button[text()="Submit"]' --url https://example.com

# Text matching - contains
bun click.ts --selector '//button[contains(text(),"Submit")]' --url https://example.com

# Attribute matching
bun fill.ts --selector '//input[@type="email"]' --value "user@example.com"

# Multiple conditions
bun click.ts --selector '//button[@type="submit" and contains(text(),"Save")]'

# Descendant selection
bun screenshot.ts --selector '//div[@class="modal"]//button[@class="close"]' --output modal.png

# Nth element
bun click.ts --selector '(//button)[2]'  # Second button on page
```

### Discovering Selectors

Use `snapshot.ts` to discover correct selectors:

```bash
# Get all interactive elements
bun snapshot.ts --url https://example.com | jq '.elements[]'

# Find buttons
bun snapshot.ts --url https://example.com | jq '.elements[] | select(.tagName=="BUTTON")'

# Find inputs
bun snapshot.ts --url https://example.com | jq '.elements[] | select(.tagName=="INPUT")'
```

### Security

XPath selectors are validated to prevent injection attacks. The following patterns are blocked:
- `javascript:`
- `<script`
- `onerror=`, `onload=`, `onclick=`
- `eval(`, `Function(`, `constructor(`

Selectors exceeding 1000 characters are rejected (DoS prevention).

## Output Format

All scripts output JSON to stdout:

```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  ...
}
```

Errors are output to stderr:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "..."
}
```
