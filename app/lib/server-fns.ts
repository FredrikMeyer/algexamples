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
import type { ExampleFrontmatter } from './schema'

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
