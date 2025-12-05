# Standard Slide Layouts

Slidev comes with built-in layouts. You can also define custom ones.

## Built-in Layouts

### `default`
The basic layout. Just content.
```markdown
---
layout: default
---
```

### `cover`
Centered content, usually for the first slide.
```markdown
---
layout: cover
---
# Title
## Subtitle
```

### `intro`
Introduction slide (often Author info).
```markdown
---
layout: intro
---
# Author Name
Bio...
```

### `center`
Vertically and horizontally centered content.
```markdown
---
layout: center
---
# Big Statement
```

### `two-cols`
Two columns layout.
```markdown
---
layout: two-cols
---
::left::
# Left
Content

::right::
# Right
Content
```

### `two-cols-header`
Header with two columns below.
```markdown
---
layout: two-cols-header
---
# Header

::left::
Left

::right::
Right
```

### `image-left` / `image-right`
Split screen with image.
```markdown
---
layout: image-right
image: https://source.unsplash.com/random
---
# Content
```

### `full`
Full width/height content without padding.
```markdown
---
layout: full
---
<img src="..." class="w-full h-full object-cover">
```

### `statement`
For big statements/quotes.
```markdown
---
layout: statement
---
# "Quotes"
```

### `fact`
Highlight a fact.
```markdown
---
layout: fact
---
# 99%
Users love this.
```
