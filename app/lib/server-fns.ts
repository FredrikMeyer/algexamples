import { createServerFn } from '@tanstack/react-start'
import {
  getAllExamples,
  getExamplesByTag,
  getExamplesByField,
  getAllTags,
} from './content'
import { computeBacklinks } from './backlinks'
import { processMarkdown } from './markdown'
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

export const searchExamplesFn = createServerFn({ method: 'GET' })
  .inputValidator((p: SearchParams) => p)
  .handler(({ data: p }) => {
    let results = getAllExamples()

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
    if (p.dim !== undefined) {
      results = results.filter(
        (e) => e.type === 'variety' && (e as VarietyExample).properties?.dimension === p.dim,
      )
    }
    if (p.rational !== undefined) {
      results = results.filter(
        (e) => e.type === 'variety' && (e as VarietyExample).properties?.is_rational === p.rational,
      )
    }
    if (p.smooth) {
      results = results.filter(
        (e) =>
          e.type === 'variety' &&
          (e as VarietyExample).properties?.singularities?.toLowerCase() === 'smooth',
      )
    }

    return results
  })

export const getAllExamplesFn = createServerFn({ method: 'GET' })
  .handler(() => getAllExamples())

export const getAllTagsFn = createServerFn({ method: 'GET' })
  .handler(() => getAllTags())

export const getExampleDetailFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const allExamples = getAllExamples()
    const example = allExamples.find((e) => e.slug === slug)
    if (!example) throw notFound()
    const backlinkMap = computeBacklinks(allExamples)
    const html = await processMarkdown(example.body)
    return { example, html, backlinks: backlinkMap.get(slug) ?? [] }
  })

export const getExamplesByTagFn = createServerFn({ method: 'GET' })
  .inputValidator((tag: string) => tag)
  .handler(({ data: tag }) => {
    const examples = getExamplesByTag(tag)
    if (examples.length === 0) {
      const allTags = getAllTags()
      if (!allTags.includes(tag)) throw notFound()
    }
    return { tag, examples }
  })

export const getExamplesByFieldFn = createServerFn({ method: 'GET' })
  .inputValidator((field: string) => field)
  .handler(({ data: field }) => {
    const parsed = FieldEnum.safeParse(field)
    if (!parsed.success) throw notFound()
    const examples = getExamplesByField(parsed.data)
    return { field: parsed.data as ExampleFrontmatter['field'], examples }
  })
