#!/usr/bin/env tsx
/**
 * Interactive CLI for adding new algebraic geometry examples.
 * Run with: npm run add-post
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { input, select, checkbox, confirm } from '@inquirer/prompts'

// Resolve content directory relative to this script's location
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const EXAMPLES_DIR = path.join(PROJECT_ROOT, 'content', 'examples')

// ── Inline schema data (mirrors app/lib/schema.ts) ──────────────────────────

const FIELD_VALUES = [
  'algebraic-geometry',
  'commutative-algebra',
  'algebraic-topology',
  'number-theory',
  'complex-geometry',
] as const

type FieldValue = (typeof FIELD_VALUES)[number]
type ExampleType = 'variety' | 'computation' | 'counterexample'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent)
  return Object.entries(obj)
    .filter(
      ([, v]) =>
        v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0),
    )
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return `${pad}${k}:\n${v.map((item) => `${pad}  - ${JSON.stringify(item)}`).join('\n')}`
      }
      if (typeof v === 'object') {
        return `${pad}${k}:\n${toYaml(v as Record<string, unknown>, indent + 1)}`
      }
      return `${pad}${k}: ${JSON.stringify(v)}`
    })
    .join('\n')
}

function buildMarkdown(frontmatter: Record<string, unknown>): string {
  return `---\n${toYaml(frontmatter)}\n---\n\n<!-- Write your content here -->\n`
}

// ── Prompt helpers ───────────────────────────────────────────────────────────

async function promptTags(existingTags: string[]): Promise<string[]> {
  const selected: string[] = existingTags.length
    ? await checkbox({
        message: 'Select existing tags (space to toggle, enter to continue):',
        choices: existingTags.map((t) => ({ value: t, name: t })),
      })
    : []

  // Loop: add new tags until blank input
  const newTags: string[] = []
  while (true) {
    const newTag = await input({
      message: 'Add a new tag (leave blank to stop):',
    })
    const trimmed = newTag.trim()
    if (!trimmed) break
    newTags.push(trimmed)
  }

  return [...selected, ...newTags]
}

async function promptRelated(existingSlugs: string[]): Promise<string[]> {
  if (existingSlugs.length === 0) return []
  return checkbox({
    message: 'Select related examples (space to toggle, enter to continue):',
    choices: existingSlugs.map((s) => ({ value: s, name: s })),
  })
}

async function promptVarietyProperties(): Promise<Record<string, unknown>> {
  const props: Record<string, unknown> = {}

  const numericOptional = async (
    name: string,
    message: string,
  ): Promise<void> => {
    const val = await input({
      message,
      validate: (v) =>
        v === '' || !isNaN(Number(v)) || 'Must be a number or leave blank',
    })
    if (val.trim() !== '') props[name] = Number(val.trim())
  }

  const stringOptional = async (
    name: string,
    message: string,
  ): Promise<void> => {
    const val = await input({ message })
    if (val.trim() !== '') props[name] = val.trim()
  }

  await numericOptional('dimension', 'Dimension (optional, leave blank to skip):')
  await stringOptional('ambient_space', 'Ambient space, e.g. "P^3" (optional):')
  await numericOptional('degree', 'Degree (optional):')
  await stringOptional('singularities', 'Singularities description (optional):')
  await numericOptional('genus', 'Genus (optional):')

  const isRationalStr = await select({
    message: 'Is rational?',
    choices: [
      { value: 'unknown', name: 'Unknown / skip' },
      { value: 'yes', name: 'Yes' },
      { value: 'no', name: 'No' },
    ],
  })
  if (isRationalStr !== 'unknown') props['is_rational'] = isRationalStr === 'yes'

  const kodairaRaw = await input({
    message: 'Kodaira dimension (optional, use -inf, 0, 1, 2, ... or leave blank):',
  })
  if (kodairaRaw.trim() !== '') {
    props['kodaira_dimension'] =
      kodairaRaw.trim() === '-inf' ? '-inf' : Number(kodairaRaw.trim())
  }

  await stringOptional('picard_group', 'Picard group description (optional):')

  return props
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n=== Add a new algebraic geometry example ===\n')

  // Load existing data synchronously via gray-matter
  let existingTags: string[] = []
  let existingSlugs: string[] = []
  try {
    const matter = (await import('gray-matter')).default
    const files = fs.readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.md'))
    const tagSet = new Set<string>()
    for (const file of files) {
      const raw = fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf-8')
      const { data } = matter(raw)
      if (data.slug) existingSlugs.push(data.slug as string)
      if (Array.isArray(data.tags)) {
        ;(data.tags as string[]).forEach((t) => tagSet.add(t))
      }
    }
    existingTags = Array.from(tagSet).sort()
    existingSlugs = existingSlugs.sort()
  } catch {
    console.warn('Warning: could not load existing examples for suggestions.')
  }

  // 1. Type
  const type = await select<ExampleType>({
    message: 'Select the example type:',
    choices: [
      { value: 'variety', name: 'variety — an algebraic variety' },
      { value: 'computation', name: 'computation — a worked calculation' },
      { value: 'counterexample', name: 'counterexample — refutes a claim' },
    ],
  })

  // 2. Title
  const title = await input({
    message: 'Title:',
    validate: (v) => v.trim().length > 0 || 'Title is required',
  })

  // 3. Slug (auto-suggested from title, editable)
  const suggestedSlug = toSlug(title)
  const slug = await input({
    message: 'Slug:',
    default: suggestedSlug,
    validate: (v) =>
      /^[a-z0-9-]+$/.test(v.trim()) ||
      'Slug must be lowercase alphanumeric with hyphens',
  })

  // 4. Field
  const field = await select<FieldValue>({
    message: 'Field:',
    choices: FIELD_VALUES.map((f) => ({ value: f, name: f })),
  })

  // 5. Summary
  const summary = await input({
    message: 'Summary (one sentence):',
    validate: (v) => v.trim().length > 0 || 'Summary is required',
  })

  // 6. Tags
  const tags = await promptTags(existingTags)

  // 7. Related slugs
  const related = await promptRelated(existingSlugs)

  // 8. Type-specific fields
  const typeSpecific: Record<string, unknown> = {}

  if (type === 'variety') {
    console.log('\n-- Variety properties (all optional) --')
    const props = await promptVarietyProperties()
    if (Object.keys(props).length > 0) {
      typeSpecific['properties'] = props
    }
    // concepts (optional)
    const conceptsRaw = await input({
      message: 'Concepts (comma-separated, optional):',
    })
    const concepts = conceptsRaw
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    if (concepts.length > 0) typeSpecific['concepts'] = concepts
  } else if (type === 'computation') {
    const computes = await input({
      message: 'What does this compute? (required):',
      validate: (v) => v.trim().length > 0 || 'computes is required',
    })
    typeSpecific['computes'] = computes.trim()

    const techniquesRaw = await input({
      message: 'Techniques used (comma-separated, optional):',
    })
    const techniques = techniquesRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (techniques.length > 0) typeSpecific['techniques'] = techniques

    const object = await input({
      message: 'Mathematical object (optional):',
    })
    if (object.trim()) typeSpecific['object'] = object.trim()
  } else if (type === 'counterexample') {
    const refutes = await input({
      message: 'What claim does this refute? (required):',
      validate: (v) => v.trim().length > 0 || 'refutes is required',
    })
    typeSpecific['refutes'] = refutes.trim()
  }

  // 9. References
  const referencesRaw = await input({
    message: 'References (comma-separated, optional):',
  })
  const references = referencesRaw
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)

  // ── Assemble frontmatter ──────────────────────────────────────────────────

  const frontmatter: Record<string, unknown> = {
    type,
    title,
    slug: slug.trim(),
    field,
    summary,
    ...(tags.length > 0 ? { tags } : {}),
    ...(related.length > 0 ? { related } : {}),
    ...(references.length > 0 ? { references } : {}),
    ...typeSpecific,
  }

  // ── Preview & confirm ─────────────────────────────────────────────────────

  const preview = buildMarkdown(frontmatter)
  console.log('\n--- Preview ---\n')
  console.log(preview)
  console.log('---------------\n')

  const shouldWrite = await confirm({
    message: 'Write this file?',
    default: true,
  })

  if (!shouldWrite) {
    console.log('Aborted. No file written.')
    process.exit(0)
  }

  // ── Write file ────────────────────────────────────────────────────────────

  const targetPath = path.join(EXAMPLES_DIR, `${slug.trim()}.md`)
  if (fs.existsSync(targetPath)) {
    console.error(`\nError: File already exists: ${targetPath}`)
    console.error('Aborting to prevent overwrite.')
    process.exit(1)
  }

  fs.writeFileSync(targetPath, preview, 'utf-8')
  console.log(`\nSuccess! Written to: ${targetPath}`)
}

main().catch((err) => {
  if ((err as NodeJS.ErrnoException).name === 'ExitPromptError') {
    // User pressed Ctrl+C
    console.log('\nCancelled.')
    process.exit(0)
  }
  console.error('Unexpected error:', err)
  process.exit(1)
})
