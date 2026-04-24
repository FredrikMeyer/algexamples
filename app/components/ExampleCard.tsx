import { Link } from '@tanstack/react-router'
import type { Example } from '~/lib/schema'

const TYPE_COLOURS: Record<Example['type'], string> = {
  variety: 'bg-teal-100 text-teal-800',
  computation: 'bg-emerald-100 text-emerald-800',
  counterexample: 'bg-amber-100 text-amber-800',
}

interface ExampleCardProps {
  example: Example
}

export function ExampleCard({ example }: ExampleCardProps) {
  return (
    <div className="rounded-lg p-4 bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-1">
        <Link
          to="/examples/$slug"
          params={{ slug: example.slug }}
          className="font-medium text-gray-900 hover:text-indigo-700 leading-snug"
        >
          {example.title}
        </Link>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${TYPE_COLOURS[example.type]}`}>
          {example.type}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-2 leading-relaxed">{example.summary}</p>
      <div className="flex flex-wrap gap-1">
        {example.tags.slice(0, 5).map((tag) => (
          <Link
            key={tag}
            to="/tags/$tag"
            params={{ tag }}
            className="text-xs bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  )
}
