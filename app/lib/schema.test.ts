import { describe, it, expect } from 'vitest'
import { ExampleFrontmatterSchema } from './schema'

const validVariety = {
  title: 'Twisted Cubic',
  slug: 'twisted-cubic',
  type: 'variety' as const,
  field: 'algebraic-geometry' as const,
  tags: ['curves', 'projective-space'],
  summary: 'Degree-3 rational curve in P^3',
  related: [],
  properties: {
    dimension: 1,
    ambient_space: 'P^3',
    degree: 3,
    singularities: 'smooth',
    is_rational: true,
  },
}

describe('ExampleFrontmatterSchema', () => {
  it('parses a valid variety', () => {
    const result = ExampleFrontmatterSchema.safeParse(validVariety)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Twisted Cubic')
      expect(result.data.type).toBe('variety')
    }
  })

  it('defaults tags and related to empty arrays when omitted', () => {
    const input = { ...validVariety, tags: undefined, related: undefined }
    const result = ExampleFrontmatterSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success && result.data.type === 'variety') {
      expect(result.data.tags).toEqual([])
      expect(result.data.related).toEqual([])
    }
  })

  it('rejects a variety with an invalid slug', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      ...validVariety,
      slug: 'Twisted Cubic',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a computation missing computes', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      title: 'Test',
      slug: 'test',
      type: 'computation',
      field: 'algebraic-geometry',
      summary: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('parses a counterexample', () => {
    const result = ExampleFrontmatterSchema.safeParse({
      title: 'Non-flat morphism',
      slug: 'non-flat-morphism',
      type: 'counterexample',
      field: 'algebraic-geometry',
      summary: 'A morphism that is not flat',
      refutes: 'A finite morphism is always flat',
    })
    expect(result.success).toBe(true)
  })
})
