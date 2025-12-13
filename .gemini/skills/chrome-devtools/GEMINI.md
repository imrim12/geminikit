---
name: chrome-devtools
description: Browser automation, debugging, and performance analysis using Puppeteer CLI scripts. Use for automating browsers, taking screenshots, analyzing performance, monitoring network traffic, web scraping, form automation, and JavaScript debugging.
license: Apache-2.0
---

# Chrome DevTools Agent Skill

Browser automation via executable Puppeteer scripts. All scripts output JSON for easy parsing.

## Prerequisites

### 1. Bun Runtime
The scripts are written in TypeScript and run using the Bun runtime.

### 2. System Dependencies (Linux/WSL only)
On Linux/WSL, Chrome requires system libraries. Install them first:

```bash
cd .gemini/skills/chrome-devtools/scripts
./install-deps.sh  # Auto-detects OS and installs required libs
```

**macOS/Windows**: Skip this step (dependencies bundled with Chrome).

### 3. ImageMagick (Optional, Recommended)
ImageMagick enables automatic screenshot compression to keep files under 5MB.

## Usage

**CRITICAL**: All scripts must be run with `bun` pointing to the full path.

### Core Automation

#### `navigate.ts`
Navigate to a URL.
```bash
bun .gemini/skills/chrome-devtools/scripts/navigate.ts --url https://example.com [--wait-until networkidle2] [--timeout 30000]
```

#### `screenshot.ts`
Capture screenshots (full page or element).
**Important**: Always save screenshots to `./docs/screenshots` directory.

```bash
bun .gemini/skills/chrome-devtools/scripts/screenshot.ts --output ./docs/screenshots/page.png [--url https://example.com] [--full-page true] [--selector .element] [--max-size 5] [--no-compress]
```

**Automatic Compression**: Screenshots >5MB are automatically compressed using ImageMagick to ensure compatibility with Gemini API.

#### `click.ts`
Click an element.
```bash
bun .gemini/skills/chrome-devtools/scripts/click.ts --selector ".button" [--url https://example.com] [--wait-for ".result"]
```

#### `fill.ts`
Fill form fields.
```bash
bun .gemini/skills/chrome-devtools/scripts/fill.ts --selector "#input" --value "text" [--url https://example.com] [--clear true]
```

#### `evaluate.ts`
Execute JavaScript in page context.
```bash
bun .gemini/skills/chrome-devtools/scripts/evaluate.ts --script "document.title" [--url https://example.com]
```

### Analysis & Monitoring

#### `snapshot.ts`
Get DOM snapshot with interactive elements. Use this to discover correct selectors.
```bash
bun .gemini/skills/chrome-devtools/scripts/snapshot.ts [--url https://example.com] [--output snapshot.json]
```

#### `console.ts`
Monitor console messages/errors.
```bash
bun .gemini/skills/chrome-devtools/scripts/console.ts --url https://example.com [--types error,warn] [--duration 5000]
```

#### `network.ts`
Track HTTP requests/responses.
```bash
bun .gemini/skills/chrome-devtools/scripts/network.ts --url https://example.com [--types xhr,fetch] [--output requests.json]
```

#### `performance.ts`
Measure Core Web Vitals and record traces.
```bash
bun .gemini/skills/chrome-devtools/scripts/performance.ts --url https://example.com [--trace trace.json] [--metrics]
```

## Selector Support

Scripts accepting `--selector` support **CSS** (default) and **XPath** (starts with `/` or `(//`).

## Execution Protocol

### Output Validation
AFTER screenshot/capture operations:
1. Verify file created with `ls -lh <output-path>`
2. Check JSON output for `success: true`

### Error Recovery
If script fails:
1. Check error message.
2. Use `snapshot.ts` to discover correct selectors.
3. Try XPath selector if CSS selector fails.
