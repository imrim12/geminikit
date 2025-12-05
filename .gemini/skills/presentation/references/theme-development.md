# Theme Development

Creating custom themes for Slidev.

## Prerequisite: Design System
Before coding, you **MUST** define the design system. Use the `frontend-design` skill to generate:
1.  **Color Palette**: Primary, Secondary, Background, Surface, Text.
2.  **Typography**: Headings (H1-H6), Body, Code.
3.  **Spacing**: Margin/Padding scales.

## Theme Structure

A theme is typically a directory (local) or an npm package.

```
theme/
├── layouts/          # Vue components for layouts
│   ├── cover.vue
│   ├── default.vue
│   └── ...
├── styles/           # Global CSS
│   ├── index.css     # Main entry
│   └── layouts.css   # Layout specific styles
├── components/       # Custom components
├── uno.config.ts     # UnoCSS configuration
└── package.json
```

## Implementing Design Tokens (UnoCSS)

Map the `frontend-design` tokens to `uno.config.ts`.

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
      sans: 'Inter, sans-serif',
      mono: 'Fira Code, monospace',
    },
  },
})
```

## Layouts

Create Vue components in `layouts/`. `default.vue` is required.

### Example: `layouts/default.vue`

```vue
<template>
  <div class="slidev-layout default">
    <slot />
  </div>
</template>

<style>
.slidev-layout.default {
  @apply h-full w-full bg-white text-black p-10;
}
</style>
```

### Example: `layouts/cover.vue`

```vue
<template>
  <div class="slidev-layout cover h-full flex flex-col justify-center items-center bg-primary text-white">
    <div class="text-6xl font-bold">
      <slot name="default" /> <!-- Renders H1 -->
    </div>
    <div class="text-2xl opacity-75 mt-4">
      <slot name="subtitle" />
    </div>
  </div>
</template>
```

## Styling Classes

Adhere to standard Slidev classes for compatibility:
- `.slidev-layout`: Root class for all layouts.
- `.slidev-code-wrapper`: Wrapper for code blocks.
- `.slidev-icon-btn`: For buttons/icons.

## Overriding Styles
Put global overrides in `styles/index.css`.

```css
/* styles/index.css */
:root {
  --slidev-code-background: #1e1e1e;
}

.slidev-layout h1 {
  @apply text-4xl font-bold text-primary mb-4;
}
```
