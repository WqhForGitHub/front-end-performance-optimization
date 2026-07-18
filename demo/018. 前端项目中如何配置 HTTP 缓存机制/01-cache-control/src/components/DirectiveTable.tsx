import { directives, type DirectiveInfo } from '../data/directives'

const categoryLabel: Record<DirectiveInfo['category'], string> = {
  freshness: '新鲜度',
  cacheability: '可缓存性',
  revalidation: '再校验',
  misc: '其它',
}

const categoryColor: Record<DirectiveInfo['category'], string> = {
  freshness: '#16a34a',
  cacheability: '#2563eb',
  revalidation: '#ea580c',
  misc: '#64748b',
}

export default function DirectiveTable() {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Cache-Control 指令速查表</h2>
        <p>
          HTTP/1.1 定义的 Cache-Control
          响应头由多个指令组成，用逗号分隔。下表列出前端常用的核心指令。
        </p>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>指令</th>
              <th style={{ width: '90px' }}>分类</th>
              <th style={{ width: '80px' }}>请求头</th>
              <th>说明</th>
              <th style={{ width: '240px' }}>示例</th>
            </tr>
          </thead>
          <tbody>
            {directives.map((d) => (
              <tr key={d.name}>
                <td>
                  <code className="tag" style={{ background: '#eef2ff', color: '#3730a3' }}>
                    {d.name}
                    {d.value ? <span style={{ color: '#64748b' }}>=…</span> : null}
                  </code>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: categoryColor[d.category] + '22',
                      color: categoryColor[d.category],
                    }}
                  >
                    {categoryLabel[d.category]}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{d.requestSide ? '是' : '否'}</td>
                <td className="muted">{d.description}</td>
                <td>
                  <code className="inline-code">{d.example}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="legend-row">
        <span className="legend-title">分类图例：</span>
        {(Object.keys(categoryLabel) as DirectiveInfo['category'][]).map((k) => (
          <span
            key={k}
            className="badge"
            style={{ background: categoryColor[k] + '22', color: categoryColor[k] }}
          >
            {categoryLabel[k]}
          </span>
        ))}
      </div>
    </section>
  )
}
