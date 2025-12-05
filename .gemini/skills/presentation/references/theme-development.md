# Theme Development

Creating custom themes for Slidev.

## Prerequisite: Design System
Before coding, you **MUST** define the design system. Use the `frontend-design` skill to generate:
1.  **Color Palette**: Primary, Secondary, Background, Surface, Text.
2.  **Typography**: Headings (H1-H6), Body, Code.
3.  **Spacing**: Margin/Padding scales.

## Theme Structure

For simple, single-project presentations, prefer a **Flat Structure**.

```
<project-root>/
├── slides.md
├── style.css         # Global styles
├── uno.config.ts     # UnoCSS configuration
└── components/       # Custom components
```

## Implementing Design Tokens (UnoCSS)

Map the `frontend-design` tokens to `uno.config.ts`.

**CRITICAL**: Define fonts as **strings**, not arrays.

```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: '#3B82F6', // Derived from frontend-design
      secondary: '#10B981',
    },
    fontFamily: {
      // Correct: String with quotes for font names with spaces
      sans: '"Inter", sans-serif',
      mono: '"Fira Code", monospace',
      
      // INCORRECT: Do NOT use arrays
      // sans: ['Inter', 'sans-serif'], 
    },
  },
})
```

## Global Styling (`style.css`)

Import this file in your `slides.md` using a `<style>` block.

```css
/* style.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

:root {
  --slidev-theme-primary: #3B82F6;
  --slidev-theme-bg: #ffffff;
  --slidev-code-bg: #1e1e1e;
}

.slidev-layout {
  font-family: 'Inter', sans-serif;
  background-color: var(--slidev-theme-bg);
}

/* Custom classes */
.my-card {
  @apply p-4 border border-gray-200 rounded shadow;
}
```

## Layouts

If you need custom Vue layouts, create them in a `layouts/` folder and referenced them in frontmatter.

```vue
<!-- layouts/my-layout.vue -->
<template>
  <div class="slidev-layout my-layout">
    <slot />
  </div>
</template>
```

Usage:
```markdown
---
layout: my-layout
---
```