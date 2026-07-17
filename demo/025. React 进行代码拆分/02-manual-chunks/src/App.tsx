import { useState, useMemo } from 'react'
import type { FC, ChangeEvent } from 'react'
import { sum, mean, max, min, round, percentile, MATH_LIB_VERSION } from './utils/math'
import { camelCase, kebabCase, truncate, mask, STR_LIB_VERSION } from './utils/string'
import { formatDate, fromNow, DATE_LIB_VERSION } from './utils/date'

interface ChunkInfo {
  name: string
  color: string
  size: string
  contains: string
  cache: string
}

const EXPECTED_CHUNKS: ChunkInfo[] = [
  { name: 'react-vendor.js', color: 'bg-react', size: '~140 KB', contains: 'react, react-dom, scheduler', cache: '极稳定（半年级）' },
  { name: 'utils-vendor.js', color: 'bg-utils', size: '~35 KB', contains: 'lodash 等通用工具', cache: '稳定（月级别）' },
  { name: 'date-vendor.js', color: 'bg-date', size: '~12 KB', contains: 'dayjs', cache: '稳定（月级别）' },
  { name: 'vendor.js', color: 'bg-vendor', size: '~20 KB', contains: '其余第三方', cache: '较稳定' },
  { name: 'main.js', color: 'bg-app', size: '~25 KB', contains: '业务入口 + App', cache: '随业务频繁变化' },
]

const App: FC = () => {
  return (
    <div>
      <div className="hero">
        <h1>02 · Vite manualChunks 配置拆分</h1>
        <p>
          端口：<span className="port">5253</span> &nbsp;|&nbsp; 通过 rollupOptions.output.manualChunks
          把第三方依赖按「稳定性 + 用途」拆成多个 vendor chunk，提升缓存命中率与并行下载能力。
        </p>
      </div>

      <Playground />
      <SingleVsSplit />
      <CacheComparison />
      <ChunkStructure />
      <ConfigExplained />
      <Principles />
    </div>
  )
}

