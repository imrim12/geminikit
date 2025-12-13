# Workflow Routing Logic

The `recording-analysis` skill uses an adaptive routing strategy to ensure stability across different environments.

## Decision Flow

1.  **Hardware Check**:
    -   Does `nvidia-smi` return success?
        -   **No**: Route to **CPU Track** (PaddleOCR).
        -   **Yes**: Proceed to Software Check.

2.  **Software Check**:
    -   Can PyTorch access CUDA? (`torch.cuda.is_available()`)
        -   **No**:
            -   **Status**: `NEEDS_SETUP`.
            -   **Action**: Halt execution. Generate `CUDA_SETUP_GUIDE.md`.
        -   **Yes**: Route to **GPU Track** (OmniParser).

## Backends

| Backend | Hardware | Use Case | Performance |
| :--- | :--- | :--- | :--- |
| **OmniParser** | GPU (NVIDIA) | Complex UI analysis, Icon detection, Screen parsing | High (requires VRAM) |
| **PaddleOCR** | CPU | Text extraction only, basic layout analysis | Low (Universal compatibility) |
