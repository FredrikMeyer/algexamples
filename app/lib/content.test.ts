import { describe, it, expect } from 'vitest'
import { getAllExamples, getExampleBySlug, getAllTags } from './content'

describe('content loader', () => {
  it('loads at least the three seed examples', () => {
    const examples = getAllExamples()
    expect(examples.length).toBeGreaterThanOrEqual(3)
  })

  it('parses the twisted-cubic variety correctly', () => {
    const e = getExampleBySlug('twisted-cubic')
    expect(e.title).toBe('The Twisted Cubic')
    expect(e.type).toBe('variety')
    if (e.type === 'variety') {
      expect(e.properties?.dimension).toBe(1)
      expect(e.properties?.is_rational).toBe(true)
    }
  })

  it('parses the counterexample refutes field', () => {
    const e = getExampleBySlug('non-flat-morphism')
    expect(e.type).toBe('counterexample')
    if (e.type === 'counterexample') {
      expect(e.refutes).toMatch(/flat/)
    }
  })

  it('parses the computation computes field', () => {
    const e = getExampleBySlug('quintic-threefold-cohomology')
    expect(e.type).toBe('computation')
    if (e.type === 'computation') {
      expect(e.computes).toMatch(/cohomology/)
    }
  })

  it('body is non-empty for all seed examples', () => {
    getAllExamples().forEach((e) => {
      expect(e.body.length).toBeGreaterThan(10)
    })
  })

  it('getAllTags returns non-empty array containing "curves"', () => {
    const tags = getAllTags()
    expect(tags.length).toBeGreaterThan(0)
    expect(tags).toContain('curves')
  })

  it('throws for unknown slug', () => {
    expect(() => getExampleBySlug('does-not-exist')).toThrow()
  })
})
