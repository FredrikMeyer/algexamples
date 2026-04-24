import type { Example } from './schema'

export type BacklinkMap = Map<string, Example[]>

export function computeBacklinks(examples: Example[]): BacklinkMap {
  const map: BacklinkMap = new Map()
  for (const example of examples) {
    for (const relatedSlug of example.related) {
      if (!map.has(relatedSlug)) map.set(relatedSlug, [])
      map.get(relatedSlug)!.push(example)
    }
  }
  return map
}
