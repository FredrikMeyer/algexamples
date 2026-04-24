import { createFileRoute } from '@tanstack/react-router'
import { getExamplesByFieldFn } from '~/lib/server-fns'
import { ExampleCard } from '~/components/ExampleCard'

function formatFieldName(field: string): string {
  return field
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const Route = createFileRoute('/fields/$field')({
  loader: ({ params: { field } }) => getExamplesByFieldFn({ data: field }),
  notFoundComponent: () => <div>Field not found.</div>,
  component: FieldPage,
})

function FieldPage() {
  const { field, examples } = Route.useLoaderData()
  const fieldName = formatFieldName(field)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{fieldName}</h1>
        <p className="text-gray-600">
          {examples.length} example{examples.length === 1 ? '' : 's'} in {fieldName}
        </p>
      </div>

      {examples.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No examples found for this field.</p>
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
