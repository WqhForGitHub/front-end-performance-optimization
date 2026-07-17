import { useState, type FC } from 'react'

type TabKey = 'manualChunks' | 'external' | 'treeShake'

interface Tab {
  key: TabKey
  label: string
  title: string
  code: string
  note: string
}

const tabs: Tab[] = [
  {
    key: 'manualChunks',
    label: 'manualChunks',
    title: '1. 拆分稳定依赖为独立 chunk',
    code: `// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('lodash')) return 'vendor-lodash'
            if (id.includes('chart'))  return 'vendor-chart'
            return 'vendor'
          }
        }
      }
    }
  }
})`,
    note: '稳定依赖单独成 chunk，文件名带内容 hash，浏览器可长期缓存；业务代码变更不会让 vendor chunk 失效。'
  },
  {
    key: 'external',
    label: 'CDN externals',
    title: '2. 通过 external + CDN 引入 react',
    code: `// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})

<!-- index.html -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>`,
    note: 'react / react-dom 完全排除出自有产物，体积进一步下降；CDN 资源可跨站点复用缓存。'
  },
  {
    key: 'treeShake',
    label: 'tree shaking',
    title: '3. ESM 静态分析 + sideEffects',
    code: `// package.json
{
  "sideEffects": false
}

// 业务代码：使用命名导入而非整包导入
import { debounce } from 'lodash-es'   // 命中 tree shaking
import _ from 'lodash'                  // 不会 tree shake，整包打入

// utils.ts：保持纯函数，避免顶层副作用
export function add(a, b) { return a + b }   // 未使用会被剔除
console.log('init')                          // 副作用，会保留并阻止 tree shaking`,
    note: '打包器基于 ESM 静态分析剔除未使用的导出；sideEffects: false 表示模块无副作用，可安全剔除未引用的导出。'
  }
]

export const ViteConfigExample: FC = () => {
  const [active, setActive] = useState<TabKey>('manualChunks')
  const current = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div className="section">
      <h2>1. vite.config.ts 优化配置示例</h2>
      <div className="desc">点击下方 Tab 切换查看三种构建优化配置。</div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={'tab' + (t.key === active ? ' active' : '')}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
        {current.title}
      </div>
      <pre className="code-block">{current.code}</pre>
      <div className="tip">{current.note}</div>
    </div>
  )
}
