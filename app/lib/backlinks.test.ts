import { describe, it, expect } from 'vitest'
import { computeBacklinks } from './backlinks'
import type { Example } from './schema'

const makeVariety = (slug: string, related: string[] = []): Example => ({
  type: 'variety',
  title: slug,
  slug,
  field: 'algebraic-geometry',
  tags: [],
  summary: 'test',
  related,
  body: '',
})

describe('computeBacklinks', () => {
  it('returns empty map when no related entries', () => {
    const map = computeBacklinks([makeVariety('a'), makeVariety('b')])
    expect(map.size).toBe(0)
  })

  it('inverts the related graph correctly', () => {
    const a = makeVariety('a', ['b'])
    const c = makeVariety('c', ['b'])
    const b = makeVariety('b')
    const map = computeBacklinks([a, b, c])
    expect(map.get('b')).toHaveLength(2)
    expect(map.get('b')!.map((e) => e.slug)).toContain('a')
    expect(map.get('b')!.map((e) => e.slug)).toContain('c')
  })

  it('does not create backlinks for entries that are not referenced', () => {
    const a = makeVariety('a', ['b'])
    const b = makeVariety('b')
    const map = computeBacklinks([a, b])
    expect(map.has('a')).toBe(false)
  })
})
