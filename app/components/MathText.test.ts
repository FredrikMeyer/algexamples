import { describe, it, expect } from 'vitest'
import matter from 'gray-matter'
import katex from 'katex'
import { katexMacros } from '~/lib/katex-macros'

function renderMath(tex: string): string {
  return katex.renderToString(tex, { macros: katexMacros, throwOnError: false })
}

function splitMath(text: string): string[] {
  return text.split(/\$([^$]+)\$/)
}

describe('MathText logic', () => {
  it('splits $...$ into parts with math at odd indices', () => {
    const parts = splitMath('$\\PP^3$')
    expect(parts).toEqual(['', '\\PP^3', ''])
  })

  it('splits mixed text and math', () => {
    const parts = splitMath('ambient $\\PP^3$ space')
    expect(parts).toEqual(['ambient ', '\\PP^3', ' space'])
  })

  it('renders \\PP macro to mathbb HTML', () => {
    const html = renderMath('\\PP^3')
    expect(html).toContain('katex')
    expect(html).toContain('mathbb') // \PP expands to \mathbb{P}
  })

  it('renders a plain string without $ — no math segments', () => {
    const parts = splitMath('smooth')
    expect(parts).toEqual(['smooth'])
  })
})

describe('YAML parsing of LaTeX strings', () => {
  // \P is a valid YAML escape in double-quoted strings: it maps to U+2029
  // (paragraph separator). Double-quoted YAML must NOT be used for LaTeX.
  it('double-quoted YAML corrupts \\P — \\P becomes U+2029', () => {
    const raw = `---\nambient_space: "$\\PP^3$"\n---\n`
    const { data } = matter(raw)
    expect(data.ambient_space).not.toBe('$\\PP^3$')
    expect(data.ambient_space).toContain(' ') // paragraph separator
  })

  it('single-quoted YAML preserves backslash literally — correct for LaTeX', () => {
    const raw = `---\nambient_space: '$\\PP^3$'\n---\n`
    const { data } = matter(raw)
    expect(data.ambient_space).toBe('$\\PP^3$')
  })
})
