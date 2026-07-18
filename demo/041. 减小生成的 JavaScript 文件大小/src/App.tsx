import { useState, useMemo } from 'react'

interface OptimizationItem {
  title: string
  desc: string
  before: string
  after: string
  code: string
}

// Tree Shaking 演示：只导入需要的函数
// 全量导入会导致整个 lodash 进入 bundle
// 按需导入只打包用到的函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

export default function App() {
  const [count, setCount] = useState(0)
  const [input, setInput] = useState('')

  // useMemo 演示：避免重复计算
  const expensiveValue = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => i).reduce((sum, i) => sum + i, 0)
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
         
        console.log('search:', value)
      }, 300),
    [],
  )

  const optimizations: OptimizationItem[] = [
    {
      title: '1. Tree Shaking',
      desc: '使用 ESM 按需导入，未使用代码被移除',
      before: 'lodash 全量 70KB',
      after: 'lodash-es 按需 4KB',
      code: "import { debounce } from 'lodash-es'",
    },
    {
      title: '2. TerserPlugin 压缩',
      desc: '压缩、混淆、移除注释和 console',
      before: 'bundle 800KB',
      after: 'bundle 280KB',
      code: "drop_console: true, mangle: true",
    },
    {
      title: '3. externals + CDN',
      desc: 'React 走 CDN，不打包进 bundle',
      before: 'bundle 1.2MB',
      after: 'bundle 400KB',
      code: "externals: { react: 'React' }",
    },
    {
      title: '4. Gzip/Brotli 压缩',
      desc: '传输体积减小 60%-80%',
      before: '传输 800KB',
      after: '传输 200KB',
      code: "new CompressionPlugin({ algorithm: 'gzip' })",
    },
    {
      title: '5. splitChunks 分包',
      desc: '第三方库单独分包，利用缓存',
      before: 'app 1MB',
      after: 'app 200KB + vendor 800KB',
      code: 'splitChunks: { chunks: "all" }',
    },
    {
      title: '6. dynamic import',
      desc: '按需加载路由/组件，独立成 chunk',
      before: 'app 1MB',
      after: 'app 200KB + page 800KB',
      code: "const Lazy = lazy(() => import('./Page'))",
    },
    {
      title: '7. sideEffects: false',
      desc: '标记模块无副作用，让 Tree Shaking 更激进',
      before: '保留全部导出',
      after: '只保留用到的',
      code: 'package.json: "sideEffects": false',
    },
    {
      title: '8. babel modules: false',
      desc: '保留 ESM 让 Webpack 做 Tree Shaking',
      before: 'Babel 转 CommonJS',
      after: '保留 ESM',
      code: "['@babel/preset-env', { modules: false }]",
    },
  ]

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>React + Webpack 减小 JS 文件大小</h1>
        <p style={subtitleStyle}>
          Tree Shaking + TerserPlugin + externals + Gzip + splitChunks
        </p>
      </header>

      <div style={gridStyle}>
        {optimizations.map((item) => (
          <div key={item.title} style={cardStyle}>
            <h3 style={h3Style}>{item.title}</h3>
            <p style={descStyle}>{item.desc}</p>
            <div style={compareStyle}>
              <span style={{ color: '#ef4444' }}>前: {item.before}</span>
              <span style={{ color: '#9ca3af' }}>-&gt;</span>
              <span style={{ color: '#10b981' }}>后: {item.after}</span>
            </div>
            <code style={codeStyle}>{item.code}</code>
          </div>
        ))}
      </div>

      <section style={demoStyle}>
        <h3 style={demoH3Style}>交互演示（验证功能正常）</h3>
        <p style={demoPStyle}>useMemo 计算结果：{expensiveValue}</p>
        <p style={demoPStyle}>当前计数：{count}</p>
        <button style={btnStyle} onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <input
          style={inputStyle}
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value)
            debouncedSearch(e.target.value)
          }}
          placeholder="搜索（debounce 演示）"
        />
      </section>

      <footer style={footerStyle}>
        <p>提示：运行 npm run build 查看分包与压缩效果</p>
      </footer>
    </div>
  )
}

const appStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1f2937',
}
const headerStyle: React.CSSProperties = { marginBottom: 24 }
const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: 24, color: '#3b82f6' }
const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: '#6b7280',
}
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  marginBottom: 24,
}
const cardStyle: React.CSSProperties = {
  padding: 16,
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#3b82f6',
  fontSize: 15,
}
const descStyle: React.CSSProperties = {
  color: '#4b5563',
  fontSize: 13,
  margin: '0 0 12px',
}
const compareStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  marginBottom: 10,
  fontSize: 12,
}
const codeStyle: React.CSSProperties = {
  display: 'block',
  background: '#1f2937',
  color: '#a7f3d0',
  padding: '8px 12px',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'Fira Code, Consolas, monospace',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}
const demoStyle: React.CSSProperties = {
  padding: 20,
  background: '#ecfdf5',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
  marginBottom: 24,
}
const demoH3Style: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#15803d',
  fontSize: 16,
}
const demoPStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 14,
  color: '#166534',
}
const btnStyle: React.CSSProperties = {
  padding: '6px 16px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  marginRight: 12,
}
const inputStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
  fontSize: 14,
}
const footerStyle: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
  color: '#9ca3af',
  fontSize: 12,
  textAlign: 'center',
}
