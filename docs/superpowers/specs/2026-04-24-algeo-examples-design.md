# Algebraic Geometry Examples — Design Spec

**Date:** 2026-04-24
**Author:** Fredrik Meyer

## Overview

A web-based reference database of concrete examples in algebraic geometry and related fields (commutative algebra, algebraic topology, number theory, complex geometry). Audience: university-level students and researchers. Content is authored by a single person for now, with community contributions as a future possibility.

## Stack

| Concern | Choice |
|---|---|
| Framework | TanStack Start (React) with static prerendering |
| Content | Markdown files + YAML frontmatter in `content/examples/` |
| Schema validation | Zod — validates frontmatter at build time |
| Math rendering | KaTeX via `remark-math` + `rehype-katex` |
| Search | Pagefind — indexes static HTML output, runs fully client-side |
| Deployment | Static output → GitHub Pages / Netlify / Vercel |

TanStack Start is chosen over Astro because it provides a natural upgrade path to SSR, user authentication, and a database backend if needed in the future — without changing frameworks.

## Content Model

Each example is a single `.md` file in `content/examples/`. YAML frontmatter carries structured metadata; the file body is narrative prose with LaTeX math.

### Shared fields (all types)

```yaml
title: string           # display name
slug: string            # stable URL segment → /examples/$slug
type: variety | computation | counterexample
field: algebraic-geometry | commutative-algebra | algebraic-topology | number-theory | complex-geometry
tags: string[]          # free-form keywords
summary: string         # one-line description shown in listings and search results
related: string[]       # slugs of related examples — rendered as cross-links
references: string[]?   # optional citations (textbook, paper, Stacks tag)
```

### Variety — extra fields

```yaml
properties:
  dimension: number?
  ambient_space: string?   # e.g. "P^3", "A^2"
  degree: number?
  singularities: string?   # e.g. "smooth", "nodal", "cuspidal"
  genus: number?
  is_rational: boolean?
  kodaira_dimension: number | "-inf" | null
  picard_group: string?
  # additional properties added as needed; all optional
```

Properties are all optional — entries don't need every field filled in. The rendered page shows a properties table for whatever is present.

### Computation — extra fields

```yaml
object: string?        # slug of a variety entry — renders as a cross-link
computes: string       # free text describing what is produced, e.g. "Hodge numbers"
techniques: string[]   # tools used, e.g. ["adjunction formula", "Serre duality"]
```

Computations are narrative step-by-step mathematical arguments in the style of worked examples (setup → argument → conclusion), as in the Algebraic Geometry Buzzlist (section 7).

### Counterexample — extra fields

```yaml
refutes: string   # the statement this example disproves
```

The rendered page shows a prominent "Refutes: …" banner at the top.

## Routes

| Route | Description |
|---|---|
| `/` | Homepage: search bar, type counts, foldable sidebar, recently added |
| `/examples` | Full listing, filterable by type / field / tag |
| `/examples/$slug` | Individual example page (stable permalink) |
| `/varieties` | Browse varieties, filter by property (dimension, ambient space, singularities, etc.) |
| `/tags/$tag` | All examples with a given tag |
| `/fields/$field` | All examples in a given field |

## Layout

Sidebar layout with a **foldable sidebar** containing:
- Field navigation links
- Popular / all tags

Sidebar collapses on mobile automatically and can be toggled on desktop. The main content area holds the search bar, listings, and example detail pages.

### Individual example page structure

1. Title + type badge + field badge + tags
2. *(varieties only)* Properties table
3. *(computations only)* Object link, "Computes" line, Techniques tags
4. *(counterexamples only)* "Refutes" banner
5. Markdown body (prose + LaTeX math rendered with KaTeX)
6. Related examples (cross-links by slug)
7. References

## Varieties filter page (`/varieties`)

All variety data is embedded as JSON at build time. Filtering is purely client-side — no server required. Filter controls: dimension, ambient space, singularities, is_rational (and any other property with enough entries to be worth filtering). Results shown in a table with sortable columns.

## Search

Pagefind is run as a post-build step over the static HTML output. The search UI is a client-side widget on every page (accessible from the sidebar and the homepage). Searches across titles, summaries, tags, and body text.

## Authoring workflow

1. Create `content/examples/<slug>.md` with frontmatter + prose body
2. Run `npm run build` — Zod validates all frontmatter; build fails loudly on schema errors
3. Static site rebuilds with the new example at `/examples/<slug>`
4. Deploy (push to main → CI deploys)

No CMS, no database. Git is the source of truth. The `slug` field in frontmatter is the stable permalink identifier — renaming the file does not break links as long as the slug is unchanged.

## Future considerations

- Community contributions: GitHub PR workflow (no backend needed) or a full submission form once SSR is enabled
- Advanced search / filtering: Pagefind handles the common case; Algolia or a server-side index if needed at scale
- User accounts / saved favourites: TanStack Start supports SSR adapters and API routes — this is a natural extension without rewriting the frontend
