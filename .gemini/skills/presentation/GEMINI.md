---
name: presentation
description: Create professional, developer-friendly presentations using Slidev. Converts Markdown to beautiful HTML slides with theming capabilities. Requires `frontend-design` for theme definition.
---

# Presentation Skill (Slidev)

Create and manage Slidev presentations. This skill handles scaffolding, content generation, and theme development.

## Prerequisites

- **Node.js** >= 18.0.0
- **Skill Dependency**: `frontend-design` (Required for custom themes)

## When to Use

- Creating technical presentations from Markdown.
- Building reusable slide themes.
- Exporting slides to PDF/SPA.
- When the user asks for "slides", "presentation", or "deck".

## Protocols

### 1. Initialization (New Project)
1.  **Check Environment**: Verify Node.js version.
2.  **Scaffold**: Run `npm init slidev@latest` (interactive) or manually create structure.
    - *Standard Structure*:
        ```
        slides.md
        package.json
        theme/ (optional)
        components/ (optional)
        public/
        ```
3.  **Install Dependencies**: `npm install`.

### 2. Theme Development (Custom Look)
**CRITICAL STEP**: You MUST use/simulate the `frontend-design` skill first to define the design system.

1.  **Design Phase**:
    -   Invoke `frontend-design` to generate a "Design System Specification" (Colors, Typography, Spacing).
    -   *If `frontend-design` is unavailable*: Ask user for primary colors and font preferences.
2.  **Implementation**:
    -   Create `theme/style.css` (Global styles).
    -   Create `theme/layouts/` (Vue components for layouts).
    -   Configure `uno.config.ts` for utility classes.
    -   Reference: `references/theme-development.md`.

### 3. Content Generation
1.  **Markdown Structure**:
    -   Use `---` separator for slides.
    -   Use Frontmatter for slide configuration (`layout`, `background`, `class`).
    -   Reference: `references/slidev-best-practices.md`.
2.  **Components**:
    -   Use `<v-click>` for animations.
    -   Use `<v-clicks>` for list animations.
    -   Use `Mermaid` for diagrams.

### 4. Export/Build
1.  **SPA**: `slidev build` -> Generates `dist/`.
2.  **PDF**: `slidev export` -> Generates PDF (requires Playwright).

## Key Commands

- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run export`: Export to PDF.

## References

- `references/slidev-best-practices.md`: Markdown syntax and component usage.
- `references/theme-development.md`: Creating themes and layouts.
- `references/slide-layouts.md`: Standard layout classes.
