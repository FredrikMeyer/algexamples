import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ExampleFrontmatterSchema, type Example, type ExampleFrontmatter } from './schema'

// Lazy so path.join never runs at module-init time in the browser bundle.
// Loaders call these functions only on the server.
function getExamplesDir(): string {
  return path.join(process.cwd(), 'content', 'examples')
}

function parseExampleFile(filePath: string): Example {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = ExampleFrontmatterSchema.parse(data)
  return { ...frontmatter, body: content.trim() }
}

export function getAllExamples(): Example[] {
  const dir = getExamplesDir()
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
  return files.map((f) => parseExampleFile(path.join(dir, f)))
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
