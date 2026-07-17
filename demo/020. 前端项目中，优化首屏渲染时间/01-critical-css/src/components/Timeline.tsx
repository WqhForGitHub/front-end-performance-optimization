import type { CSSProperties } from 'react'

export interface TimelinePhase {
  label: string
  start: number
  end: number
  color: string
  marker?: boolean
  inline?: boolean
  async?: boolean
}

interface TimelineProps {
  phases: TimelinePhase[]
  total: number
  key?: string | number
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
  marginBottom: 32,
  overflow: 'visible',
}

export function Timeline({ phases, total }: TimelineProps) {
  const markers = phases.filter((p) => p.marker)
  const bars = phases.filter((p) => !p.marker)

  return (
    <div style={wrapperStyle}>
      <div style={railStyle}>
        {/* 时间刻度 */}
        {[0, 200, 400, 600, 800, 1000].map((t) => (
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
            <span style={{ position: 'absolute', top: 60, fontSize: 10, color: 'var(--muted)', transform: 'translateX(-50%)' }}>
              {t}ms
            </span>
          </div>
        ))}

        {/* 条形阶段 */}
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
                opacity: phase.async ? 0.55 : 0.85,
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
                boxShadow: phase.inline ? '0 0 0 1px #fbbf24 inset' : 'none',
              }}
              title={phase.label}
            >
              {phase.label}
            </div>
          )
        })}

        {/* 标记点 */}
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

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 18, fontSize: 11, color: 'var(--muted)' }}>
        <Legend color="#fbbf24" text="内联 CSS（不阻塞）" />
        <Legend color="#22d3ee" text="异步加载（不阻塞渲染）" />
        <Legend color="#f87171" text="阻塞渲染的外部 CSS" />
        <Legend color="#f472b6" text="FCP / LCP 关键节点" />
      </div>
    </div>
  )
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, background: color, borderRadius: 3, display: 'inline-block' }} />
      <span>{text}</span>
    </div>
  )
}
