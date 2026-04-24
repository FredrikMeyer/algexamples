import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { getAllExamples } from '../app/lib/content'
import { computeBacklinks } from '../app/lib/backlinks'
import { processMarkdown } from '../app/lib/markdown'

async function main() {
  const examples = getAllExamples()
  const backlinkMap = computeBacklinks(examples)

  const enriched = await Promise.all(
    examples.map(async (e) => ({
      ...e,
      html: await processMarkdown(e.body),
      backlinks: backlinkMap.get(e.slug) ?? [],
    })),
  )

  const outDir = join(process.cwd(), 'dist', 'client')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'data.json'), JSON.stringify(enriched))
  console.log(`data.json: ${enriched.length} examples`)
}

main().catch((e) => { console.error(e); process.exit(1) })
