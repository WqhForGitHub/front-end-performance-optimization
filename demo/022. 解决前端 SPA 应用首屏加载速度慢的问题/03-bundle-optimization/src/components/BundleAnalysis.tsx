import type { FC } from 'react'

interface BundleRow {
  name: string
  sizeKB: number
  gzipKB: number
  type: 'bad' | 'mid' | 'good'
}

interface BundleTableProps {
  title: string
  rows: BundleRow[]
  showTotal: boolean
}

const MAX_KB = 320

export const BundleTable: FC<BundleTableProps> = ({ title, rows, showTotal }) => {
  const total = rows.reduce((s, r) => s + r.sizeKB, 0)
  const totalGzip = rows.reduce((s, r) => s + r.gzipKB, 0)

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <table className="bundle-table">
        <thead>
          <tr>
            <th>Chunk</th>
            <th>大小</th>
            <th>gzip</th>
            <th className="bar-cell">体积</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="name">{r.name}</td>
              <td className="size">{r.sizeKB} KB</td>
              <td className="size">{r.gzipKB} KB</td>
              <td className="bar-cell">
                <div className="bar">
                  <div
                    className={'bar-fill ' + r.type}
                    style={{ width: Math.max((r.sizeKB / MAX_KB) * 100, 2) + '%' }}
                  />
                </div>
              </td>
            </tr>
          ))}
          {showTotal && (
            <tr className="total">
              <td className="name">总计</td>
              <td className="size">{total} KB</td>
              <td className="size">{totalGzip} KB</td>
              <td className="bar-cell">
                <div className="bar">
                  <div
                    className="bar-fill mid"
                    style={{ width: Math.min((total / MAX_KB) * 100, 100) + '%' }}
                  />
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// 三组数据：基线 / manualChunks / manualChunks + CDN externals
export const baselineRows: BundleRow[] = [
  { name: 'main.js（含 react + lodash + 业务）', sizeKB: 320, gzipKB: 102, type: 'bad' },
]

export const manualChunksRows: BundleRow[] = [
  { name: 'main.js（业务代码）', sizeKB: 95, gzipKB: 32, type: 'good' },
  { name: 'vendor-react.js', sizeKB: 140, gzipKB: 45, type: 'mid' },
  { name: 'vendor-lodash.js', sizeKB: 70, gzipKB: 22, type: 'mid' },
  { name: 'vendor-chart.js', sizeKB: 15, gzipKB: 5, type: 'good' },
]

export const cdnExternalsRows: BundleRow[] = [
  { name: 'main.js（业务代码）', sizeKB: 95, gzipKB: 32, type: 'good' },
  { name: 'vendor-lodash.js', sizeKB: 70, gzipKB: 22, type: 'mid' },
  { name: 'vendor-chart.js', sizeKB: 15, gzipKB: 5, type: 'good' },
  // react / react-dom 通过 CDN 加载，不计入自有产物
]
