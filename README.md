# @thecodeorigin/geminikit

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
*   **Postinstall Setup**: Automatically configures the `.gemini` environment in your project root upon installation.

## Installation

To use this kit in your project:

```bash
bun add geminikit
# or
npm install geminikit
```

The `postinstall` script will automatically copy the `.gemini` configuration folder to your project root.

## Usage

### CLI Commands

Once installed, you can use the Gemini CLI with the provided skills. Ensure you have the Gemini CLI tool installed and configured.

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
