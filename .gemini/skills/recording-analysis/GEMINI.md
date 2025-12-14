---
name: recording-analysis
description: Video analysis pipeline using FFmpeg and Gemini Vision API (Vertex AI). Delegates frame analysis to screenshot-analysis tools.
---

# Recording Analysis Skill

Analyze video or screen recordings by extracting frames and processing them using the `screenshot-analysis` skill (Gemini Vision via Vertex AI).

## When to Use

Use this skill when:
- The user asks to "analyze this video" or "analyze this screen recording".
- You need to extract text or UI elements from a video file (time-based analysis).

**Note:** For single images, use the `screenshot-analysis` skill directly.

## Protocols

### 1. Configuration
Ensure `GCLOUD_PROJECT` (and optionally `GCLOUD_LOCATION`) are set in the environment and you are authenticated with Google Cloud.

### 2. Execution
Run the orchestrator script to process the video.
```bash
bun .gemini/skills/recording-analysis/scripts/orchestrator.ts --input <video-path>
```

## Architecture

1.  **Frame Extraction**: Extracts 1 frame per second using `ffmpeg`.
2.  **Analysis**: Calls `.gemini/skills/screenshot-analysis/scripts/inspect.ts` in batch mode to process all extracted frames using Gemini Vision.
3.  **Output**: Generates JSON structures and Markdown reports for each frame, plus a Design System cross-analysis if multiple frames are processed.

## References

- `references/workflow_routing.md`: Logic for backend selection (Direct API).
- `references/error_handling.md`: Handling API and FFmpeg failures.