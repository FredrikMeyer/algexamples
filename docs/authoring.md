# Authoring Guide

## Adding a new example

### Quickstart (interactive CLI)

```bash
npm run add-post
```

The wizard prompts for every required field and writes a skeleton file to
`content/examples/{slug}.md`. Open that file and write the body below the
frontmatter.

### Manual creation

Create `content/examples/{slug}.md`. The slug must be lowercase alphanumeric
with hyphens (`[a-z0-9-]+`) and should match the filename.

---

## Frontmatter reference

### Fields shared by all types

| Field        | Type                                           | Required | Notes                                    |
| ------------ | ---------------------------------------------- | -------- | ---------------------------------------- |
| `title`      | string                                         | yes      | Display name                             |
| `slug`       | string                                         | yes      | URL segment; must match filename         |
| `type`       | `variety` \| `computation` \| `counterexample` | yes      | Controls which extra fields are required |
| `field`      | enum                                           | yes      | See values below                         |
| `summary`    | string                                         | yes      | One sentence shown in listings           |
| `tags`       | string[]                                       | no       | Free-form; default `[]`                  |
| `related`    | string[]                                       | no       | Slugs of related examples; default `[]`  |
| `references` | string[]                                       | no       | Citation strings                         |
| `links`      | `{url, label}[]`                               | no       | External links                           |
| `concepts`   | string[]                                       | no       | Controlled-vocabulary concept tags       |

**`field` enum values:**
`algebraic-geometry`, `commutative-algebra`, `algebraic-topology`,
`number-theory`, `complex-geometry`

### `type: variety` — extra fields

```yaml
properties:
  dimension: 3 # non-negative integer
  ambient_space: '$\PP^4$' # LaTeX string, e.g. "$\PP^3$"
  degree: 5 # positive integer
  singularities: smooth # free string
  genus: 0 # non-negative integer
  is_rational: true # boolean
  kodaira_dimension: "-inf" # integer, "-inf", or null
  picard_group: '$\ZZ$' # LaTeX string
  hodge_numbers: # map "pq" → integer
    "11": 1
    "12": 101
```

### `type: computation` — extra fields

```yaml
computes: "sheaf cohomology H*(Y, O_Y)" # required; what is produced
object: "twisted-cubic" # optional slug of the variety
techniques:
  - Serre duality
  - adjunction formula
```

### `type: counterexample` — extra fields

```yaml
refutes: "Every finite morphism of affine schemes is flat." # required
```

---

## Full examples

### Variety

```markdown
---
title: "The Twisted Cubic"
slug: twisted-cubic
type: variety
field: algebraic-geometry
tags: [curves, projective-space, rational-curves, degree-3]
summary: "The image of the degree-3 Veronese embedding of ℙ¹ into ℙ³."
related: []
references:
  - "Hartshorne, Ex. I.2.9"
links:
  - url: "https://en.wikipedia.org/wiki/Twisted_cubic"
    label: "Wikipedia — Twisted cubic"
properties:
  dimension: 1
  ambient_space: '$\PP^3$'
  degree: 3
  singularities: smooth
  genus: 0
  is_rational: true
  kodaira_dimension: "-inf"
---

The **twisted cubic** is the curve $C \subset \PP^3$ parametrized by

$$
[s:t] \mapsto [s^3 : s^2 t : s t^2 : t^3].
$$
```

### Computation

```markdown
---
title: "Cohomology of the Quintic Threefold"
slug: quintic-threefold-cohomology
type: computation
field: algebraic-geometry
tags: [calabi-yau, hodge-numbers, cohomology]
summary: 'Compute $H_*(Y, \OO_Y)$ and Hodge numbers for a degree-5 hypersurface in $\PP^4$.'
related: []
computes: "sheaf cohomology H*(Y, O_Y) and Hodge numbers h^{pq}"
techniques:
  - ideal sheaf sequence
  - adjunction formula
  - Serre duality
---

Body here.
```

### Counterexample

```markdown
---
title: "A Non-Flat Morphism"
slug: non-flat-morphism
type: counterexample
field: algebraic-geometry
tags: [flatness, morphisms]
summary: "The projection of the union of two coordinate axes to one axis is not flat."
related: []
refutes: "Every finite morphism of affine schemes is flat."
---

Body here.
```

---

## LaTeX

