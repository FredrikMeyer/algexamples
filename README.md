# Algebraic Geometry Examples

A searchable database of concrete examples in algebraic geometry and related fields.

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

## Build

```bash
npm run build      # static build → dist/client/ (also runs Pagefind indexing)
```

## Testing

```bash
npm test           # unit tests (Vitest)
npm run lint       # ESLint
npm run e2e        # Playwright screenshot tests
```

## Adding a new post

Run the interactive CLI:

```bash
npm run add-post
```

It will prompt you for all fields step by step:

1. **Type** — variety, computation, or counterexample
2. **Title** and **slug** (slug is auto-suggested from the title)
3. **Field** — algebraic-geometry, commutative-algebra, etc.
4. **Summary** — one sentence
5. **Tags** — pick from existing tags or add new ones
6. **Related** — link to other examples by slug
7. **Type-specific fields** (properties for varieties, `computes`/`techniques` for computations, `refutes` for counterexamples)
8. **Preview** — confirm before the file is written

The file is written to `content/examples/{slug}.md`. Open it and fill in the body below the frontmatter.

## Content format

Each example is a Markdown file with YAML frontmatter:

```markdown
---
type: variety
title: "The Twisted Cubic"
slug: twisted-cubic
field: algebraic-geometry
summary: "A smooth rational curve of degree 3 in P^3."
tags:
  - projective-space
  - curves
related: []
properties:
  dimension: 1
  ambient_space: "P^3"
  is_rational: true
---

Write the body here. LaTeX is supported: $f: X \to Y$ and display math:

$$H^*(X, \mathbb{Z})$$

Code blocks with language labels:

```macaulay2
R = QQ[x,y,z,w]
I = minors(2, matrix{{x,y,z},{y,z,w}})
degree I
```
```
