import { createFileRoute, notFound } from '@tanstack/react-router'
import { getAllExamples } from '~/lib/content'
import { computeBacklinks } from '~/lib/backlinks'
import { processMarkdown } from '~/lib/markdown'
import { PropertiesTable } from '~/components/PropertiesTable'
import { ExampleMeta } from '~/components/ExampleMeta'
import type { VarietyExample } from '~/lib/schema'

export const Route = createFileRoute('/examples/$slug')({
  loader: async ({ params: { slug } }) => {
    const allExamples = getAllExamples()
    const example = allExamples.find((e) => e.slug === slug)
    if (!example) throw notFound()

    const backlinkMap = computeBacklinks(allExamples)
    const html = await processMarkdown(example.body)

    return {
      example,
      html,
      backlinks: backlinkMap.get(slug) ?? [],
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.example.title} — Algebraic Geometry Examples` }]
      : [],
  }),
  notFoundComponent: () => (
    <div className="py-12 text-center text-gray-500">
      <p className="text-lg font-medium mb-1">Example not found.</p>
      <p className="text-sm">The requested example does not exist.</p>
    </div>
  ),
  component: ExampleDetailPage,
})

function ExampleDetailPage() {
  const { example, html, backlinks } = Route.useLoaderData()

  const isVariety = example.type === 'variety'
  const varietyExample = isVariety ? (example as VarietyExample) : null

  return (
    <div data-pagefind-body>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{example.title}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Properties table (variety only) */}
          {varietyExample && varietyExample.properties && (
            <div className="mb-6">
              <PropertiesTable properties={varietyExample.properties} />
            </div>
          )}

          {/* Markdown body */}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <ExampleMeta example={example} backlinks={backlinks} />
        </aside>
      </div>
    </div>
  )
}
