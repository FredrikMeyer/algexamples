# Algebraic Geometry Examples — Core Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a statically-prerendered, searchable reference database of algebraic geometry examples with TypeScript, TanStack Start, and Markdown content files.

**Architecture:** TanStack Start with `preset: 'static'` prerendering serves as the framework. Content lives in `content/examples/*.md` with YAML frontmatter validated by Zod at build time. Route loaders read and process Markdown at prerender time; Pagefind indexes the static HTML for client-side search. Site-wide LaTeX macros and automatic backlinks are computed at build time.

**Tech Stack:** TanStack Start 1.x, React 19, TypeScript 5, Zod 3, gray-matter, unified + remark + rehype, rehype-katex, rehype-highlight, Pagefind, Tailwind CSS 4, Vitest

---

## File Structure

```
app/
  routes/
    __root.tsx          # root layout: HTML shell, sidebar, CSS imports
    index.tsx           # homepage: search, counts, recent entries
    examples/
      index.tsx         # /examples — listing with type/field/tag filters
      $slug.tsx         # /examples/$slug — individual example permalink
    varieties/
      index.tsx         # /varieties — filterable properties table
    tags/
      $tag.tsx          # /tags/$tag — examples by tag
    fields/
      $field.tsx        # /fields/$field — examples by field
  lib/
    schema.ts           # Zod schemas for all three content types
    katex-macros.ts     # site-wide KaTeX macro definitions
    markdown.ts         # unified/remark/rehype pipeline
    content.ts          # filesystem loader: read, parse, validate all examples
    backlinks.ts        # build-time backlink graph inversion
  components/
    Sidebar.tsx         # foldable sidebar with fields + tags
    ExampleCard.tsx     # summary card used in listings
    ExampleMeta.tsx     # type-specific metadata panel (properties/computation/counterexample)
    PropertiesTable.tsx # variety properties table
    MarkdownBody.tsx    # renders pre-processed HTML + loads KaTeX CSS
    SearchWidget.tsx    # Pagefind UI wrapper
  styles/
    global.css          # Tailwind directives + KaTeX CSS import
  client.tsx            # TanStack Start client entry
  router.tsx            # router factory
  server.tsx            # TanStack Start server entry
app.config.ts           # TanStack Start config (static preset + prerender)
content/
  examples/             # .md files — one per example
tailwind.config.ts
tsconfig.json
vitest.config.ts
package.json
```

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `app.config.ts`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `app/client.tsx`
- Create: `app/router.tsx`
- Create: `app/server.tsx`

- [ ] **Step 1: Install TanStack Start and dependencies**

```bash
npm init -y
npm install @tanstack/react-start @tanstack/react-router react react-dom
npm install zod gray-matter unified remark-parse remark-math remark-rehype rehype-katex rehype-highlight rehype-stringify
npm install -D typescript @types/react @types/react-dom @types/node tailwindcss @tailwindcss/vite vitest @vitejs/plugin-react
```

- [ ] **Step 2: Write `package.json` scripts**

Replace the scripts section of `package.json`:

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build && pagefind --site .output/public",
    "start": "vinxi start",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["app/*"]
    }
  },
  "include": ["app", "content"]
}
```

- [ ] **Step 4: Write `app.config.ts`**

```ts
import { defineConfig } from '@tanstack/react-start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
})
```

- [ ] **Step 5: Write `app/router.tsx`**

```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanStackRouter({ routeTree })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

- [ ] **Step 6: Write `app/client.tsx`**

```tsx
import { StartClient } from '@tanstack/react-start'
import { createRouter } from './router'
import { hydrateRoot } from 'react-dom/client'

const router = createRouter()
hydrateRoot(document, <StartClient router={router} />)
```

- [ ] **Step 7: Write `app/server.tsx`**

```tsx
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createRouter } from './router'

export default createStartHandler({ createRouter })(defaultStreamHandler)
```

- [ ] **Step 8: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{tsx,ts,html}'],
} satisfies Config
```

- [ ] **Step 9: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: { '~': resolve(__dirname, 'app') },
  },
})
```

- [ ] **Step 10: Create content directory**

```bash
mkdir -p content/examples
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000` (may show 404 — routes not yet created)

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold TanStack Start project with TypeScript and Tailwind"
```

---

## Task 2: Define Zod schemas and types

**Files:**
- Create: `app/lib/schema.ts`
- Create: `app/lib/schema.test.ts`

- [ ] **Step 1: Write `app/lib/schema.ts`**

```ts
import { z } from 'zod'

export const FieldEnum = z.enum([
  'algebraic-geometry',
  'commutative-algebra',
  'algebraic-topology',
  'number-theory',
  'complex-geometry',
])

export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')

const BaseSchema = z.object({
  title: z.string().min(1),
  slug: SlugSchema,
  field: FieldEnum,
  tags: z.array(z.string()).default([]),
  summary: z.string().min(1),
  related: z.array(z.string()).default([]),
  references: z.array(z.string()).optional(),
  concepts: z.array(z.string()).optional(),
})

export const VarietyPropertiesSchema = z.object({
  dimension: z.number().int().nonnegative().optional(),
  ambient_space: z.string().optional(),
  degree: z.number().int().positive().optional(),
  singularities: z.string().optional(),
  genus: z.number().int().nonnegative().optional(),
  is_rational: z.boolean().optional(),
  kodaira_dimension: z
    .union([z.number().int(), z.literal('-inf')])
    .nullable()
    .optional(),
  picard_group: z.string().optional(),
  hodge_numbers: z.record(z.string(), z.number().int().nonnegative()).optional(),
})

export const VarietySchema = BaseSchema.extend({
  type: z.literal('variety'),
  properties: VarietyPropertiesSchema.optional(),
})

export const ComputationSchema = BaseSchema.extend({
  type: z.literal('computation'),
  object: z.string().optional(),
  computes: z.string().min(1),
  techniques: z.array(z.string()).default([]),
})

export const CounterexampleSchema = BaseSchema.extend({
  type: z.literal('counterexample'),
  refutes: z.string().min(1),
})

export const ExampleFrontmatterSchema = z.discriminatedUnion('type', [
  VarietySchema,
  ComputationSchema,
  CounterexampleSchema,
])

export type ExampleFrontmatter = z.infer<typeof ExampleFrontmatterSchema>
export type VarietyFrontmatter = z.infer<typeof VarietySchema>
export type ComputationFrontmatter = z.infer<typeof ComputationSchema>
export type CounterexampleFrontmatter = z.infer<typeof CounterexampleSchema>

export type Example = ExampleFrontmatter & { body: string }
export type VarietyExample = VarietyFrontmatter & { body: string }
```

- [ ] **Step 2: Write `app/lib/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { ExampleFrontmatterSchema } from './schema'

