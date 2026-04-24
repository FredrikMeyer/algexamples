import type { VarietyFrontmatter } from '~/lib/schema'

type Properties = NonNullable<VarietyFrontmatter['properties']>

interface PropertiesTableProps {
  properties: Properties
}

const PROPERTY_LABELS: { key: keyof Properties; label: string }[] = [
  { key: 'dimension', label: 'Dimension' },
  { key: 'ambient_space', label: 'Ambient space' },
  { key: 'degree', label: 'Degree' },
  { key: 'singularities', label: 'Singularities' },
  { key: 'genus', label: 'Genus' },
  { key: 'is_rational', label: 'Rational?' },
  { key: 'kodaira_dimension', label: 'Kodaira dimension' },
  { key: 'picard_group', label: 'Picard group' },
  { key: 'hodge_numbers', label: 'Hodge numbers' },
]

function formatValue(key: keyof Properties, value: NonNullable<Properties[keyof Properties]>): string {
  if (key === 'is_rational') {
    return (value as boolean) ? 'Yes' : 'No'
  }
  if (key === 'kodaira_dimension') {
    const v = value as number | '-inf'
    if (v === '-inf') return '−∞'
    return String(v)
  }
  if (key === 'hodge_numbers') {
    const hn = value as Record<string, number>
    return Object.entries(hn)
      .map(([pq, n]) => `h^{${pq}} = ${n}`)
      .join(', ')
  }
  return String(value)
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const rows = PROPERTY_LABELS.filter(({ key }) => properties[key] !== undefined)

  if (rows.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Properties</h2>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ key, label }) => (
            <tr key={key} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2 font-medium text-gray-600 w-1/2">{label}</td>
              <td className="px-4 py-2 text-gray-900">
                {formatValue(key, properties[key] as NonNullable<Properties[keyof Properties]>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
