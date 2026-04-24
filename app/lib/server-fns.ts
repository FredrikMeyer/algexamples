import { createIsomorphicFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { FieldEnum } from './schema'
import type { ExampleFrontmatter, VarietyExample } from './schema'

export type SearchParams = {
  q?: string
  type?: 'variety' | 'computation' | 'counterexample'
  field?: ExampleFrontmatter['field']
  tag?: string
  dim?: number
  rational?: boolean
  smooth?: boolean
}

// ── getAllExamplesFn ──────────────────────────────────────────────────────────

export const getAllExamplesFn = createIsomorphicFn()
  .server(async () => {
    const { getAllExamples } = await import('./content')
    return getAllExamples()
  })
  .client(async () => {
    const { getClientData } = await import('./client-data')
    return getClientData()
  })

// ── getAllTagsFn ──────────────────────────────────────────────────────────────

export const getAllTagsFn = createIsomorphicFn()
  .server(async () => {
    const { getAllTags } = await import('./content')
    return getAllTags()
  })
  .client(async () => {
    const { getClientData } = await import('./client-data')
    const data = await getClientData()
    const tagSet = new Set<string>()
    data.forEach((e) => e.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  })

// ── getExampleDetailFn ───────────────────────────────────────────────────────

export const getExampleDetailFn = createIsomorphicFn()
  .server(async (slug: string) => {
    const { getAllExamples } = await import('./content')
    const { computeBacklinks } = await import('./backlinks')
    const { processMarkdown } = await import('./markdown')
    const allExamples = getAllExamples()
    const example = allExamples.find((e) => e.slug === slug)
    if (!example) throw notFound()
    const backlinkMap = computeBacklinks(allExamples)
    const html = await processMarkdown(example.body)
    return { example, html, backlinks: backlinkMap.get(slug) ?? [] }
  })
  .client(async (slug: string) => {
    const { getClientData } = await import('./client-data')
    const data = await getClientData()
    const entry = data.find((e) => e.slug === slug)
    if (!entry) throw notFound()
    return { example: entry, html: entry.html, backlinks: entry.backlinks }
  })

// ── getExamplesByTagFn ───────────────────────────────────────────────────────

export const getExamplesByTagFn = createIsomorphicFn()
  .server(async (tag: string) => {
    const { getExamplesByTag, getAllTags } = await import('./content')
    const examples = getExamplesByTag(tag)
    if (examples.length === 0 && !getAllTags().includes(tag)) throw notFound()
    return { tag, examples }
  })
  .client(async (tag: string) => {
    const { getClientData } = await import('./client-data')
    const data = await getClientData()
    const examples = data.filter((e) => e.tags.includes(tag))
    if (examples.length === 0) {
      const allTags = new Set(data.flatMap((e) => e.tags))
      if (!allTags.has(tag)) throw notFound()
    }
    return { tag, examples }
  })

// ── getExamplesByFieldFn ─────────────────────────────────────────────────────

export const getExamplesByFieldFn = createIsomorphicFn()
  .server(async (field: string) => {
    const { getExamplesByField } = await import('./content')
    const parsed = FieldEnum.safeParse(field)
    if (!parsed.success) throw notFound()
    const examples = getExamplesByField(parsed.data)
    return { field: parsed.data as ExampleFrontmatter['field'], examples }
  })
  .client(async (field: string) => {
    const { getClientData } = await import('./client-data')
    const parsed = FieldEnum.safeParse(field)
    if (!parsed.success) throw notFound()
    const data = await getClientData()
    const examples = data.filter((e) => e.field === parsed.data)
    return { field: parsed.data as ExampleFrontmatter['field'], examples }
  })

// ── searchExamplesFn ─────────────────────────────────────────────────────────

function applyFilters<T extends { title: string; summary: string; body: string; type: string; field: string; tags: string[] }>(
  items: T[],
  p: SearchParams,
): T[] {
  let results = items
  if (p.q) {
    const term = p.q.toLowerCase()
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.summary.toLowerCase().includes(term) ||
        e.body.toLowerCase().includes(term),
    )
  }
  if (p.type) results = results.filter((e) => e.type === p.type)
  if (p.field) results = results.filter((e) => e.field === p.field)
  if (p.tag) results = results.filter((e) => e.tags.includes(p.tag!))
  if (p.dim !== undefined)
    results = results.filter(
      (e) => e.type === 'variety' && (e as unknown as VarietyExample).properties?.dimension === p.dim,
    )
  if (p.rational !== undefined)
    results = results.filter(
      (e) => e.type === 'variety' && (e as unknown as VarietyExample).properties?.is_rational === p.rational,
    )
  if (p.smooth)
    results = results.filter(
      (e) =>
        e.type === 'variety' &&
        (e as unknown as VarietyExample).properties?.singularities?.toLowerCase() === 'smooth',
    )
  return results
}

export const searchExamplesFn = createIsomorphicFn()
  .server(async (p: SearchParams) => {
    const { getAllExamples } = await import('./content')
    return applyFilters(getAllExamples(), p)
  })
  .client(async (p: SearchParams) => {
    const { getClientData } = await import('./client-data')
    return applyFilters(await getClientData(), p)
  })
