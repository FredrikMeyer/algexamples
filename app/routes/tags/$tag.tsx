import { createFileRoute } from '@tanstack/react-router'
import { getExamplesByTagFn } from '~/lib/server-fns'
import { ExampleCard } from '~/components/ExampleCard'

export const Route = createFileRoute('/tags/$tag')({
  loader: ({ params: { tag } }) => getExamplesByTagFn({ data: tag }),
  notFoundComponent: () => <div>Tag not found.</div>,
  component: TagPage,
})

function TagPage() {
  const { tag, examples } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Tag</p>
        <h1
          className="text-4xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
        >
          {tag}
        </h1>
        <p className="text-gray-500">
          {examples.length} example{examples.length === 1 ? '' : 's'}
        </p>
      </div>

      {examples.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No examples found for this tag.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {examples.map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      )}
    </div>
  )
}
