import { copy } from '../content'

type FallbackProps = {
  reason: 'webgl'
}

export function FallbackView({ reason }: FallbackProps) {
  const text = copy.fallback
  return (
    <section className="fallback" aria-label={text.label}>
      <div className="fallback-copy">
        <p className="kicker">{text.kicker}</p>
        <h2>{text.title}</h2>
        <p>{reason === 'webgl' ? text.webgl : text.failed}</p>
      </div>
      <SchematicFigure />
      {text.footnote ? <p className="footnote">{text.footnote}</p> : null}
    </section>
  )
}

function SchematicFigure() {
  const layers = [
    { name: 'Si', kind: 'silicon' },
    { name: 'Si', kind: 'silicon' },
    { name: 'ΔE', kind: 'delta' },
    { name: 'E', kind: 'energy' },
    { name: 'ΔE', kind: 'delta' },
    { name: 'Si', kind: 'silicon' },
    { name: 'Si', kind: 'silicon' },
  ]
  return (
    <svg className="schematic" viewBox="0 0 880 280" role="img" aria-label={copy.fallback.diagram}>
      <text x="36" y="78" fill="#f4f4f5" fontSize="14" fontFamily="Poppins, sans-serif">
        {copy.fallback.space}
      </text>
      <text x="760" y="78" fill="#f4f4f5" fontSize="14" fontFamily="Poppins, sans-serif">
        {copy.fallback.moon}
      </text>
      <line x1="70" y1="148" x2="810" y2="148" stroke="rgba(255,255,255,0.28)" />
      {layers.map((layer, index) => {
        const x = 150 + index * 86
        if (layer.kind === 'silicon') {
          return (
            <g key={`${layer.name}-${index}`}>
              <rect x={x} y="96" width="8" height="104" fill="#d5d8df" />
              <rect x={x + 14} y="96" width="8" height="104" fill="#aeb6c2" />
              <text x={x + 4} y="224" fill="#b5b5bd" fontSize="13" fontFamily="Poppins, sans-serif">
                {layer.name}
              </text>
            </g>
          )
        }
        const width = layer.kind === 'energy' ? 46 : 28
        return (
          <g key={`${layer.name}-${index}`}>
            <rect
              x={x - 6}
              y={layer.kind === 'energy' ? 86 : 100}
              width={width}
              height={layer.kind === 'energy' ? 124 : 96}
              rx="6"
              fill={layer.kind === 'energy' ? '#c6b48a' : '#7f97a8'}
            />
            <text x={x - 2} y="224" fill="#b5b5bd" fontSize="13" fontFamily="Poppins, sans-serif">
              {layer.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
