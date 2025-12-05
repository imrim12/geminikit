<div align="center">
  <p>Sponsored by <a href="https://developers.google.com/program">Google Developer Program</a></p>
  <p>Made with ❤️ by member of <a href="https://gdg.community.dev/gdg-cloud-da-nang/">GDG Cloud Da Nang</a></p>
</div>

---

# `geminikit`

A comprehensive Gemini CLI workspace kit configured as a Bun monorepo. This package provides a pre-configured environment with advanced AI skills and tools, ready to be dropped into any project.

## Features

*   **Skill System**: Modular skills for specialized tasks.
    *   **Sequential Thinking**: Structured problem-solving methodology.
    *   **Chrome DevTools**: Browser automation and debugging.
    *   **AI Multimodal**: Audio, video, and image processing.
    *   **Code Review**: Protocols for rigorous code analysis.
    *   **Planning**: Structured planning workflow.
    *   **Debugging**: Systematic debugging framework.
    *   **Research**: Deep research and report generation.
*   **Bun Monorepo**: optimized for speed and modern JavaScript development.
*   **TypeScript**: Full type safety across all scripts and tools.
*   **GeminiKit CLI (`gk`)**: Dedicated CLI to manage the environment and logs.

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

After creating the folder, you may need to re-run `npx gk setup` or manually copy the necessary skill files if they are missing.

#### Troubleshooting: pnpm and `gk` command

When using `pnpm`, you might encounter issues where the `gk` command is not automatically registered in your path, or its peer dependencies are not correctly linked. This is often due to `pnpm`'s strict linking model.

To ensure `gk` works as expected, add the following lines to your project's `.npmrc` file (create it if it doesn't exist):

```
shamefully-hoist=true
auto-install-peers=true
```

These settings tell `pnpm` to hoist dependencies similarly to `npm` and `yarn` (allowing direct access to hoisted packages) and to automatically install peer dependencies. After modifying `.npmrc`, run `pnpm install` again.

Alternatively, if you prefer not to modify `.npmrc` globally or per-project, you can manually install `geminikit`:

```bash
pnpm install -g geminikit
```
This ensures the `gk` command is available globally.

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

# Analyze media
gemini multimodal "Describe this image" --files image.jpg
```

### Direct Script Usage

You can also run the underlying scripts directly using `bun`:

```bash
# Run the sequential thinking processor
bun .gemini/skills/sequential-thinking/scripts/process-thought.ts --thought "Initial analysis" --number 1 --total 5

# Run a browser automation script
bun .gemini/skills/chrome-devtools/scripts/navigate.ts --url https://example.com
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
