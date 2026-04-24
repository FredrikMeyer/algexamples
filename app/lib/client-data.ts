import type { Example } from './schema'

export type EnrichedExample = Example & { html: string; backlinks: Example[] }

let cache: EnrichedExample[] | null = null

export async function getClientData(): Promise<EnrichedExample[]> {
  if (cache) return cache
  const url = `${import.meta.env.BASE_URL}data.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  cache = await res.json()
  return cache!
}
