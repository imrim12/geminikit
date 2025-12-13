# Error Handling Protocols

## CUDA/GPU Failures
If the GPU backend (OmniParser) fails during execution (e.g., OOM), the orchestrator should NOT automatically fallback to CPU in the current version to avoid inconsistent results. Instead, it reports the failure.

### Common Errors

1.  **CUDA Out of Memory (OOM)**
    -   *Symptom*: Python script crashes with `RuntimeError: CUDA out of memory`.
    -   *Mitigation*: Reduce batch size or resolution. (Not yet implemented in v1).

2.  **Missing Libraries**
    -   *Symptom*: `ModuleNotFoundError`.
    -   *Mitigation*: Ensure `requirements.txt` is installed.

## Environment Diagnosis
The `diagnose.ts` script is the primary defense against environment errors. It must be run before any heavy lifting.
