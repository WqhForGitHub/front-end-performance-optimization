import type { FC } from 'react'

export interface WaterfallItem {
  name: string
  /** 各阶段开始时间（ms，相对起点） */
  start: number
  /** 各阶段持续时间 */
  duration: number
  /** 阶段类型：dns / conn / req / res */
  type: 'dns' | 'conn' | 'req' | 'res'
}

interface WaterfallProps {
  title: string
  items: WaterfallItem[]
  /** 总时间窗（ms），用于横向比例 */
  totalMs: number
}

const TYPE_LABEL: Record<WaterfallItem['type'], string> = {
  dns: 'DNS',
  conn: 'TCP/TLS',
  req: 'Request',
  res: 'Response'
}

export const NetworkWaterfall: FC<WaterfallProps> = ({ title, items, totalMs }) => {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div className="waterfall">
        {items.map((it, i) => {
          const leftPct = (it.start / totalMs) * 100
          const widthPct = (it.duration / totalMs) * 100
          return (
            <div className="waterfall-row" key={i}>
              <div className="waterfall-name" title={it.name}>{it.name}</div>
              <div className="waterfall-bar">
                <div
                  className={'waterfall-fill ' + it.type}
                  style={{ left: leftPct + '%', width: Math.max(widthPct, 1) + '%' }}
                />
              </div>
              <div className="waterfall-time">
                {TYPE_LABEL[it.type]} {Math.round(it.duration)}ms
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#6b7280' }}>
        {(['dns', 'conn', 'req', 'res'] as const).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: 2,
                background: {
                  dns: '#a78bfa',
                  conn: '#f59e0b',
                  req: '#3b82f6',
                  res: '#22c55e'
                }[t]
              }}
            />
            {TYPE_LABEL[t]}
          </span>
        ))}
      </div>
    </div>
  )
}
