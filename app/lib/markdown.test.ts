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
    const html = await processMarkdown('\n$$\nf: X \\to Y\n$$\n')
    expect(html).toContain('katex-display')
  })

  it('expands site-wide macro \\PP', async () => {
    const html = await processMarkdown('The space $\\PP^n$')
    expect(html).toContain('katex')
    expect(html).not.toContain('undefined')
  })

  it('syntax-highlights a code block', async () => {
    const html = await processMarkdown('```python\nx = 1\n```')
    expect(html).toContain('hljs')
  })
})
