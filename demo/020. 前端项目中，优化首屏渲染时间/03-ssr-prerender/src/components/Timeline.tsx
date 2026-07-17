import type { CSSProperties } from 'react'

export interface TimelinePhase {
  label: string
  start: number
  end: number
  color: string
  marker?: boolean
}

interface TimelineProps {
  phases: TimelinePhase[]
  total: number
  height?: number
}

const wrapperStyle: CSSProperties = {
  background: '#0f1115',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: 16,
}

const railStyle: CSSProperties = {
  position: 'relative',
  height: 56,
  background: 'rgba(255,255,255,0.03)',
  borderRadius: 6,
  marginBottom: 28,
}

export function Timeline({ phases, total, height = 56 }: TimelineProps) {
  const markers = phases.filter((p) => p.marker)
  const bars = phases.filter((p) => !p.marker)

  return (
    <div style={wrapperStyle}>
      <div style={{ ...railStyle, height }}>
        {[0, 200, 400, 600, 800, 1000, 1200, 1400].map((t) => (
          <div
            key={t}
            style={{
              position: 'absolute',
              left: `${(t / total) * 100}%`,
              top: 0,
              bottom: 0,
              borderLeft: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ position: 'absolute', top: height + 4, fontSize: 10, color: 'var(--muted)', transform: 'translateX(-50%)' }}>
              {t}ms
            </span>
          </div>
        ))}

        {bars.map((phase, i) => {
          const left = (phase.start / total) * 100
          const width = ((phase.end - phase.start) / total) * 100
          const row = i % 2 === 0 ? 6 : 30
          return (
            <div
              key={phase.label}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: row,
                width: `${Math.max(width, 1.5)}%`,
                height: 18,
                background: phase.color,
                opacity: 0.85,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 6,
                fontSize: 10,
                color: '#0f1115',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={phase.label}
            >
              {phase.label}
            </div>
          )
        })}

        {markers.map((m) => (
          <div
            key={m.label}
            style={{
              position: 'absolute',
              left: `${(m.start / total) * 100}%`,
              top: -4,
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: m.color,
                border: '2px solid #0f1115',
                boxShadow: `0 0 0 2px ${m.color}`,
              }}
            />
            <div style={{ fontSize: 10, color: m.color, marginTop: 4, whiteSpace: 'nowrap', transform: 'translateX(-50%)' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