Math is rendered by **KaTeX**. Use standard LaTeX delimiters:

- Inline: `$f: X \to Y$`
- Display: content must be on its own line between `$$` fences:

  ```
  $$
  H^*(X, \mathbb{Z})
  $$
  ```

  A single-line `$$...$$` is parsed as inline math and will **not** be centred.

### Custom macros

The following shorthands are defined site-wide:

| Macro   | Expands to            | Meaning          |
| ------- | --------------------- | ---------------- |
| `\PP`   | `\mathbb{P}`          | Projective space |
| `\AA`   | `\mathbb{A}`          | Affine space     |
| `\OO`   | `\mathcal{O}`         | Structure sheaf  |
| `\kk`   | `\mathbb{k}`          | Ground field     |
| `\ZZ`   | `\mathbb{Z}`          | Integers         |
| `\QQ`   | `\mathbb{Q}`          | Rationals        |
| `\RR`   | `\mathbb{R}`          | Reals            |
| `\CC`   | `\mathbb{C}`          | Complex numbers  |
| `\Spec` | `\operatorname{Spec}` | Spectrum         |
| `\Proj` | `\operatorname{Proj}` | Proj             |
| `\Hom`  | `\operatorname{Hom}`  | Hom              |
| `\End`  | `\operatorname{End}`  | Endomorphisms    |
| `\Ext`  | `\operatorname{Ext}`  | Ext              |
| `\Tor`  | `\operatorname{Tor}`  | Tor              |

Examples:

```latex
$\PP^3$, $\AA^n$, $\OO_X$, $\Spec A$, $\Hom(F, G)$
$$\Ext^i(\mathcal{F}, \omega_X) \cong H^{n-i}(X, \mathcal{F})^\vee$$
```

### Matrices and aligned equations

Standard KaTeX environments work:

```latex
$$\begin{pmatrix} x_0 & x_1 & x_2 \\ x_1 & x_2 & x_3 \end{pmatrix}$$

$$\begin{aligned}
  H^0(Y, \OO_Y) &\cong k \\
  H^i(Y, \OO_Y) &= 0 \quad (0 < i < n)
\end{aligned}$$
```

---

## Commutative diagrams

Use a fenced code block tagged `tikzcd`:

````markdown
```tikzcd
0 \arrow[r] & \mathcal{F} \arrow[r] \arrow[d, "\phi"] & \mathcal{G} \arrow[r] & \mathcal{H} \arrow[r] & 0 \\
0 \arrow[r] & \mathcal{F}' \arrow[r] & \mathcal{G}' \arrow[r] & \mathcal{H}' \arrow[r] & 0
```
````

The block is rendered as an SVG in the browser using TikZJax. Write diagrams
exactly as you would in a `tikzcd` LaTeX environment — no surrounding
`\begin{tikzcd}...\end{tikzcd}` wrapper needed.

### Arrow syntax

| Syntax                      | Result                    |
| --------------------------- | ------------------------- |
| `\arrow[r]`                 | right                     |
| `\arrow[d]`                 | down                      |
| `\arrow[rd]`                | diagonal (right-down)     |
| `\arrow[r, "f"]`            | labelled above            |
| `\arrow[r, "f"']`           | labelled below (note `'`) |
| `\arrow[r, hook]`           | injection hook            |
| `\arrow[r, two heads]`      | surjection                |
| `\arrow[r, dashed]`         | dashed                    |
| `\arrow[r, "\sim", sloped]` | isomorphism tick          |

### Example — short exact sequence

````markdown
```tikzcd
0 \arrow[r] & A \arrow[r, "f"] & B \arrow[r, "g"] & C \arrow[r] & 0
```
````

### Example — Cartesian square

````markdown
```tikzcd
X \times_Z Y \arrow[r] \arrow[d] & Y \arrow[d, "g"] \\
X \arrow[r, "f"'] & Z
```
````

---

## CAS code blocks

Use `macaulay2` or `sage` as the language tag to get syntax highlighting and
a copy button:

````markdown
```macaulay2
R = QQ[x,y,z,w]
I = minors(2, matrix{{x,y,z},{y,z,w}})
degree I
```
````

````markdown
```sage
R.<x,y,z,w> = QQ[]
I = R.ideal([y*z - x*w, x^2*w - x*y*z, y^3 - x^2*z])
I.degree()
```
````
