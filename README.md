<div align="center">
  <p>Sponsored by <a href="https://developers.google.com/program">Google Developer Program</a></p>
  <p>Made with ❤️ by member of <a href="https://gdg.community.dev/gdg-cloud-da-nang/">GDG Cloud Da Nang</a></p>
</div>

---

# `geminikit`

A comprehensive Gemini CLI workspace kit configured as a Bun monorepo. This package provides a pre-configured environment with advanced AI skills and tools, ready to be dropped into any project.

## Features

*   **Skill System**: Modular skills for specialized tasks.
    *   **Chrome DevTools**: Browser automation, performance analysis, and debugging via Puppeteer.
    *   **Code Review**: Protocols for rigorous technical feedback reception, review requests, and verification gates.
    *   **Debugging**: Systematic framework (Investigation, Pattern Analysis, Hypothesis, Implementation) with root cause tracing.
    *   **Directus Manager**: Manage Directus content, schema, files, and flows via the Directus Model Context Protocol (MCP).
    *   **Frontend Design**: Aesthetic direction, strict frontend implementation rules, and high-quality image sourcing.
    *   **Media Processing**: FFmpeg and ImageMagick wrappers for optimized video/audio conversion and batch image processing.
    *   **Planning**: Structured impact analysis, architectural design, and detailed implementation planning.
    *   **Presentation**: Professional Slidev presentation generation using a "Think-Plan-Act" workflow.
    *   **Problem Solving**: Strategic techniques (Simplification Cascades, Inversion, etc.) to overcome blocks.
    *   **Recording Analysis**: Adaptive video/screen recording analysis using OmniParser (GPU) or PaddleOCR (CPU).
    *   **Research**: Deep technical research, documentation analysis, and report synthesis.
    *   **Sequential Thinking**: Structured, reflective thought process for decomposing complex problems.
*   **Bun Monorepo**: Optimized for speed and modern JavaScript development.
*   **TypeScript**: Full type safety across all scripts and tools.
*   **GeminiKit CLI (`gk`)**: Dedicated CLI to manage the environment and logs.

## Prerequisites & GPU Support (CUDA)

The `recording-analysis` skill and certain Python-based tools require specific setup for GPU acceleration.

### CUDA Setup Guide

It appears you have an NVIDIA GPU, but PyTorch cannot access it. This usually means the CUDA Toolkit is missing or mismatched.

#### Quick Fixes

**Windows**
1. Install the latest NVIDIA Drivers.
2. Install PyTorch with CUDA support:
   ```bash
   pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

**Linux**
1. Install NVIDIA drivers and CUDA toolkit:
   ```bash
   sudo apt install nvidia-cuda-toolkit
   ```
2. Reinstall PyTorch (see above).

## Installation

To use this kit in your project:

```bash
bun add geminikit
# or
npm install geminikit
# or
pnpm add geminikit
```

After installation, run the setup command to configure the `.gemini` environment:

```bash
npx gk setup
```

## Directus MCP Setup

To use the **Directus Manager** skill, you must configure the MCP server in your `.gemini/settings.json` file and provide authentication credentials.

### 1. Update `.gemini/settings.json`

Add the following configuration to the `mcpServers` object in your `.gemini/settings.json`:

```json
"directus": {
  "command": "npx",
  "args": [
    "-y",
    "dotenv-cli",
    "--",
    "npx",
    "@directus/content-mcp@latest"
  ],
  "env": {
    "DIRECTUS_URL": "http://your-directus-url:8055"
  }
}
```

### 2. Authentication

The Directus MCP server requires authentication. You must set **ONE** of the following sets of environment variables in your system or project context (e.g., via `.env` if using `dotenv-cli` or system variables):

*   **Option A (Recommended):** User Credentials
    *   `DIRECTUS_USER_EMAIL`: Your Directus user email.
    *   `DIRECTUS_USER_PASSWORD`: Your Directus user password.

*   **Option B:** Access Token
    *   `DIRECTUS_TOKEN`: A static access token for a Directus user.

Ensure `DIRECTUS_URL` is also set in the `env` section of the config or as an environment variable.

### Manual Installation & Troubleshooting

#### Manual Installation

If `npx gk setup` encounters issues, you might need to install `Bun.sh` and the `Gemini CLI` manually.

##### Install Bun.sh

Follow the official Bun.sh installation guide for your operating system:
*   **Windows**:
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```
    Alternatively, you can use `npm`:
    ```bash
    npm install -g bun
    # or
    pnpm install -g bun
    ```
*   **macOS / Linux**:
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```

After installation, verify `bun` is installed by running:
```bash
bun --version
```

##### Install Gemini CLI

```bash
npm install -g @google/generative-ai-cli
# or
pnpm install -g @google/generative-ai-cli
```
Verify `gemini` is installed by running:
```bash
gemini --version
```

#### Troubleshooting: Telemetry `.gemini` folder

The `npx gk setup` command is designed to create the `node_modules/.gemini` folder, which is crucial for telemetry and skill management. If, for any reason, this folder is not created automatically, you can create it manually:

```bash
mkdir -p node_modules/.gemini
```
(Note: `mkdir -p` works on Linux/macOS. For Windows, `mkdir node_modules\.gemini` or `New-Item -ItemType Directory -Force -Path "node_modules/.gemini"`)

#### Troubleshooting: pnpm and `gk` command

When using `pnpm`, you might encounter issues where the `gk` command is not automatically registered in your path, or its peer dependencies are not correctly linked. This is often due to `pnpm`'s strict linking model.

To ensure `gk` works as expected, add the following lines to your project's `.npmrc` file (create it if it doesn't exist):

```
shamefully-hoist=true
auto-install-peers=true
```

## GeminiKit CLI (`gk`)

The package includes a dedicated CLI tool `gk` for managing the GeminiKit environment.

```bash
# Setup the environment (install Bun, Gemini CLI, and configure .gemini)
npx gk setup

# Check the health of the installation
npx gk doctor

# View and manage telemetry logs
npx gk log

# Show version information
npx gk --version

# Show help
npx gk --help
```

## Usage

### Gemini CLI Skills

Once installed and setup, you can use the Gemini CLI with the provided skills.

```bash
# Start a planning session
gemini plan "Implement a new authentication system"

# Perform deep research
gemini research "Current state of quantum computing"

# Automate a browser task
gemini chrome "Take a screenshot of google.com"

# Process media (video/audio/images)
gemini media "Optimize this video for web"

# Analyze screen recordings or videos
gemini use-mcp "Analyze this screen recording for UI elements"

# Solve a blocking problem
gemini solve "I'm stuck on the database schema design"

# Review code or get feedback
gemini review "Please review my recent changes in src/auth"

# Generate a presentation
gemini use-mcp "Create a slide deck about Node.js performance"
```

### Direct Script Usage

You can also run the underlying scripts directly using `bun`:

```bash
# Run the sequential thinking processor
bun .gemini/skills/sequential-thinking/scripts/process-thought.ts --thought "Initial analysis" --number 1 --total 5

# Run a browser automation script
bun .gemini/skills/chrome-devtools/scripts/navigate.ts --url https://example.com

# Run media conversion
bun .gemini/skills/media-processing/scripts/convert.ts --input video.mkv --preset web
```

## Development

To contribute or modify this kit:

1.  Clone the repository.
2.  Run `bun install` to install dependencies.
3.  Make changes to skills in `.gemini/skills`.
4.  Run `bun tsc` to verify type safety.

## License

ISC

---

<div align="center">
  <p>Inspired by <a href="https://github.com/claudekit">claudekit.cc</a> and <a href="https://github.com/github/spec-kit">spec-kit</a></p>
</div>