---
name: presentation
description: Create professional, developer-friendly presentations using Slidev. Converts Markdown to beautiful HTML slides with theming capabilities. Requires `frontend-design` for theme definition.
---

# Presentation Skill (Slidev)

Create and manage Slidev presentations. This skill handles scaffolding, content generation, theme development, and **mandatory verification**.

## Prerequisites

- **Node.js** >= 18.0.0
- **Runtime**: `bun` (Strictly preferred for speed and dependency resolution)
- **Skill Dependency**: `frontend-design` (Required for custom themes)

## When to Use

- Creating technical presentations from Markdown.
- Building reusable slide themes.
- Exporting slides to PDF/SPA.
- When the user asks for "slides", "presentation", or "deck".

## Protocols

### 1. Initialization (New Project)
1.  **Check Environment**: Verify Node.js version.
2.  **Scaffold**: 
    - **Preferred**: Run `bun create slidev <project-name>` (if interactive).
    - **Agent Mode**: If running autonomously without user input capability, **manually scaffold** the project with the **LATEST** flat structure to avoid complexity.
    - *Modern Flat Structure*:
        ```
        <project-name>/
        ├── slides.md           # Main entry
        ├── package.json        # Latest @slidev/cli, @slidev/theme-default, vue
        ├── uno.config.ts       # UnoCSS Config (Critical for theming)
        ├── style.css           # Global styles (Imported in slides.md)
        ├── components/         # Custom Vue components
        └── public/             # Static assets
        ```
3.  **Install Dependencies**: 
    - **Command**: `bun install`
    - **Rule**: Never assume dependencies are present. Always install immediately after scaffolding.

### 2. Theme Development (Custom Look)
**CRITICAL STEP**: You MUST use/simulate the `frontend-design` skill first to define the design system.

1.  **Design Phase**:
    -   Invoke `frontend-design` to generate a "Design System Specification".
2.  **Implementation**:
    -   Create `style.css` for global overrides (e.g., fonts, root variables).
    -   Configure `uno.config.ts` for utility classes and design tokens.
    -   **Important**: In `uno.config.ts`, define fonts as **strings**, not arrays, to avoid Vite build errors.
        -   ✅ `fontFamily: { sans: '"Roboto", sans-serif' }`
        -   ❌ `fontFamily: { sans: ['Roboto', 'sans-serif'] }`

### 3. Content Generation
1.  **Markdown Structure**:
    -   Use `---` separator for slides.
    -   Use Frontmatter for slide configuration (`layout`, `background`, `class`).
    -   Import global styles in the first slide:
        ```html
        <!-- slides.md -->
        <style>
        @import './style.css';
        </style>
        ```

### 4. Verification (MANDATORY)
Vite loads modules lazily, meaning runtime errors often hide until specific slides are accessed. To ensure the project is valid:

1.  **Run Build**: Execute `bun run build`.
    -   This forces a full compilation of all assets, fonts, and styles.
    -   It is the **only** way for a headless agent to verify the project works without a browser.
2.  **Fix Errors**: If the build fails (e.g., "fontFamily not found", "missing module"):
    -   Read the error log.
    -   Adjust `uno.config.ts` or `package.json`.
    -   **Retry** `bun run build` until successful.
3.  **Do NOT** simply run `dev` and assume it works. `dev` starts fast but crashes later. `build` proves correctness.

## Key Commands

- `bun install`: Install dependencies.
- `bun run dev`: Start dev server (User use).
- `bun run build`: **Agent Verification Command**.
- `bun run export`: Export to PDF.

## References

- `references/slidev-best-practices.md`: Markdown syntax and component usage.
- `references/theme-development.md`: Creating themes and layouts.
- `references/slide-layouts.md`: Standard layout classes.
