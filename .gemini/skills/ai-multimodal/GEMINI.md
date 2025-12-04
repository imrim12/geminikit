---
name: ai-multimodal
description: Process and generate multimedia content using Google Gemini API. Capabilities include audio transcription, image understanding, video analysis, document extraction, and image generation. Supports all file formats and utilizes the `gemini` CLI capabilities.
---

# AI Multimodal Processing Skill

Process audio, images, videos, and documents using the Google Gemini API via optimized scripts.

## Core Capabilities

*   **Audio**: Transcription, summarization, analysis.
*   **Image**: Description, object detection, visual Q&A.
*   **Video**: Summarization, scene detection, Q&A.
*   **Document**: PDF parsing, extraction, markdown conversion.
*   **Generation**: Text-to-image (via model capabilities).

## Scripts

All scripts are located in `.gemini/skills/ai-multimodal/scripts/` and run with `bun`.

### `process.ts`
Batch process multiple files for analysis or extraction.

```bash
bun .gemini/skills/ai-multimodal/scripts/process.ts --files <files> --task <task> --prompt <prompt>
```

**Tasks:**
*   `transcribe`: For audio/video.
*   `analyze`: For images/video.
*   `extract`: For documents (PDF).
*   `generate`: For image generation (no input file).

### `optimize.ts`
Optimize media files before processing (resize, compress, split).

```bash
bun .gemini/skills/ai-multimodal/scripts/optimize.ts --input <file> --output <file> [options]
```

**Options:**
*   `--target-size <MB>`
*   `--split` (for long videos)
*   `--quality <0-100>`

## Quick Start

**Analyze an Image:**
```bash
gemini multimodal analyze "Describe this image" --files image.jpg
```

**Transcribe Audio:**
```bash
gemini multimodal transcribe "Full transcript with timestamps" --files meeting.mp3
```

**Extract PDF to JSON:**
```bash
gemini multimodal extract "Extract table data" --files doc.pdf --format json
```

## Configuration

Ensure `GEMINI_API_KEY` is set in your environment or `.env` file.
