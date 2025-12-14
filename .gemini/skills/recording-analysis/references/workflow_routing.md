# Workflow Routing Logic

The `recording-analysis` skill uses a direct routing strategy to the Gemini Vision API.

## Decision Flow

1.  **Environment Check**:
    -   Is `GEMINI_API_KEY` set?
        -   **No**: Halt execution. Prompt user to set API key.
        -   **Yes**: Proceed to Analysis.

2.  **Execution**:
    -   All frames are processed via `.gemini/skills/screenshot-analysis/scripts/inspect.ts`.
    -   No local GPU/CPU selection is required.
    -   Processing is offloaded to the Gemini 1.5 Pro model.

## Backends

| Backend | Hardware | Use Case | Performance |
| :--- | :--- | :--- | :--- |
| **Gemini Vision API** | Cloud (Google) | Complex UI analysis, Icon detection, Screen parsing, Design System detection | High (Dependent on API latency) |