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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">#{tag}</h1>
        <p className="text-gray-600">
          {examples.length} example{examples.length === 1 ? '' : 's'} tagged #{tag}
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
