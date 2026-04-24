import { Link } from '@tanstack/react-router'
import type { Example } from '~/lib/schema'

const TYPE_COLOURS: Record<Example['type'], string> = {
  variety: 'bg-blue-100 text-blue-700',
  computation: 'bg-green-100 text-green-700',
  counterexample: 'bg-orange-100 text-orange-700',
}

interface ExampleCardProps {
  example: Example
}

export function ExampleCard({ example }: ExampleCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <Link
          to={'/examples/$slug' as any}
          params={{ slug: example.slug }}
          className="font-medium text-gray-900 hover:text-blue-600"
        >
          {example.title}
        </Link>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLOURS[example.type]}`}>
          {example.type}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{example.summary}</p>
      <div className="flex flex-wrap gap-1">
        {example.tags.slice(0, 4).map((tag) => (
          <Link
            key={tag}
            to={'/tags/$tag' as any}
            params={{ tag }}
            className="text-xs bg-gray-100 text-gray-500 hover:text-blue-600 px-2 py-0.5 rounded"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
