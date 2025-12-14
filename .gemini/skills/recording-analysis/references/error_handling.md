# Error Handling Protocols

## API Failures
If the Gemini API fails during execution, the orchestrator reports the failure and skips the affected frame or halts if critical.

### Common Errors

1.  **Authentication Error (401)**
    -   *Symptom*: "API keys are not supported by this API" or "Unauthorized".
    -   *Mitigation*: Verify `GEMINI_API_KEY` is a valid Google AI Studio key (starts with `AIza`).

2.  **Rate Limiting (429)**
    -   *Symptom*: Request failed due to too many requests.
    -   *Mitigation*: The script processes frames sequentially, but large batches might still trigger limits. Retry later.

3.  **FFmpeg Failures**
    -   *Symptom*: "FFmpeg frame extraction failed".
    -   *Mitigation*: Check if `ffmpeg` is installed and the input video file is not corrupted.

## File System Errors
-   **Missing Input**: Ensure the input video path is correct.
-   **Write Permissions**: Ensure the script has write access to create `.gemini/planning/` directories.