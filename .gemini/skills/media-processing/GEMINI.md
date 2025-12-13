---
name: media-processing
description: Process multimedia files with FFmpeg (video/audio) and ImageMagick (images). Capabilities include format conversion, video encoding (H.264/H.265/VP9), optimization, resizing, audio extraction, and batch processing.
---

# Media Processing Skill

Process video, audio, and images using FFmpeg and ImageMagick command-line tools via optimized Bun scripts.

## Prerequisites

Before running any scripts, **you must verify** that the required tools are installed.

1.  **Bun**: Runtime for the scripts.
2.  **FFmpeg**: Video/Audio processing engine.
3.  **ImageMagick**: Image manipulation engine.

**IF TOOLS ARE MISSING:**
Refer to `references/installation.md` for OS-specific installation commands. You must install them before proceeding.

## When to Use

Use this skill when:
- Converting media formats (e.g., MKV to MP4, PNG to WebP).
- Optimizing video size/quality for web, mobile, or archive.
- Resizing, cropping, or modifying images in batch.
- Extracting audio from video files.
- Comparing video encoding settings.

## Scripts

All scripts are located in `.gemini/skills/media-processing/scripts/` and run with `bun`.

### `convert.ts`
Unified media converter for video, audio, and images. Auto-detects types.

```bash
bun .gemini/skills/media-processing/scripts/convert.ts --input <files> [--output <path>] [--preset web|archive|mobile]
```

**Presets:**
- `web`: Balanced quality/size (CRF 23, AAC 128k, JPEG 85)
- `archive`: High quality (CRF 18, AAC 192k, JPEG 95)
- `mobile`: Small size (CRF 26, AAC 96k, JPEG 80)

### `optimize.ts`
Advanced video optimization with granular control.

```bash
bun .gemini/skills/media-processing/scripts/optimize.ts --input <video> --output <out> [options]
```

**Options:**
- `--max-width`, `--max-height`: Resize constraints.
- `--fps`: Target frame rate.
- `--crf`: Quality factor (18-28).
- `--two-pass`: Enable two-pass encoding.
- `--compare`: Compare metrics (SSIM/PSNR/Size) between input and output.

### `resize.ts`
Batch image resizing and manipulation.

```bash
bun .gemini/skills/media-processing/scripts/resize.ts --inputs <files> --output <dir> [options]
```

**Strategies:**
- `fit`: Fit within dimensions (maintain aspect ratio).
- `fill`: Fill dimensions (crop excess).
- `cover`: Cover dimensions.
- `thumbnail`: Create square thumbnails.

## Protocols

1.  **Installation Check (MANDATORY)**:
    - **Step 1**: Detect OS (`cat /etc/os-release` or `systeminfo`).
    - **Step 2**: Check tools (`bun -v && ffmpeg -version && magick -version`).
    - **Step 3**: If missing, **INSTALL** using `references/installation.md` commands. Do not just report the error; fix it.
2.  **Dry Run**: Use `--dry-run` flag to preview commands if unsure about the outcome.
3.  **Path handling**: Ensure output directories exist or let the script create them.

## References

- `references/installation.md`: **Installation instructions for Bun, FFmpeg, ImageMagick.**
- `references/ffmpeg-encoding.md`: Codec guides.
- `references/imagemagick-batch.md`: Batch image processing patterns.
- `references/format-compatibility.md`: Format support matrix.