// ---- 实时演练：用「工具库」处理数据，体会上层只依赖工具的稳定 API ----
const Playground: FC = () => {
  const [raw, setRaw] = useState('hello world, react code splitting')
  const [nums, setNums] = useState('12, 45, 78, 23, 56, 89, 34')

  const stats = useMemo(() => {
    const arr = nums.split(/[,\s]+/).map(Number).filter((n) => !Number.isNaN(n))
    if (arr.length === 0) return null
    return {
      sum: round(sum(arr), 2),
      mean: round(mean(arr), 2),
      max: max(arr),
      min: min(arr),
      p50: round(percentile(arr, 50), 2),
      p95: round(percentile(arr, 95), 2),
    }
  }, [nums])

  const strResults = useMemo(() => ({
    camel: camelCase(raw),
    kebab: kebabCase(raw),
    trunc: truncate(raw, 16),
    masked: mask(raw, 4),
  }), [raw])

  return (
    <div className="page">
      <h2>工具库演练 <span className="tag tag-info">uses utils-vendor</span></h2>
      <p>
        下面用到了三个「工具库」（本 demo 以本地 <code>src/utils/*</code> 模拟，真实项目里来自 node_modules）。
        它们体积大、变化少，正是 manualChunks 要拆出去的对象。
      </p>

      <div className="playground">
        <div className="input-card">
          <label>字符串（演示 string-utils）</label>
          <input value={raw} onChange={(e: ChangeEvent<HTMLInputElement>) => setRaw(e.target.value)} />
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>库版本：{STR_LIB_VERSION}</div>
          <div style={{ marginTop: 12 }}>
            <label>数字数组（演示 math-utils）</label>
            <input value={nums} onChange={(e: ChangeEvent<HTMLInputElement>) => setNums(e.target.value)} />
            <div style={{ fontSize: 12, color: '#64748b' }}>库版本：{MATH_LIB_VERSION}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>当前时间（演示 date-utils）</label>
            <div style={{ fontSize: 13, color: '#1e293b' }}>
              {formatDate(Date.now())} &nbsp; <span style={{ color: '#64748b' }}>({fromNow(Date.now() - 3600_000)})</span>
              <div style={{ fontSize: 12, color: '#64748b' }}>库版本：{DATE_LIB_VERSION}</div>
            </div>
          </div>
        </div>

        <div className="result-card">
          <div>// 字符串处理</div>
          <div>camelCase  =&gt; {strResults.camel}</div>
          <div>kebabCase  =&gt; {strResults.kebab}</div>
          <div>truncate16 =&gt; {strResults.trunc}</div>
          <div>mask(4)    =&gt; {strResults.masked}</div>
          <div style={{ marginTop: 8 }}>// 数字统计</div>
          {stats ? (
            <div>
              <div>sum = {stats.sum}, mean = {stats.mean}</div>
              <div>range = [{stats.min}, {stats.max}]</div>
              <div>p50 = {stats.p50}, p95 = {stats.p95}</div>
            </div>
          ) : (
            <div>请输入有效数字</div>
          )}
        </div>
      </div>

      <div className="note">
        关键观察：当业务代码（App.tsx）改动时，三个 vendor chunk 的 hash 不会变，
        用户再次访问时浏览器会直接走磁盘缓存，只重新下载 main.js。
      </div>
    </div>
  )
}

// ---- 单 bundle vs 拆分 chunk 的可视化对比 ----
const SingleVsSplit: FC = () => (
  <div className="page">
    <h2>单 bundle vs manualChunks 拆分</h2>
    <p>同样的代码，构建产物划分方式完全不同：</p>

    <div className="compare">
      <div className="compare-col bad">
        <h4>未拆分：单个大 bundle <span className="tag tag-bad">缓存易失效</span></h4>
        <div className="bundle-stack">
          <div className="bundle-box bg-single" style={{ width: '100%' }}>
            main.js
            <span className="size">react + utils + date + 业务 = ~230 KB</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 12 }}>
          任何一处业务代码改动，整个 main.js hash 变化，用户必须重新下载全部 230 KB。
        </div>
      </div>

      <div className="compare-col good">
        <h4>拆分后：多个独立 chunk <span className="tag tag-good">缓存友好</span></h4>
        <div className="bundle-row">
          <div className="bundle-box bg-react" style={{ flex: 1.3 }}>
            react-vendor
            <span className="size">~140 KB</span>
          </div>
          <div className="bundle-box bg-utils" style={{ flex: 0.5 }}>
            utils
            <span className="size">~35 KB</span>
          </div>
          <div className="bundle-box bg-date" style={{ flex: 0.3 }}>
            date
            <span className="size">~12 KB</span>
          </div>
          <div className="bundle-box bg-app" style={{ flex: 0.4 }}>
            main
            <span className="size">~25 KB</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#14532d', marginTop: 12 }}>
          业务改动只影响 main.js（25 KB），vendor chunk 命中缓存，用户只需重新下载 25 KB。
        </div>
      </div>
    </div>

    <div className="legend">
      <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} />单 bundle</span>
      <span className="legend-item"><span className="legend-dot" style={{ background: '#0891b2' }} />react-vendor</span>
      <span className="legend-item"><span className="legend-dot" style={{ background: '#7c3aed' }} />utils-vendor</span>
      <span className="legend-item"><span className="legend-dot" style={{ background: '#db2777' }} />date-vendor</span>
      <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} />业务 main</span>
    </div>
  </div>
)

// ---- 缓存命中对比表 ----
const CacheComparison: FC = () => {
  const rows: Array<{ scene: string; single: string; split: string }> = [
    { scene: '首次访问', single: '下载 230 KB', split: '下载 212 KB（多请求并行）' },
    { scene: '业务代码更新', single: 'miss 230 KB', split: 'main miss 25 KB + vendor hit' },
    { scene: '升级 react 版本', single: 'miss 230 KB', split: 'react miss 140 KB + 其余 hit' },
    { scene: '升级 lodash 版本', single: 'miss 230 KB', split: 'utils miss 35 KB + 其余 hit' },
  ]
  return (
    <div className="page">
      <h2>缓存命中对比 <span className="tag tag-good">缓存收益</span></h2>
      <p>下表模拟用户在「已访问过一次」后，再次访问时各 chunk 的缓存命中情况：</p>
      <div className="cache-row head">
        <div>场景</div>
        <div>未拆分（单 bundle）</div>
        <div>manualChunks 拆分</div>
      </div>
      {rows.map((r) => (
        <div className="cache-row" key={r.scene}>
          <div style={{ fontWeight: 600 }}>{r.scene}</div>
          <div className="miss">{r.single}</div>
          <div>
            <span className="hit">{r.split}</span>
          </div>
        </div>
      ))}
      <div className="note">
        HTTP/2 下多个小 chunk 可并行传输，首屏总下载量略增（多了几个请求头），
        但二次访问的缓存收益远超首次的请求开销，长线收益明显。
      </div>
    </div>
  )
}

// ---- 预期构建产物表 ----
const ChunkStructure: FC = () => (
  <div className="page">
    <h2>预期构建产物 <span className="tag tag-info">dist/assets/</span></h2>
    <p>执行 <code>npm run build</code> 后，<code>dist/assets</code> 下会得到如下结构：</p>
    <table className="chunk-table">
      <thead>
        <tr>
          <th>chunk 文件</th>
          <th>体积</th>
          <th>包含内容</th>
          <th>缓存稳定性</th>
        </tr>
      </thead>
      <tbody>
        {EXPECTED_CHUNKS.map((c) => (
          <tr key={c.name}>
            <td>
              <span className="dot" style={{ background: colorOf(c.color) }} />
              {c.name}
            </td>
            <td>{c.size}</td>
            <td>{c.contains}</td>
            <td>{c.cache}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3>加载时序</h3>
    <div className="flow">
      <span className="bundle-box bg-react" style={{ minWidth: 100 }}>react-vendor</span>
      <span className="flow-arrow">+</span>
      <span className="bundle-box bg-utils" style={{ minWidth: 80 }}>utils-vendor</span>
      <span className="flow-arrow">+</span>
      <span className="bundle-box bg-date" style={{ minWidth: 70 }}>date-vendor</span>
      <span className="flow-arrow">+</span>
      <span className="bundle-box bg-app" style={{ minWidth: 60 }}>main</span>
      <span className="flow-arrow">=&gt;</span>
      <span style={{ color: '#10b981', fontWeight: 600 }}>并行下载 + 渲染</span>
    </div>
    <div style={{ fontSize: 13, color: '#475569' }}>
      注意：与 React.lazy 不同，manualChunks 不改变加载时机 —— 这些 chunk 仍在首屏一并加载，
      只是分成多个文件以获得缓存与并行下载收益。
    </div>
  </div>
)

function colorOf(cls: string): string {
  const map: Record<string, string> = {
    'bg-react': '#0891b2',
    'bg-utils': '#7c3aed',
    'bg-date': '#db2777',
    'bg-vendor': '#64748b',
    'bg-app': '#10b981',
  }
  return map[cls] ?? '#3b82f6'
}

// ---- 配置代码讲解 ----
const ConfigExplained: FC = () => (
  <div className="page">
    <h2>vite.config.ts 关键配置</h2>
    <p>核心是 <code>build.rollupOptions.output.manualChunks</code>，支持两种写法：</p>

    <h3>写法一：对象形式（简单分组）</h3>
    <pre className="code-block">{`manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'utils-vendor': ['lodash-es', 'dayjs'],
}`}</pre>

    <h3>写法二：函数形式（按 id 动态归类，本 demo 采用）</h3>
    <pre className="code-block">{`manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('scheduler')) {
      return 'react-vendor'
    }
    if (id.includes('lodash')) {
      return 'utils-vendor'
    }
    if (id.includes('dayjs')) {
      return 'date-vendor'
    }
    return 'vendor'   // 其余第三方兜底
  }
  // 不 return => 业务代码留在默认 chunk
}`}</pre>

    <div className="note">
      参数 <code>id</code> 是模块的绝对路径。函数返回字符串即为 chunk 名称；
      返回 undefined 则该模块不被强制分组，由 Rollup 自行决定归属。
    </div>

    <h3>常见坑</h3>
    <div className="info-grid">
      <div className="info-card">
        <div className="value">避免循环依赖</div>
        <div className="desc">手动把互相引用的模块拆到不同 chunk，可能产生循环引用运行时错误。</div>
      </div>
      <div className="info-card">
        <div className="value">不要拆得太碎</div>
        <div className="desc">每个 chunk 都有请求与解析开销，2~6 个 vendor chunk 通常足够。</div>
      </div>
      <div className="info-card">
        <div className="value">动态 import 已自动拆分</div>
        <div className="desc">手动 manualChunks 主要针对静态依赖，动态 import 会自动成 chunk。</div>
      </div>
      <div className="info-card">
        <div className="value">SSR 注意</div>
        <div className="desc">SSR 场景下 node_modules 路径判断需排除服务端入口，避免误拆。</div>
      </div>
    </div>
  </div>
)

// ---- 拆分原则 ----
const Principles: FC = () => {
  const items: Array<{ title: string; body: string }> = [
    { title: '1. 按稳定性拆分', body: '稳定不变的第三方库单独成 chunk，业务代码变动不影响其 hash，缓存长期有效。' },
    { title: '2. 按用途分组', body: 'react、工具库、日期库用途不同，分组后便于针对性升级与缓存管理。' },
    { title: '3. 兼顾体积', body: '过大的单 vendor 可再拆（如把 react 与大型 UI 库分开），过小的可合并。' },
    { title: '4. 与 lazy 配合', body: 'manualChunks 决定「怎么切」，React.lazy 决定「何时加载」，两者正交组合。' },
    { title: '5. 保留兜底 vendor', body: '未显式归类的第三方依赖放入通用 vendor chunk，避免散落到业务 chunk 中。' },
    { title: '6. 验证产物', body: '每次调整后用 build + 包分析插件（rollup-plugin-visualizer）核对 chunk 归属。' },
  ]
  return (
    <div className="page">
      <h2>manualChunks 拆分原则</h2>
      <div className="info-grid">
        {items.map((it) => (
          <div className="info-card" key={it.title}>
            <div className="value">{it.title}</div>
            <div className="desc">{it.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
