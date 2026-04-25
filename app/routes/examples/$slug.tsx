import { createFileRoute } from '@tanstack/react-router'
import { getExampleDetailFn } from '~/lib/server-fns'
import { PropertiesTable } from '~/components/PropertiesTable'
import { ExampleMeta } from '~/components/ExampleMeta'
import type { VarietyExample } from '~/lib/schema'

export const Route = createFileRoute('/examples/$slug')({
  loader: ({ params: { slug } }) => getExampleDetailFn(slug),
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
      <h1
        className="text-4xl font-semibold text-gray-900 mb-6"
        style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
      >
        {example.title}
      </h1>

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

          {/* Links / References */}
          {example.links && example.links.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2
                className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3"
              >
                References
              </h2>
              <ul className="space-y-1">
                {example.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <ExampleMeta example={example} backlinks={backlinks} />
        </aside>
      </div>
    </div>
  )
}