const validVariety = {
  title: 'Twisted Cubic',
  slug: 'twisted-cubic',
  type: 'variety' as const,
  field: 'algebraic-geometry' as const,
  tags: ['curves', 'projective-space'],
  summary: 'Degree-3 rational curve in P^3',
  related: [],
  properties: {
    dimension: 1,
    ambient_space: 'P^3',
    degree: 3,
    singularities: 'smooth',
    is_rational: true,
  },
}

describe('ExampleFrontmatterSchema', () => {
  it('parses a valid variety', () => {
    const result = ExampleFrontmatterSchema.safeParse(validVariety)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Twisted Cubic')
      expect(result.data.type).toBe('variety')
    }
  })

  it('defaults tags and related to empty arrays when omitted', () => {
    const input = { ...validVariety, tags: undefined, related: undefined }
    const result = ExampleFrontmatterSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'variety') {
      expect(result.data.tags).toEqual([])
      expect(result.data.related).toEqual([])
    }
  })

  it('rejects a variety with an invalid slug', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      ...validVariety,
      slug: 'Twisted Cubic',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a computation missing computes', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      title: 'Test',
      slug: 'test',
      type: 'computation',
      field: 'algebraic-geometry',
      summary: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('parses a counterexample', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      title: 'Non-flat morphism',
      slug: 'non-flat-morphism',
      type: 'counterexample',
      field: 'algebraic-geometry',
      summary: 'A morphism that is not flat',
      refutes: 'A finite morphism is always flat',
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: 5 tests pass

- [ ] **Step 4: Commit**

```bash
git add app/lib/schema.ts app/lib/schema.test.ts
git commit -m "feat: add Zod schemas for all three content types"
```

---

## Task 3: KaTeX macros and Markdown pipeline

**Files:**
- Create: `app/lib/katex-macros.ts`
- Create: `app/lib/markdown.ts`
- Create: `app/lib/markdown.test.ts`

- [ ] **Step 1: Write `app/lib/katex-macros.ts`**

```ts
export const katexMacros: Record<string, string> = {
  '\\PP': '\\mathbb{P}',
  '\\AA': '\\mathbb{A}',
  '\\OO': '\\mathcal{O}',
  '\\kk': '\\mathbb{k}',
  '\\ZZ': '\\mathbb{Z}',
  '\\QQ': '\\mathbb{Q}',
  '\\RR': '\\mathbb{R}',
  '\\CC': '\\mathbb{C}',
  '\\Spec': '\\operatorname{Spec}',
  '\\Proj': '\\operatorname{Proj}',
  '\\Hom': '\\operatorname{Hom}',
  '\\End': '\\operatorname{End}',
  '\\Ext': '\\operatorname{Ext}',
  '\\Tor': '\\operatorname{Tor}',
}
```

- [ ] **Step 2: Write `app/lib/markdown.ts`**

```ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { katexMacros } from './katex-macros'

export async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex, { macros: katexMacros, throwOnError: false })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify)
    .process(content)
  return String(result)
}
```

- [ ] **Step 3: Write `app/lib/markdown.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { processMarkdown } from './markdown'

describe('processMarkdown', () => {
  it('renders basic markdown to HTML', async () => {
    const html = await processMarkdown('# Hello\n\nWorld')
    expect(html).toContain('<h1>')
    expect(html).toContain('Hello')
    expect(html).toContain('<p>World</p>')
  })

  it('renders inline math with KaTeX', async () => {
    const html = await processMarkdown('The space $\\mathbb{P}^n$')
    expect(html).toContain('katex')
  })

  it('renders display math with KaTeX', async () => {
    const html = await processMarkdown('$$f: X \\to Y$$')
    expect(html).toContain('katex-display')
  })

  it('expands site-wide macro \\PP', async () => {
    const html = await processMarkdown('The space $\\PP^n$')
    // KaTeX expands \PP to \mathbb{P} — check rendered output contains P
    expect(html).toContain('katex')
    expect(html).not.toContain('undefined')
  })

  it('syntax-highlights a code block', async () => {
    const html = await processMarkdown('```python\nx = 1\n```')
    expect(html).toContain('hljs')
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all markdown tests pass (8 total including schema tests from Task 2)

- [ ] **Step 5: Commit**

```bash
git add app/lib/katex-macros.ts app/lib/markdown.ts app/lib/markdown.test.ts
git commit -m "feat: markdown pipeline with KaTeX macros and syntax highlighting"
```

---

## Task 4: Content loader

**Files:**
- Create: `app/lib/content.ts`
- Create: `app/lib/content.test.ts`
- Create: `content/examples/twisted-cubic.md` (seed)
- Create: `content/examples/non-flat-morphism.md` (seed)
- Create: `content/examples/quintic-threefold-cohomology.md` (seed)

- [ ] **Step 1: Write seed file `content/examples/twisted-cubic.md`**

```markdown
---
title: "The Twisted Cubic"
slug: "twisted-cubic"
type: variety
field: algebraic-geometry
tags: [curves, projective-space, rational-curves, degree-3]
summary: "The image of the degree-3 Veronese embedding of ℙ¹ into ℙ³."
related: []
references:
  - "Hartshorne, Ex. I.2.9"
  - "Eisenbud–Harris §1.1"
properties:
  dimension: 1
  ambient_space: "P^3"
  degree: 3
  singularities: smooth
  genus: 0
  is_rational: true
  kodaira_dimension: "-inf"
---

The **twisted cubic** is the curve $C \subset \PP^3$ parametrized by
$$[s:t] \mapsto [s^3 : s^2 t : s t^2 : t^3].$$

It is the simplest example of a projective curve that is **not a complete intersection**: it cannot be defined as the intersection of two hypersurfaces in $\PP^3$.

Its homogeneous ideal is generated by the three $2 \times 2$ minors of the matrix
$$\begin{pmatrix} x_0 & x_1 & x_2 \\ x_1 & x_2 & x_3 \end{pmatrix}.$$
```

- [ ] **Step 2: Write seed file `content/examples/non-flat-morphism.md`**

```markdown
---
title: "A Non-Flat Morphism"
slug: "non-flat-morphism"
type: counterexample
field: algebraic-geometry
tags: [flatness, modules, morphisms]
summary: "The projection of the union of two coordinate axes to one axis is not flat."
related: []
refutes: "Every finite morphism of affine schemes is flat."
references:
  - "Hartshorne, Ex. III.9.3"
---

Let $A = k[x]$ and $B = k[x,y]/(xy)$. The inclusion $A \hookrightarrow B$ given by $x \mapsto x$ corresponds to projecting the union of the $x$- and $y$-axes to the $x$-axis.

**Claim:** $B$ is not flat as an $A$-module.

Start with the exact sequence $0 \to (x) \to A \to k \to 0$ and tensor with $B$:
$$0 \to (x) \otimes_A B \to B \to k \otimes_A B \to 0.$$

The element $x \otimes y \in (x) \otimes_A B$ maps to $xy = 0 \in B$. Since $B$ has $k$-basis $\{x^i, y^j\}_{i,j \geq 0}$, the element $x \otimes y$ is nonzero in $(x) \otimes_A B$. Hence the map is not injective, so $B$ is not flat.
```

- [ ] **Step 3: Write seed file `content/examples/quintic-threefold-cohomology.md`**

```markdown
---
title: "Cohomology of the Quintic Threefold"
slug: "quintic-threefold-cohomology"
type: computation
field: algebraic-geometry
tags: [calabi-yau, hodge-numbers, hypersurface, cohomology]
summary: "Compute H*(Y, O_Y) and Hodge numbers for a degree-5 hypersurface in ℙ⁴."
related: []
object: ""
computes: "sheaf cohomology H*(Y, O_Y) and Hodge numbers h^{pq}"
techniques:
  - ideal sheaf sequence
  - adjunction formula
  - Serre duality
  - conormal sequence
references:
  - "Cox–Katz, Mirror Symmetry and Algebraic Geometry §1"
---

Let $Y \subset \PP^4$ be the zero locus of a general homogeneous polynomial of degree 5 — equivalently, a section of $\omega_{\PP^4}^\vee$. We compute $H^i(Y, \OO_Y)$ and the Hodge numbers $h^{pq}$.

**Step 1: Sheaf cohomology of $\OO_Y$.**

From the ideal sheaf sequence $0 \to \OO_P(-5) \to \OO_P \to i_* \OO_Y \to 0$ and the known cohomology of $\PP^4$, we get $H^i(Y, \OO_Y) \cong k$ for $i = 0, 3$ and $0$ otherwise.

**Step 2: Canonical bundle.**

By adjunction, $\omega_Y \cong i^* \omega_P \otimes \det(\mathcal{I}/\mathcal{I}^2)^\vee = \OO_Y(-5) \otimes \OO_Y(5) = \OO_Y$. So $Y$ is **Calabi–Yau**.

**Step 3: Hodge numbers.**

Using the conormal and Euler sequences: $h^{11} = 1$ and $h^{12} = 101$.
```

- [ ] **Step 4: Write `app/lib/content.ts`**

```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ExampleFrontmatterSchema, type Example, type ExampleFrontmatter } from './schema'

const EXAMPLES_DIR = path.join(process.cwd(), 'content', 'examples')

function parseExampleFile(filePath: string): Example {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = ExampleFrontmatterSchema.parse(data)
  return { ...frontmatter, body: content.trim() }
}

export function getAllExamples(): Example[] {
  const files = fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
  return files.map((f) => parseExampleFile(path.join(EXAMPLES_DIR, f)))
}

export function getExampleBySlug(slug: string): Example {
  const all = getAllExamples()
  const example = all.find((e) => e.slug === slug)
  if (!example) throw new Error(`Example not found: ${slug}`)
  return example
}

export function getExamplesByField(field: ExampleFrontmatter['field']): Example[] {
  return getAllExamples().filter((e) => e.field === field)
}

export function getExamplesByTag(tag: string): Example[] {
  return getAllExamples().filter((e) => e.tags.includes(tag))
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  getAllExamples().forEach((e) => e.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet).sort()
}

export function getAllFields(): ExampleFrontmatter['field'][] {
  const fieldSet = new Set<ExampleFrontmatter['field']>()
  getAllExamples().forEach((e) => fieldSet.add(e.field))
  return Array.from(fieldSet).sort()
}
```

- [ ] **Step 5: Write `app/lib/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { getAllExamples, getExampleBySlug, getAllTags } from './content'

describe('content loader', () => {
  it('loads at least the three seed examples', () => {
    const examples = getAllExamples()
    expect(examples.length).toBeGreaterThanOrEqual(3)
  })

  it('parses the twisted-cubic variety correctly', () => {
    const e = getExampleBySlug('twisted-cubic')
    expect(e.title).toBe('The Twisted Cubic')
    expect(e.type).toBe('variety')
    if (e.type === 'variety') {
      expect(e.properties?.dimension).toBe(1)
      expect(e.properties?.is_rational).toBe(true)
    }
  })

  it('parses the counterexample refutes field', () => {
    const e = getExampleBySlug('non-flat-morphism')
    expect(e.type).toBe('counterexample')
    if (e.type === 'counterexample') {
      expect(e.refutes).toMatch(/flat/)
    }
  })

  it('parses the computation computes field', () => {
    const e = getExampleBySlug('quintic-threefold-cohomology')
    expect(e.type).toBe('computation')
    if (e.type === 'computation') {
      expect(e.computes).toMatch(/cohomology/)
    }
  })

  it('body is non-empty for all seed examples', () => {
    getAllExamples().forEach((e) => {
      expect(e.body.length).toBeGreaterThan(10)
    })
  })

  it('getAllTags returns non-empty array', () => {
    const tags = getAllTags()
    expect(tags.length).toBeGreaterThan(0)
    expect(tags).toContain('curves')
  })

  it('throws for unknown slug', () => {
    expect(() => getExampleBySlug('does-not-exist')).toThrow()
  })
})
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: all 15 tests pass

- [ ] **Step 7: Commit**

```bash
git add app/lib/content.ts app/lib/content.test.ts content/
git commit -m "feat: content loader with filesystem reading and Zod validation"
```

---

## Task 5: Automatic backlinks

**Files:**
- Create: `app/lib/backlinks.ts`
- Create: `app/lib/backlinks.test.ts`

- [ ] **Step 1: Write `app/lib/backlinks.ts`**

```ts
import type { Example } from './schema'

export type BacklinkMap = Map<string, Example[]>

export function computeBacklinks(examples: Example[]): BacklinkMap {
  const map: BacklinkMap = new Map()
  for (const example of examples) {
    for (const relatedSlug of example.related) {
      if (!map.has(relatedSlug)) map.set(relatedSlug, [])
      map.get(relatedSlug)!.push(example)
    }
  }
  return map
}
```

- [ ] **Step 2: Write `app/lib/backlinks.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { computeBacklinks } from './backlinks'
import type { Example } from './schema'

const makeVariety = (slug: string, related: string[] = []): Example => ({
  type: 'variety',
  title: slug,
  slug,
  field: 'algebraic-geometry',
  tags: [],
  summary: 'test',
  related,
  body: '',
})

describe('computeBacklinks', () => {
  it('returns empty map when no related entries', () => {
    const map = computeBacklinks([makeVariety('a'), makeVariety('b')])
    expect(map.size).toBe(0)
  })

  it('inverts the related graph correctly', () => {
    const a = makeVariety('a', ['b'])
    const c = makeVariety('c', ['b'])
    const b = makeVariety('b')
    const map = computeBacklinks([a, b, c])
    expect(map.get('b')).toHaveLength(2)
    expect(map.get('b')!.map((e) => e.slug)).toContain('a')
    expect(map.get('b')!.map((e) => e.slug)).toContain('c')
  })

  it('does not create backlinks for entries that are not referenced', () => {
    const a = makeVariety('a', ['b'])
    const b = makeVariety('b')
    const map = computeBacklinks([a, b])
    expect(map.has('a')).toBe(false)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass including 3 new backlinks tests

- [ ] **Step 4: Commit**

```bash
git add app/lib/backlinks.ts app/lib/backlinks.test.ts
git commit -m "feat: build-time backlink graph computation"
```

---

## Task 6: Root layout and foldable sidebar

**Files:**
- Create: `app/styles/global.css`
- Create: `app/components/Sidebar.tsx`
- Create: `app/routes/__root.tsx`

- [ ] **Step 1: Write `app/styles/global.css`**

```css
@import "tailwindcss";
@import "katex/dist/katex.min.css";
@import "highlight.js/styles/github.css";

/* Prose styles for markdown content */
.prose {
  @apply max-w-none text-gray-900;
}
.prose h1 { @apply text-2xl font-bold mt-6 mb-3; }
.prose h2 { @apply text-xl font-semibold mt-5 mb-2; }
.prose h3 { @apply text-lg font-semibold mt-4 mb-2; }
.prose p  { @apply my-3 leading-relaxed; }
.prose ul { @apply list-disc pl-6 my-3; }
.prose ol { @apply list-decimal pl-6 my-3; }
.prose pre { @apply bg-gray-50 rounded p-4 overflow-x-auto my-4 text-sm; }
.prose code { @apply bg-gray-100 rounded px-1 text-sm font-mono; }
.prose pre code { @apply bg-transparent p-0; }
.prose a { @apply text-blue-600 hover:underline; }
.prose blockquote { @apply border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700; }
```

- [ ] **Step 2: Write `app/components/Sidebar.tsx`**

```tsx
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

const FIELDS = [
  { id: 'algebraic-geometry', label: 'Algebraic Geometry' },
  { id: 'commutative-algebra', label: 'Commutative Algebra' },
  { id: 'algebraic-topology', label: 'Algebraic Topology' },
  { id: 'number-theory', label: 'Number Theory' },
  { id: 'complex-geometry', label: 'Complex Geometry' },
] as const

interface SidebarProps {
  allTags: string[]
}

export function Sidebar({ allTags }: SidebarProps) {
  const [open, setOpen] = useState(true)
  const [showAllTags, setShowAllTags] = useState(false)
  const visibleTags = showAllTags ? allTags : allTags.slice(0, 12)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border rounded shadow text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? '✕' : '☰'}
      </button>

      <aside
        className={`
          ${open ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-200
          md:translate-x-0 md:static
          fixed top-0 left-0 h-full z-40
          w-64 bg-white border-r border-gray-200
          flex flex-col overflow-y-auto
          p-4
        `}
      >
        {/* Desktop collapse button */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <Link to="/" className="font-semibold text-gray-800 hover:text-blue-600">
            AG Examples
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Collapse sidebar"
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        {open && (
          <>
            <nav className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Browse by type
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to="/examples" search={{ type: 'variety' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Varieties
                  </Link>
                </li>
                <li>
                  <Link to="/examples" search={{ type: 'computation' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Computations
                  </Link>
                </li>
                <li>
                  <Link to="/examples" search={{ type: 'counterexample' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Counterexamples
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Fields
              </p>
              <ul className="space-y-1">
                {FIELDS.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/fields/$field"
                      params={{ field: f.id }}
                      className="block text-sm text-gray-700 hover:text-blue-600 py-0.5"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {allTags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((tag) => (
                    <Link
                      key={tag}
                      to="/tags/$tag"
                      params={{ tag }}
                      className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                {allTags.length > 12 && (
                  <button
                    onClick={() => setShowAllTags((s) => !s)}
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    {showAllTags ? 'Show fewer' : `+${allTags.length - 12} more`}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </aside>
    </>
  )
}
```

- [ ] **Step 3: Write `app/routes/__root.tsx`**

```tsx
import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/react-start'
import { getAllTags } from '~/lib/content'
import { Sidebar } from '~/components/Sidebar'
import '~/styles/global.css'

export const Route = createRootRoute({
  loader: () => ({ allTags: getAllTags() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Algebraic Geometry Examples' },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const { allTags } = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar allTags={allTags} />
          <main className="flex-1 min-w-0 p-6 md:p-8 max-w-4xl">
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Start dev server and check layout renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: sidebar visible with fields and type links; collapses on mobile.

- [ ] **Step 5: Commit**

```bash
git add app/styles/global.css app/components/Sidebar.tsx app/routes/__root.tsx
git commit -m "feat: root layout with foldable sidebar"
```

---

## Task 7: Example card component and homepage

**Files:**
- Create: `app/components/ExampleCard.tsx`
- Create: `app/routes/index.tsx`

- [ ] **Step 1: Write `app/components/ExampleCard.tsx`**

```tsx
import { Link } from '@tanstack/react-router'
import type { Example } from '~/lib/schema'

const TYPE_COLOURS: Record<Example['type'], string> = {
  variety: 'bg-blue-100 text-blue-700',
  computation: 'bg-green-100 text-green-700',
  counterexample: 'bg-orange-100 text-orange-700',
}

interface ExampleCardProps {
  example: Example
}

export function ExampleCard({ example }: ExampleCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <Link
          to="/examples/$slug"
          params={{ slug: example.slug }}
          className="font-medium text-gray-900 hover:text-blue-600"
        >
          {example.title}
        </Link>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLOURS[example.type]}`}>
          {example.type}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{example.summary}</p>
      <div className="flex flex-wrap gap-1">
        {example.tags.slice(0, 4).map((tag) => (
          <Link
            key={tag}
            to="/tags/$tag"
            params={{ tag }}
            className="text-xs bg-gray-100 text-gray-500 hover:text-blue-600 px-2 py-0.5 rounded"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/routes/index.tsx`**

```tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllExamples } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'
import type { Example } from '~/lib/schema'

export const Route = createFileRoute('/')({
  loader: () => {
    const all = getAllExamples()
    const counts = {
      variety: all.filter((e) => e.type === 'variety').length,
      computation: all.filter((e) => e.type === 'computation').length,
      counterexample: all.filter((e) => e.type === 'counterexample').length,
    }
    const recent = all.slice(-5).reverse()
    return { counts, recent, total: all.length }
  },
  component: HomePage,
})

function HomePage() {
  const { counts, recent, total } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Algebraic Geometry Examples
        </h1>
        <p className="text-gray-600">
          A reference database of concrete examples in algebraic geometry and related fields.
          {total > 0 && ` ${total} entries.`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {(
          [
            { type: 'variety', label: 'Varieties', count: counts.variety },
            { type: 'computation', label: 'Computations', count: counts.computation },
            { type: 'counterexample', label: 'Counterexamples', count: counts.counterexample },
          ] as const
        ).map(({ type, label, count }) => (
          <Link
            key={type}
            to="/examples"
            search={{ type }}
            className="border border-gray-200 rounded-lg p-4 bg-white text-center hover:border-blue-300 transition-colors"
          >
            <div className="text-2xl font-bold text-blue-600">{count}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Recently added</h2>
      <div className="space-y-3">
        {recent.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </div>

      {total === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          No examples yet. Add .md files to <code>content/examples/</code>.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Check homepage in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: title, 3 count tiles, 3 example cards for the seed files.

- [ ] **Step 4: Commit**

```bash
git add app/components/ExampleCard.tsx app/routes/index.tsx
git commit -m "feat: homepage with type counts and recent entries"
```

---

## Task 8: Examples listing page

**Files:**
- Create: `app/routes/examples/index.tsx`

- [ ] **Step 1: Write `app/routes/examples/index.tsx`**

```tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllExamples, getAllTags } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'
import { FieldEnum } from '~/lib/schema'

const searchSchema = z.object({
  type: z.enum(['variety', 'computation', 'counterexample']).optional(),
  field: FieldEnum.optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute('/examples/')({
  validateSearch: searchSchema,
  loader: () => ({
    examples: getAllExamples(),
    tags: getAllTags(),
  }),
  component: ExamplesPage,
})

function ExamplesPage() {
  const { examples, tags } = Route.useLoaderData()
  const { type, field, tag, q } = Route.useSearch()
  const navigate = useNavigate({ from: '/examples/' })

  const filtered = examples.filter((e) => {
    if (type && e.type !== type) return false
    if (field && e.field !== field) return false
    if (tag && !e.tags.includes(tag)) return false
    if (q) {
      const lower = q.toLowerCase()
      return (
        e.title.toLowerCase().includes(lower) ||
        e.summary.toLowerCase().includes(lower) ||
        e.tags.some((t) => t.toLowerCase().includes(lower))
      )
    }
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Examples</h1>
        <span className="text-sm text-gray-500">{filtered.length} results</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Filter by title or tag…"
          value={q ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
        />

        <select
          value={type ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, type: (e.target.value as any) || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          <option value="variety">Variety</option>
          <option value="computation">Computation</option>
          <option value="counterexample">Counterexample</option>
        </select>

        <select
          value={field ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, field: (e.target.value as any) || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">All fields</option>
          <option value="algebraic-geometry">Algebraic Geometry</option>
          <option value="commutative-algebra">Commutative Algebra</option>
          <option value="algebraic-topology">Algebraic Topology</option>
          <option value="number-theory">Number Theory</option>
          <option value="complex-geometry">Complex Geometry</option>
        </select>

        {(type || field || tag || q) && (
          <button
            onClick={() => navigate({ search: {} })}
            className="text-sm text-blue-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {tag && (
        <div className="mb-4 text-sm text-gray-600">
          Showing examples tagged <span className="font-medium">#{tag}</span>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm">No examples match these filters.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Check listing page in browser**

Open `http://localhost:3000/examples`. Expected: 3 seed examples listed, filters work to narrow results.

- [ ] **Step 3: Commit**

```bash
git add app/routes/examples/index.tsx
git commit -m "feat: examples listing page with client-side filtering"
```

---

## Task 9: Example detail page

**Files:**
- Create: `app/components/PropertiesTable.tsx`
- Create: `app/components/ExampleMeta.tsx`
- Create: `app/components/MarkdownBody.tsx`
- Create: `app/routes/examples/$slug.tsx`

- [ ] **Step 1: Write `app/components/PropertiesTable.tsx`**

```tsx
import type { VarietyFrontmatter } from '~/lib/schema'

type Props = { properties: NonNullable<VarietyFrontmatter['properties']> }

const LABELS: Record<string, string> = {
  dimension: 'Dimension',
  ambient_space: 'Ambient space',
  degree: 'Degree',
  singularities: 'Singularities',
  genus: 'Genus',
  is_rational: 'Rational?',
  kodaira_dimension: 'Kodaira dimension',
  picard_group: 'Picard group',
}

function formatValue(key: string, value: unknown): string {
  if (key === 'is_rational') return value ? 'yes' : 'no'
  if (key === 'ambient_space') {
    const s = String(value)
    return s.replace(/^P\^?(\d+)$/, 'ℙ$1').replace(/^A\^?(\d+)$/, '𝔸$1')
  }
  if (key === 'kodaira_dimension') return value === '-inf' ? '−∞' : String(value)
  return String(value)
}

export function PropertiesTable({ properties }: Props) {
  const entries = Object.entries(properties).filter(
    ([k, v]) => k !== 'hodge_numbers' && v !== undefined && v !== null
  )
  if (entries.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Properties
      </h2>
      <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
        <tbody>
          {entries.map(([key, val]) => (
            <tr key={key} className="border-b border-gray-100 last:border-0">
              <td className="py-1.5 px-3 text-gray-500 w-40">{LABELS[key] ?? key}</td>
              <td className="py-1.5 px-3 font-medium text-gray-900">{formatValue(key, val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/components/ExampleMeta.tsx`**

```tsx
import { Link } from '@tanstack/react-router'
import type { Example } from '~/lib/schema'
import { PropertiesTable } from './PropertiesTable'

export function ExampleMeta({ example }: { example: Example }) {
  if (example.type === 'variety') {
    return example.properties ? (
      <PropertiesTable properties={example.properties} />
    ) : null
  }

  if (example.type === 'computation') {
    return (
      <div className="mb-6 space-y-3 text-sm border border-gray-200 rounded p-4 bg-gray-50">
        {example.object && (
          <div>
            <span className="text-gray-500 mr-2">Object studied:</span>
            <Link
              to="/examples/$slug"
              params={{ slug: example.object }}
              className="text-blue-600 hover:underline"
            >
              → {example.object}
            </Link>
          </div>
        )}
        <div>
          <span className="text-gray-500 mr-2">Computes:</span>
          <span className="text-gray-900">{example.computes}</span>
        </div>
        {example.techniques.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-gray-500 mr-1">Techniques:</span>
            {example.techniques.map((t) => (
              <span key={t} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (example.type === 'counterexample') {
    return (
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded p-4 text-sm">
        <span className="font-semibold text-orange-800">Refutes: </span>
        <span className="text-orange-900">{example.refutes}</span>
      </div>
    )
  }

  return null
}
```

- [ ] **Step 3: Write `app/components/MarkdownBody.tsx`**

```tsx
interface Props { html: string }

export function MarkdownBody({ html }: Props) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

- [ ] **Step 4: Write `app/routes/examples/$slug.tsx`**

```tsx
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { getAllExamples, getExampleBySlug } from '~/lib/content'
import { computeBacklinks } from '~/lib/backlinks'
import { processMarkdown } from '~/lib/markdown'
import { ExampleMeta } from '~/components/ExampleMeta'
import { MarkdownBody } from '~/components/MarkdownBody'
import { ExampleCard } from '~/components/ExampleCard'

export const Route = createFileRoute('/examples/$slug')({
  loader: async ({ params }) => {
    let example
    try {
      example = getExampleBySlug(params.slug)
    } catch {
      throw notFound()
    }
    const all = getAllExamples()
    const backlinks = computeBacklinks(all)
    const referencedBy = backlinks.get(params.slug) ?? []
    const relatedExamples = example.related
      .map((slug) => all.find((e) => e.slug === slug))
      .filter(Boolean) as typeof all
    const html = await processMarkdown(example.body)
    return { example, html, referencedBy, relatedExamples }
  },
  component: ExamplePage,
  notFoundComponent: () => <p className="text-gray-500">Example not found.</p>,
})

const TYPE_LABELS: Record<string, string> = {
  variety: 'variety',
  computation: 'computation',
  counterexample: 'counterexample',
}

const FIELD_LABELS: Record<string, string> = {
  'algebraic-geometry': 'Algebraic Geometry',
  'commutative-algebra': 'Commutative Algebra',
  'algebraic-topology': 'Algebraic Topology',
  'number-theory': 'Number Theory',
  'complex-geometry': 'Complex Geometry',
}

function ExamplePage() {
  const { example, html, referencedBy, relatedExamples } = Route.useLoaderData()

  return (
    <article>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{example.title}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[example.type]}
          </span>
          <Link
            to="/fields/$field"
            params={{ field: example.field }}
            className="text-xs bg-gray-100 text-gray-600 hover:text-blue-600 px-2 py-0.5 rounded-full"
          >
            {FIELD_LABELS[example.field] ?? example.field}
          </Link>
          {example.tags.map((tag) => (
            <Link
              key={tag}
              to="/tags/$tag"
              params={{ tag }}
              className="text-xs bg-gray-100 text-gray-500 hover:text-blue-600 px-2 py-0.5 rounded"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <ExampleMeta example={example} />

      <MarkdownBody html={html} />

      {relatedExamples.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Related
          </h2>
          <div className="space-y-2">
            {relatedExamples.map((e) => (
              <ExampleCard key={e.slug} example={e} />
            ))}
          </div>
        </section>
      )}

      {referencedBy.length > 0 && (
        <section className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Referenced by
          </h2>
          <div className="space-y-2">
            {referencedBy.map((e) => (
              <ExampleCard key={e.slug} example={e} />
            ))}
          </div>
        </section>
      )}

      {example.references && example.references.length > 0 && (
        <section className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            References
          </h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {example.references.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
```

- [ ] **Step 5: Check detail pages in browser**

Open `http://localhost:3000/examples/twisted-cubic`. Expected: title, property table, markdown body with KaTeX math rendered, references section.

Open `http://localhost:3000/examples/non-flat-morphism`. Expected: orange "Refutes" banner.

Open `http://localhost:3000/examples/quintic-threefold-cohomology`. Expected: computation metadata panel, techniques tags, rendered math.

- [ ] **Step 6: Commit**

```bash
git add app/components/ app/routes/examples/\$slug.tsx
git commit -m "feat: example detail page with type-specific metadata and backlinks"
```

---

## Task 10: Varieties filter page

**Files:**
- Create: `app/routes/varieties/index.tsx`

- [ ] **Step 1: Write `app/routes/varieties/index.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { getAllExamples } from '~/lib/content'
import type { VarietyFrontmatter } from '~/lib/schema'

const searchSchema = z.object({
  dimension: z.coerce.number().optional(),
  ambient_space: z.string().optional(),
  singularities: z.string().optional(),
  is_rational: z.enum(['true', 'false']).optional(),
})

export const Route = createFileRoute('/varieties/')({
  validateSearch: searchSchema,
  loader: () => {
    const varieties = getAllExamples().filter(
      (e): e is VarietyFrontmatter & { body: string } => e.type === 'variety'
    )
    // Collect distinct filter values from data
    const dimensions = [...new Set(varieties.map((v) => v.properties?.dimension).filter((d): d is number => d !== undefined))].sort((a, b) => a - b)
    const ambientSpaces = [...new Set(varieties.map((v) => v.properties?.ambient_space).filter(Boolean) as string[])].sort()
    const singularityTypes = [...new Set(varieties.map((v) => v.properties?.singularities).filter(Boolean) as string[])].sort()
    return { varieties, dimensions, ambientSpaces, singularityTypes }
  },
  component: VarietiesPage,
})

function formatAmbientSpace(s: string): string {
  return s.replace(/^P\^?(\d+)$/, 'ℙ$1').replace(/^A\^?(\d+)$/, '𝔸$1')
}

function VarietiesPage() {
  const { varieties, dimensions, ambientSpaces, singularityTypes } = Route.useLoaderData()
  const { dimension, ambient_space, singularities, is_rational } = Route.useSearch()
  const navigate = useNavigate({ from: '/varieties/' })

  const filtered = varieties.filter((v) => {
    const p = v.properties ?? {}
    if (dimension !== undefined && p.dimension !== dimension) return false
    if (ambient_space && p.ambient_space !== ambient_space) return false
    if (singularities && p.singularities !== singularities) return false
    if (is_rational === 'true' && !p.is_rational) return false
    if (is_rational === 'false' && p.is_rational) return false
    return true
  })

  const hasFilters = dimension !== undefined || ambient_space || singularities || is_rational

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Varieties</h1>
        <span className="text-sm text-gray-500">{filtered.length} of {varieties.length}</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={dimension ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, dimension: e.target.value ? Number(e.target.value) : undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Any dimension</option>
          {dimensions.map((d) => (
            <option key={d} value={d}>dim {d}</option>
          ))}
        </select>

        <select
          value={ambient_space ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, ambient_space: e.target.value || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Any ambient space</option>
          {ambientSpaces.map((a) => (
            <option key={a} value={a}>{formatAmbientSpace(a)}</option>
          ))}
        </select>

        <select
          value={singularities ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, singularities: e.target.value || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Any singularities</option>
          {singularityTypes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={is_rational ?? ''}
          onChange={(e) => navigate({ search: (s) => ({ ...s, is_rational: (e.target.value as any) || undefined }) })}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Any rationality</option>
          <option value="true">rational</option>
          <option value="false">not rational</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => navigate({ search: {} })}
            className="text-sm text-blue-500 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-2 px-4 font-medium text-gray-500 hidden sm:table-cell">Dim</th>
              <th className="text-left py-2 px-4 font-medium text-gray-500 hidden md:table-cell">Ambient</th>
              <th className="text-left py-2 px-4 font-medium text-gray-500 hidden md:table-cell">Degree</th>
              <th className="text-left py-2 px-4 font-medium text-gray-500 hidden lg:table-cell">Singularities</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.slug} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="py-2 px-4">
                  <Link
                    to="/examples/$slug"
                    params={{ slug: v.slug }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {v.title}
                  </Link>
                  <p className="text-gray-400 text-xs mt-0.5">{v.summary}</p>
                </td>
                <td className="py-2 px-4 text-gray-700 hidden sm:table-cell">
                  {v.properties?.dimension ?? '—'}
                </td>
                <td className="py-2 px-4 text-gray-700 hidden md:table-cell">
                  {v.properties?.ambient_space ? formatAmbientSpace(v.properties.ambient_space) : '—'}
                </td>
                <td className="py-2 px-4 text-gray-700 hidden md:table-cell">
                  {v.properties?.degree ?? '—'}
                </td>
                <td className="py-2 px-4 text-gray-700 hidden lg:table-cell">
                  {v.properties?.singularities ?? '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">
                  No varieties match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Check varieties page in browser**

Open `http://localhost:3000/varieties`. Expected: table with twisted cubic, filter dropdowns functional.

- [ ] **Step 3: Commit**

```bash
git add app/routes/varieties/index.tsx
git commit -m "feat: varieties filter page with property-based filtering"
```

---

## Task 11: Tags and fields index pages

**Files:**
- Create: `app/routes/tags/$tag.tsx`
- Create: `app/routes/fields/$field.tsx`

- [ ] **Step 1: Write `app/routes/tags/$tag.tsx`**

```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getAllExamples, getAllTags, getExamplesByTag } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'

export const Route = createFileRoute('/tags/$tag')({
  loader: ({ params }) => {
    const allTags = getAllTags()
    if (!allTags.includes(params.tag)) throw notFound()
    return {
      tag: params.tag,
      examples: getExamplesByTag(params.tag),
    }
  },
  component: TagPage,
  notFoundComponent: () => <p className="text-gray-500">Tag not found.</p>,
})

function TagPage() {
  const { tag, examples } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        #{tag}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{examples.length} example{examples.length !== 1 ? 's' : ''}</p>
      <div className="space-y-3">
        {examples.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/routes/fields/$field.tsx`**

```tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getExamplesByField } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'
import { FieldEnum } from '~/lib/schema'

const FIELD_LABELS: Record<string, string> = {
  'algebraic-geometry': 'Algebraic Geometry',
  'commutative-algebra': 'Commutative Algebra',
  'algebraic-topology': 'Algebraic Topology',
  'number-theory': 'Number Theory',
  'complex-geometry': 'Complex Geometry',
}

export const Route = createFileRoute('/fields/$field')({
  loader: ({ params }) => {
    const parsed = FieldEnum.safeParse(params.field)
    if (!parsed.success) throw notFound()
    return {
      field: parsed.data,
      examples: getExamplesByField(parsed.data),
    }
  },
  component: FieldPage,
  notFoundComponent: () => <p className="text-gray-500">Field not found.</p>,
})

function FieldPage() {
  const { field, examples } = Route.useLoaderData()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {FIELD_LABELS[field] ?? field}
      </h1>
      <p className="text-gray-500 text-sm mb-6">{examples.length} example{examples.length !== 1 ? 's' : ''}</p>
      <div className="space-y-3">
        {examples.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Check tag and field pages in browser**

Open `http://localhost:3000/tags/curves`. Expected: twisted cubic listed.
Open `http://localhost:3000/fields/algebraic-geometry`. Expected: all 3 seed examples listed.

- [ ] **Step 4: Commit**

```bash
git add app/routes/tags/\$tag.tsx app/routes/fields/\$field.tsx
git commit -m "feat: tag and field index pages"
```

---

## Task 12: Static prerendering and build verification

**Files:**
- Modify: `app.config.ts`

- [ ] **Step 1: Update `app.config.ts` to list all dynamic routes for prerendering**

```ts
import { defineConfig } from '@tanstack/react-start/config'
import tailwindcss from '@tailwindcss/vite'
import { getAllExamples, getAllTags, getAllFields } from './app/lib/content'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: async () => {
        const examples = getAllExamples()
        const tags = getAllTags()
        const fields = getAllFields()
        return [
          '/',
          '/examples',
          '/varieties',
          ...examples.map((e) => `/examples/${e.slug}`),
          ...tags.map((t) => `/tags/${t}`),
          ...fields.map((f) => `/fields/${f}`),
        ]
      },
    },
  },
})
```

- [ ] **Step 2: Run build (without Pagefind for now)**

```bash
npx vinxi build
```

Expected: build completes, `.output/public/` contains index.html, examples/twisted-cubic/index.html, etc.

- [ ] **Step 3: Commit**

```bash
git add app.config.ts
git commit -m "feat: static prerender config for all dynamic routes"
```

---

## Task 13: Pagefind search integration

**Files:**
- Modify: `package.json` (build script already correct from Task 1)
- Create: `app/components/SearchWidget.tsx`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Install Pagefind**

```bash
npm install -D pagefind
```

- [ ] **Step 2: Write `app/components/SearchWidget.tsx`**

```tsx
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    pagefind?: {
      init: () => Promise<void>
      search: (query: string) => Promise<{
        results: Array<{
          data: () => Promise<{
            url: string
            meta: { title: string }
            excerpt: string
          }>
        }>
      }>
    }
  }
}

export function SearchWidget() {
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Pagefind is loaded from /pagefind/pagefind.js after build
    const script = document.createElement('script')
    script.type = 'module'
    script.textContent = `
      import * as pagefind from '/pagefind/pagefind.js';
      window.pagefind = pagefind;
      await pagefind.init();
    `
    document.head.appendChild(script)
  }, [])

  async function handleSearch(query: string) {
    if (!resultsRef.current) return
    if (!query.trim() || !window.pagefind) {
      resultsRef.current.innerHTML = ''
      return
    }
    const search = await window.pagefind.search(query)
    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()))
    resultsRef.current.innerHTML = items
      .map(
        (item) =>
          `<a href="${item.url}" class="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
            <div class="font-medium text-sm text-gray-900">${item.meta.title}</div>
            <div class="text-xs text-gray-500 mt-0.5">${item.excerpt}</div>
          </a>`
      )
      .join('')
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search examples…"
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div
        ref={resultsRef}
        className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto empty:hidden"
      />
    </div>
  )
}
```

- [ ] **Step 3: Add SearchWidget to the homepage in `app/routes/index.tsx`**

Add the import and render the widget in `HomePage` above the counts grid:

```tsx
import { SearchWidget } from '~/components/SearchWidget'

// Inside HomePage, before the counts grid:
<div className="mb-6 max-w-md">
  <SearchWidget />
</div>
```

- [ ] **Step 4: Run full build including Pagefind**

```bash
npm run build
```

Expected: build completes, `.output/public/pagefind/` directory created with index files.

- [ ] **Step 5: Serve and test search**

```bash
npx serve .output/public
```

Open `http://localhost:3000`. Type "cubic" in the search box. Expected: twisted cubic appears in results.

- [ ] **Step 6: Commit**

```bash
git add app/components/SearchWidget.tsx app/routes/index.tsx package.json
git commit -m "feat: Pagefind search integration"
```

---

## Task 14: CAS code snippets (Feature A)

**Files:**
- Modify: `app/lib/markdown.ts`
- Modify: `app/styles/global.css`

The author writes fenced code blocks tagged `macaulay2` or `sage` in markdown. We add a "Copy" button via a client-side script applied to those blocks.

- [ ] **Step 1: Add copy-button script to `app/styles/global.css`**

After the existing styles, add:

```css
/* CAS code blocks */
.cas-block {
  @apply relative my-4;
}
.cas-label {
  @apply text-xs font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded-t inline-block;
}
.cas-copy {
  @apply absolute top-0 right-0 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-0.5 rounded cursor-pointer;
}
```

- [ ] **Step 2: Add a rehype plugin for CAS blocks in `app/lib/markdown.ts`**

Replace the contents of `app/lib/markdown.ts`:

```ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import type { Root, Element } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { katexMacros } from './katex-macros'

const CAS_LANGUAGES = new Set(['macaulay2', 'sage'])

const rehypeCasBlocks: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (
      node.tagName !== 'pre' ||
      !parent ||
      index === undefined
    ) return

    const code = node.children[0] as Element | undefined
    if (!code || code.tagName !== 'code') return

    const classes = (code.properties?.className as string[]) ?? []
    const lang = classes.find((c) => c.startsWith('language-'))?.replace('language-', '')
    if (!lang || !CAS_LANGUAGES.has(lang)) return

    const label = lang === 'macaulay2' ? 'Macaulay2' : 'SageMath'
    const codeText = (code.children[0] as any)?.value ?? ''

    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['cas-block'] },
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['cas-label'] },
          children: [{ type: 'text', value: label }],
        },
        {
          type: 'element',
          tagName: 'button',
          properties: {
            className: ['cas-copy'],
            onclick: `navigator.clipboard.writeText(${JSON.stringify(codeText)})`,
          },
          children: [{ type: 'text', value: 'Copy' }],
        },
        node,
      ],
    }
    parent.children.splice(index, 1, wrapper)
  })
}

export async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex, { macros: katexMacros, throwOnError: false })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeCasBlocks)
    .use(rehypeStringify)
    .process(content)
  return String(result)
}
```

- [ ] **Step 3: Install `unist-util-visit`**

```bash
npm install unist-util-visit
```

- [ ] **Step 4: Add a Macaulay2 snippet to the twisted-cubic seed file**

Append to `content/examples/twisted-cubic.md`:

````markdown

## Macaulay2 verification

```macaulay2
R = QQ[x_0, x_1, x_2, x_3]
I = minors(2, matrix{{x_0,x_1,x_2},{x_1,x_2,x_3}})
C = variety I
dim C
degree C
```
````

- [ ] **Step 5: Run tests to verify markdown pipeline still passes**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6: Check CAS block in browser**

```bash
npm run dev
```

Open `http://localhost:3000/examples/twisted-cubic`. Expected: Macaulay2 block has a "Macaulay2" label and "Copy" button.

- [ ] **Step 7: Commit**

```bash
git add app/lib/markdown.ts app/styles/global.css content/examples/twisted-cubic.md package.json
git commit -m "feat: CAS code snippets with Macaulay2/SageMath labels and copy button"
```

---

## Self-review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| TanStack Start + TypeScript | Task 1 |
| Zod schema validation at build time | Task 2 |
| Markdown + YAML frontmatter | Task 4 |
| KaTeX math rendering | Task 3 |
| Site-wide LaTeX macros (H) | Task 3 |
| Content types: variety, computation, counterexample | Tasks 2, 9 |
| Variety properties table | Task 9 |
| Counterexample "Refutes" banner | Task 9 |
| Computation metadata panel | Task 9 |
| Sidebar with foldable behaviour | Task 6 |
| Homepage with counts + recent | Task 7 |
| Examples listing with filters | Task 8 |
| Individual example permalinks | Task 9 |
| Varieties filter page (D) | Task 10 |
| Tags pages | Task 11 |
| Fields pages | Task 11 |
| Static prerender config | Task 12 |
| Pagefind search | Task 13 |
| Automatic backlinks (D) | Task 5, 9 |
| CAS snippets (A) | Task 14 |

**Advanced features deferred to Plan 2:** B (TikZJax), C (Hodge diamond), E (Stacks tags), F (concept vocabulary), G (variety comparison).

**Placeholder scan:** None found.

**Type consistency:** `Example`, `ExampleFrontmatter`, `VarietyFrontmatter` defined in `schema.ts` Task 2 and imported consistently throughout. `BacklinkMap` defined in `backlinks.ts` Task 5 and used in `$slug.tsx` Task 9. `processMarkdown` returns `Promise<string>` in Task 3 and is awaited in Task 9.
