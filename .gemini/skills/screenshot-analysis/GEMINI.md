---
name: screenshot-analysis
description: Structural UI analysis using Google's Gemini Vision API (Vertex AI). Extracts component types, text, bounding boxes, and detects design system patterns across multiple screens.
---

# Screenshot Analysis Skill

Analyzes screenshots to extract detailed structural information using Gemini Vision 1.5 Pro via **Google Cloud Vertex AI**. It supports single-image analysis and multi-image cross-analysis to identify reusable design components.

## When to Use

Use this skill when:
- The user asks to "inspect screenshot", "check UI layout", "analyze image", or "read this screen".
- You need to know the exact coordinates (`bbox`) of UI elements.
- You need to detect "Design System" patterns (reusable components) across multiple screens.
- Another skill (like `ui-development`) requests structural analysis.

## Protocols

### 1. Configuration
- **Environment Variables**: Ensure `GCLOUD_PROJECT` (required) and `GCLOUD_LOCATION` (optional, default: `us-central1`) are set.
- **Authentication**: Ensure you are authenticated with Google Cloud (e.g., `gcloud auth application-default login`) or have a service account key set up.
- **Dependencies**: Ensure `@google-cloud/vertexai` is installed.

### 2. Inspection
Run the inspection script. Supports single files, comma-separated lists, or directories.

```bash
# Single image
bun .gemini/skills/screenshot-analysis/scripts/inspect.ts --input "path/to/image.png"

# Multiple images
bun .gemini/skills/screenshot-analysis/scripts/inspect.ts --input "img1.png,img2.png"

# Directory (Batch)
bun .gemini/skills/screenshot-analysis/scripts/inspect.ts --input "./frames_dir"
```

**Outputs:**
- `structure-<slug>.json`: Raw JSON data.
- `report-<slug>.md`: Human-readable table with pixel coordinates.
- `analysis-reusable-components.md`: (Multi-image only) Report on detected reusable components.

### 3. Interpretation
- **Read the JSON output**.
- **Do not guess** coordinates; use the values provided in `box_2d`.
- Use `type` to identify the component (e.g., `Button`, `Input`).

## Troubleshooting
- If the script fails with API errors, verify `GCLOUD_PROJECT` is set and the Vertex AI API is enabled in your Google Cloud Console.
- Ensure input paths exist.