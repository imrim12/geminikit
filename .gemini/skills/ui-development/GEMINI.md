---
name: ui-development
description: transforming screenshots into production-ready frontend code. Uses screenshot-analysis to generate technical specs, then prompts the LLM to write the code.
dependencies:
  - screenshot-analysis
---

# UI Development Skill

**Role:** Senior Frontend Developer (React/Mobile).

Transforms screenshots into high-fidelity code by first "seeing" the structure via analysis tools, then generating the implementation.

## When to Use
- User asks to "code this screenshot", "implement this UI", or "turn this image into a component".
- User provides a design mockup (image) and wants code.

## Protocols

### 1. Analysis Phase (The "Eyes")
**ALWAYS** run the bridge script first to get the technical spec. Do not hallucinate styles.

```bash
bun .gemini/skills/ui-development/scripts/bridge.ts --input <path-to-image>
```

### 2. Implementation Phase (The "Hands")
Read the **Frontend Spec Sheet** output from Step 1.
- **Strictly adhere** to the spatial relationships detected.
- **Utilize spatial data** for sizing and positioning, preferring flexible layouts (Flex/Grid) that match the *structure* shown in the spec.
- **Refine**: If the spec identifies a "User Avatar", implement it as a proper component (e.g., `<Avatar />`), not just a `div`.

## Workflow Example
1.  **User:** "Code this login screen." (attaches `login.png`)
2.  **Agent:** `bun .gemini/skills/ui-development/scripts/bridge.ts --input login.png`
3.  **Tool Output:**
    ```markdown
    # Frontend Spec Sheet
    ### 1. INPUT "Email"
    - Position: x=50, y=100
    - Size: w=250, h=40
    ...
    ```
4.  **Agent:** "I have analyzed the layout. Here is the React Native / React code..." (Generates code using the specs).