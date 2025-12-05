---
name: presentation
description: Create professional, developer-friendly presentations using Slidev. Converts Markdown to beautiful HTML slides with theming capabilities. Includes strict protocols for planning, research, narrative pacing (Click-and-Tell), and mandatory verification.
---

# Presentation Skill (Slidev)

Create and manage Slidev presentations. This skill enforces a rigorous "Think-Plan-Act" cycle to ensure presentations are tailored, well-researched, and impactful.

## Prerequisites

- **Node.js** >= 18.0.0
- **Runtime**: `bun` (Strictly preferred)
- **Skill Dependency**: `frontend-design` (Required for custom themes)

## When to Use

- Creating technical presentations from Markdown.
- Building reusable slide themes.
- When the user asks for "slides", "presentation", or "deck".

## Protocols

### 1. Discovery & Analysis (Context First)
**Before any code**, you must understand the "Where" and "Who".
1.  **Identify Context**: Analyze the request for event names, branding (e.g., Google DevFest, Company All-Hands), and target audience.
2.  **Determine Theme**: Select a visual direction (e.g., Neobrutalism, Minimalist, Corporate) based on the event's vibe.
3.  **Ask the User**:
    -   *"What is the duration of the talk?"*
4.  **Estimate Scale**:
    -   Suggest a slide count based on duration.
    -   *Rule of Thumb*: 1 slide per minute for standard content, but **3-5 slides per minute** for "Click-and-Tell" (see below).

### 2. Strategic Planning (The Blueprint)
**Do not start writing slides yet.**
1.  **Generate Structure**: Outline the main sections/arcs of the talk.
2.  **Headline Options**: For **EACH** main section, generate **3 distinct headline options** (e.g., Descriptive, Provocative, Abstract).
3.  **User Selection**: Present these options and **ASK** the user to choose manually.
4.  **Lock Plan**: Confirm the final outline.

### 3. Content Engineering (Research & Flow)
**Use the best model context available.**
1.  **Deep Research**: Perform online research for *each* selected headline to gather facts, benchmarks, and current data.
2.  **Elaborate Narrative**: Expand the original prompt into a full narrative. Do not settle for simple bullets.
3.  **"Click-and-Tell" Pattern**:
    -   Design for *speaking*, not reading.
    -   **Impact Bursting**: Identify strong, inspirational sentences (e.g., "WE MUST ACT NOW").
    -   **Split Slides**: Create a sequence of 4-5 rapid slides for these sentences (One word/phrase per slide) to control the speaker's pacing and impact.
    -   *Example*: Slide A: "WE" -> Slide B: "MUST" -> Slide C: "ACT" -> Slide D: "NOW!!!" (Big Typography).

### 4. Implementation (Slidev)
1.  **Scaffold**: 
    -   If interactive: `bun create slidev <project-name>`.
    -   If autonomous: Manually create the **Flat Structure** (see below).
    -   *Structure*:
        ```
        <project-name>/
        ├── slides.md           # Main entry
        ├── package.json        # @slidev/cli, @slidev/theme-default, vue
        ├── uno.config.ts       # UnoCSS Config (Critical for theming)
        ├── style.css           # Global styles
        ├── components/         # Custom Vue components
        └── public/             # Static assets
        ```
2.  **Theme Integration**:
    -   Use `frontend-design` principles in `uno.config.ts`.
    -   Define fonts as **strings** (e.g., `fontFamily: { sans: '"Roboto", sans-serif' }`).
3.  **Install**: `bun install` immediately.

### 5. Verification (MANDATORY)
**Runtime errors are lazy. Build to prove correctness.**
1.  **Execute**: `bun run build`.
2.  **Analyze**: If it fails (fonts, missing modules), FIX IT and RETRY.
3.  **Sign-off**: Only claim success after a clean build.

## Key Commands

- `bun install`: Install dependencies.
- `bun run dev`: Start dev server.
- `bun run build`: **Agent Verification Command**.
- `bun run export`: Export to PDF.

## References

- `references/slidev-best-practices.md`: Markdown syntax and component usage.
- `references/theme-development.md`: Creating themes and layouts.
- `references/slide-layouts.md`: Standard layout classes.