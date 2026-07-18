import { useState, CSSProperties } from 'react'
import { optimizationStrategies, chunkSplitData } from './data/optimizationData'
import { StrategyCard } from './components/StrategyCard'
import { ChunkBar } from './components/ChunkBar'

/**
 * 方案二：Webpack + TerserPlugin 压缩与优化
 *
 * 演示要点：
 * 1. optimization.minimize + minimizer(TerserPlugin) 控制 JS 压缩；
 * 2. optimization.splitChunks 配置 vendor / react 分包；
 * 3. optimization.usedExports + sideEffects:false 实现 Tree Shaking；
 * 4. optimization.runtimeChunk='single' 提取运行时；
 * 5. HtmlWebpackPlugin 压缩 HTML。
 *
 * 页面提供：
 * - 各优化策略说明与体积贡献
 * - 分包前后的 chunk 体积对比（单 bundle vs 多 chunk）
 * - webpack.config.ts 关键片段
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'strategies' | 'splitting' | 'config'>('strategies')

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
    backgroundColor: active ? '#7b1fa2' : '#f5f5f5',
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

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  }

  // 单 bundle 体积
  const singleBundle = chunkSplitData[0]
  // 多 chunk 总体积（实际比单 bundle 略大，因为各 chunk 间有少量重复声明，
  // 但首屏只需加载 main + react，体验更好；这里为了对比，用各 chunk 之和）
  const multiChunkTotal = chunkSplitData.slice(1).reduce((sum, c) => sum + c.size, 0)
  const multiChunkFirstLoad = chunkSplitData[1].size + chunkSplitData[2].size // main + react

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>
          方案二：Webpack + TerserPlugin 优化
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          TerserPlugin 压缩 + splitChunks 分包 + Tree Shaking + runtimeChunk 提取
        </p>
      </div>

      <div style={summaryStyle}>
        <div style={summaryCardStyle('#fff8e1', '#5d4037')}>
          <div style={{ fontSize: '12px' }}>单 bundle 总体积</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {singleBundle.size.toFixed(1)} KB
          </div>
        </div>
        <div style={summaryCardStyle('#f3e5f5', '#4a148c')}>
          <div style={{ fontSize: '12px' }}>分包后首屏体积</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {multiChunkFirstLoad.toFixed(1)} KB
          </div>
        </div>
        <div style={summaryCardStyle('#e8f5e9', '#1b5e20')}>
          <div style={{ fontSize: '12px' }}>首屏体积节省</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {(((singleBundle.size - multiChunkFirstLoad) / singleBundle.size) * 100).toFixed(1)}%
          </div>
        </div>
        <div style={summaryCardStyle('#fce4ec', '#880e4f')}>
          <div style={{ fontSize: '12px' }}>分包总 chunk 数</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {chunkSplitData.length - 1}
          </div>
        </div>
      </div>

      <div style={descStyle}>
        <strong>原理：</strong>Webpack 在 <code>mode: 'production'</code> 下自动开启 Tree
        Shaking、Scope Hoisting 与压缩。通过 <code>optimization.minimizer</code> 注入
        <code>TerserPlugin</code> 可细粒度控制 <code>drop_console</code>、<code>mangle</code>
        等；<code>splitChunks</code> 把 <code>node_modules</code> 与 react 拆出独立 chunk， 配合{' '}
        <code>[contenthash]</code> 文件名实现长缓存，大幅减小首屏需要下载的 JS 体积。
      </div>

      <div style={tabRowStyle}>
        <button
          style={tabStyle(activeTab === 'strategies')}
          onClick={() => setActiveTab('strategies')}
        >
          优化策略
        </button>
        <button
          style={tabStyle(activeTab === 'splitting')}
          onClick={() => setActiveTab('splitting')}
        >
          代码分割对比
        </button>
        <button style={tabStyle(activeTab === 'config')} onClick={() => setActiveTab('config')}>
          webpack.config.ts
        </button>
      </div>

      {activeTab === 'strategies' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Webpack 关键优化策略</h3>
          <div style={gridStyle}>
            {optimizationStrategies.map((strategy) => (
              <div key={strategy.name}>
                <StrategyCard strategy={strategy} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'splitting' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            单 bundle vs splitChunks 多 chunk 体积对比
          </h3>
          <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666' }}>
            单 bundle 方案：所有代码（react + 业务 + 工具库）打到 1 个文件，首屏需全量下载。
            <br />多 chunk 方案：按 splitChunks 规则拆成多个 chunk，首屏只需加载 main + react， 其余
            chunk 按需异步加载。
          </div>
          {chunkSplitData.map((chunk, idx) => (
            <div key={idx}>
              <ChunkBar chunk={chunk} max={singleBundle.size} />
            </div>
          ))}
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              backgroundColor: '#f3e5f5',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#4a148c',
            }}
          >
            分包后总下载量略增（{multiChunkTotal.toFixed(1)} KB &gt; {singleBundle.size.toFixed(1)}{' '}
            KB，因为各 chunk 间有少量模块边界声明）， 但首屏只需{' '}
            <strong>{multiChunkFirstLoad.toFixed(1)} KB</strong>， 可显著提升首屏加载速度；同时
            vendor/react chunk 命中长缓存，二次访问更快。
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>webpack.config.ts 关键片段</h3>
          <pre style={configBlockStyle}>{`import TerserPlugin from 'terser-webpack-plugin'

export default {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,   // 移除 console.*
            drop_debugger: true,  // 移除 debugger
            dead_code: true,
            unused: true,
          },
          format: { comments: false },
          mangle: { toplevel: true },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: -10,
        },
        react: {
          test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
          name: 'react',
          priority: 0,
        },
      },
    },
    usedExports: true,        // Tree Shaking
    runtimeChunk: 'single',   // 提取 runtime
    concatenateModules: true, // Scope Hoisting
  },
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
  },
}`}</pre>
        </div>
      )}
    </div>
  )
}
