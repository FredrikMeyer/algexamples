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
