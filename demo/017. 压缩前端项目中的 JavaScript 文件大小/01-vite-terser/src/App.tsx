import { useState, CSSProperties } from 'react'
import { sizeEntries, terserOptionsImpact } from './data/sizeData'
import { SizeBar } from './components/SizeBar'

/**
 * 方案一：Vite + Terser 压缩配置
 *
 * 演示要点：
 * 1. 通过 build.minify='terser' + build.terserOptions 控制 Terser 压缩行为；
 * 2. drop_console / drop_debugger 移除调试代码；
 * 3. mangle.toplevel 混淆顶层变量；
 * 4. pure_funcs / dead_code / unused 消除死代码；
 * 5. manualChunks 拆分 vendor，配合 hash 文件名实现长缓存。
 *
 * 页面提供：
 * - 各构建产物的“原始 vs 压缩后”可视化对比；
 * - Terser 关键选项的体积贡献分解；
 * - vite.config.ts 关键片段展示。
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'options' | 'config'>('comparison')

  const totals = sizeEntries[sizeEntries.length - 1]
  const totalSaved = ((totals.original - totals.minified) / totals.original) * 100

  const pageStyle: CSSProperties = {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const summaryStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  }

  const summaryCardStyle = (bg: string, color: string): CSSProperties => ({
    padding: '16px',
    backgroundColor: bg,
    color,
    borderRadius: '10px',
    textAlign: 'center',
  })

  const tabStyle = (active: boolean): CSSProperties => ({
    padding: '8px 20px',
    marginRight: '8px',
    backgroundColor: active ? '#1976d2' : '#f5f5f5',
    color: active ? '#fff' : '#666',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  })

  const tabRowStyle: CSSProperties = {
    marginBottom: '20px',
    display: 'flex',
    flexWrap: 'wrap',
  }

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: '#555',
    lineHeight: 1.8,
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
  }

  const configBlockStyle: CSSProperties = {
    backgroundColor: '#263238',
    color: '#eceff1',
    padding: '16px',
    borderRadius: '8px',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '13px',
    lineHeight: 1.7,
    overflowX: 'auto',
    whiteSpace: 'pre',
  }

  const optionRowStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr auto',
    gap: '12px',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
  }

  const optionHeaderStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr auto',
    gap: '12px',
    padding: '10px 16px',
    backgroundColor: '#f0f0f0',
    fontWeight: 700,
    fontSize: '13px',
    color: '#555',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>方案一：Vite + Terser 代码压缩</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          通过 build.minify='terser' + terserOptions 控制 drop_console / mangle / dead_code
          等压缩行为
        </p>
      </div>

      <div style={summaryStyle}>
        <div style={summaryCardStyle('#fff8e1', '#5d4037')}>
          <div style={{ fontSize: '12px' }}>原始总体积</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {totals.original.toFixed(1)} KB
          </div>
        </div>
        <div style={summaryCardStyle('#e3f2fd', '#0d47a1')}>
          <div style={{ fontSize: '12px' }}>Terser 压缩后</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {totals.minified.toFixed(1)} KB
          </div>
        </div>
        <div style={summaryCardStyle('#e8f5e9', '#1b5e20')}>
          <div style={{ fontSize: '12px' }}>体积节省</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {totalSaved.toFixed(1)}%
          </div>
        </div>
        <div style={summaryCardStyle('#fce4ec', '#880e4f')}>
          <div style={{ fontSize: '12px' }}>减少字节数</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {(totals.original - totals.minified).toFixed(1)} KB
          </div>
        </div>
      </div>

      <div style={descStyle}>
        <strong>原理：</strong>Terser 基于 UglifyJS 演进，使用 <code>parse</code> -&gt;{' '}
        <code>compress</code>（压缩）-&gt; <code>mangle</code>（混淆）-&gt; <code>format</code>
        （输出）流水线，移除注释 / 空白、消除死代码、缩短变量名。 Vite 5 默认使用{' '}
        <code>esbuild</code> 压缩（速度快），切换为 <code>terser</code>
        可获得更细粒度的控制（如 <code>drop_console</code>、<code>pure_funcs</code>）。
      </div>

      <div style={tabRowStyle}>
        <button
          style={tabStyle(activeTab === 'comparison')}
          onClick={() => setActiveTab('comparison')}
        >
          体积对比
        </button>
        <button style={tabStyle(activeTab === 'options')} onClick={() => setActiveTab('options')}>
          Terser 选项贡献
        </button>
        <button style={tabStyle(activeTab === 'config')} onClick={() => setActiveTab('config')}>
          vite.config.ts
        </button>
      </div>

      {activeTab === 'comparison' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            构建产物：原始 vs Terser 压缩后
          </h3>
          {sizeEntries.map((entry) => (
            <div key={entry.name}>
              <SizeBar entry={entry} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'options' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            Terser 关键选项对体积的贡献（相对原始体积的节省比例）
          </h3>
          <div style={optionHeaderStyle}>
            <span>选项</span>
            <span>说明</span>
            <span>节省 %</span>
          </div>
          {terserOptionsImpact.map((opt) => (
            <div key={opt.option} style={optionRowStyle}>
              <span style={{ fontFamily: 'monospace', color: '#1565c0' }}>
                {opt.option}
                {opt.enabled ? '' : ''}
              </span>
              <span style={{ fontSize: '13px', color: '#555' }}>{opt.desc}</span>
              <span style={{ fontWeight: 700, color: '#2e7d32' }}>-{opt.savedPercent}%</span>
            </div>
          ))}
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              backgroundColor: '#fff8e1',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#5d4037',
            }}
          >
            提示：各项节省比例并非简单线性叠加，Terser 会综合应用所有压缩策略。
            <code>drop_console</code> 在调试代码较多的项目中收益最大。
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>vite.config.ts 关键片段</h3>
          <pre style={configBlockStyle}>{`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. 切换压缩器为 terser（默认 esbuild）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // 移除 console.*
        drop_debugger: true,  // 移除 debugger
        pure_funcs: ['__PURE__'],
        unused: true,
        dead_code: true,
      },
      format: {
        comments: false,      // 移除注释
      },
      mangle: {
        toplevel: true,       // 顶层变量名混淆
      },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})`}</pre>
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0d47a1',
            }}
          >
            使用 Terser 需额外安装：<code>npm i -D terser</code>
          </div>
        </div>
      )}
    </div>
  )
}
