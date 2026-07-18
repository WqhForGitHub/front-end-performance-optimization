import { CSSProperties } from 'react'
import { compressionEntries, algorithmInfo, nginxDirectives } from './data/compressionData'
import { CompressionBar } from './components/CompressionBar'

/**
 * gzip / brotli 压缩演示
 *
 * 展示构建产物在不同压缩阶段下的体积变化，
 * 并对比 gzip 与 brotli 两种算法的特性。
 */
export default function App() {
  const maxOriginal = Math.max(...compressionEntries.map((e) => e.original))

  const pageStyle: CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const sectionStyle: CSSProperties = { marginBottom: '40px' }

  const titleStyle: CSSProperties = {
    fontSize: '20px',
    color: '#1976d2',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #bbdefb',
  }

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.8,
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const cardStyle: CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    backgroundColor: '#fff',
  }

  const cardTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
  }

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  }

  const thStyle: CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    fontWeight: 600,
  }

  const tdStyle: CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  }

  const codeBlockStyle: CSSProperties = {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: 1.6,
    overflowX: 'auto',
    whiteSpace: 'pre',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>gzip / brotli 压缩</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
          对比原始、压缩、gzip、brotli 四个阶段的文件体积
        </p>
      </div>

      {/* 压缩对比 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>1. 压缩阶段体积对比</h2>
        <div style={descStyle}>
          下方展示了常见前端资源在 4 个阶段的体积变化：原始 → Terser 压缩 → gzip → brotli。 可以看到
          brotli 相比 gzip 还有额外 10%~20% 的压缩收益。
        </div>
        {compressionEntries.map((entry) => (
          <CompressionBar key={entry.name} entry={entry} max={maxOriginal} />
        ))}
      </div>

      {/* 算法对比 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>2. gzip vs brotli 算法对比</h2>
        <div style={descStyle}>
          brotli 由 Google 推出，专门针对 Web 文本内容优化，压缩率比 gzip 高 15%~25%，
          但仅在现代浏览器和 HTTPS 环境下生效。
        </div>
        {algorithmInfo.map((algo) => (
          <div key={algo.name} style={cardStyle}>
            <div style={{ ...cardTitleStyle, color: algo.color }}>{algo.name.toUpperCase()}</div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{algo.desc}</p>
            <table style={tableStyle}>
              <tbody>
                <tr>
                  <th style={thStyle}>压缩等级</th>
                  <td style={tdStyle}>{algo.level}</td>
                </tr>
                <tr>
                  <th style={thStyle}>浏览器兼容</th>
                  <td style={tdStyle}>{algo.compatibility}</td>
                </tr>
                <tr>
                  <th style={thStyle}>平均压缩率</th>
                  <td style={tdStyle}>{(algo.ratio * 100).toFixed(0)}%（相对压缩后）</td>
                </tr>
                <tr>
                  <th style={thStyle}>压缩速度</th>
                  <td style={tdStyle}>{algo.speed}</td>
                </tr>
                <tr>
                  <th style={thStyle}>需要 HTTPS</th>
                  <td style={tdStyle}>{algo.httpsOnly ? '是' : '否'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Vite 配置 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>3. Vite 压缩插件配置</h2>
        <div style={descStyle}>
          使用 <code>vite-plugin-compression</code> 插件在构建时预生成 .gz 和 .br 文件， 配合 Nginx
          的 <code>gzip_static on</code> 和 <code>brotli_static on</code> 直接返回预压缩文件。
        </div>
        <pre style={codeBlockStyle}>{`// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // 生成 .gz 文件
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240, // >10KB 才压缩
      deleteOriginFile: false,
    }),
    // 生成 .br 文件
    viteCompression({
      algorithm: 'brotliCompress',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})`}</pre>
      </div>

      {/* Nginx 配置 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>4. Nginx 静态压缩指令</h2>
        <div style={descStyle}>Nginx 配合预压缩文件，避免运行时压缩 CPU 开销：</div>
        <pre style={codeBlockStyle}>{`server {
    gzip_static on;              # 优先返回 .gz 文件
    brotli_static on;            # 优先返回 .br 文件
    gzip_vary on;                # 响应头加 Vary: Accept-Encoding
    gzip_types text/plain text/css
               application/javascript
               application/json;
}`}</pre>
        <table style={{ ...tableStyle, marginTop: '12px' }}>
          <thead>
            <tr>
              <th style={thStyle}>指令</th>
              <th style={thStyle}>说明</th>
            </tr>
          </thead>
          <tbody>
            {nginxDirectives.map((d) => (
              <tr key={d.directive}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#1976d2' }}>
                  {d.directive}
                </td>
                <td style={tdStyle}>{d.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
