import { useState, useMemo, CSSProperties, ChangeEvent } from 'react'

/**
 * 方案一：基于内容哈希的缓存策略（Hash-based Cache Busting）
 *
 * 核心思想：将文件内容的哈希值注入到文件名中，作为文件的"指纹"。
 * - 文件内容不变 => 哈希不变 => 浏览器命中强缓存，零请求
 * - 文件内容改变 => 哈希改变 => 文件名改变 => 浏览器重新请求
 *
 * 配合 Cache-Control: max-age=31536000, immutable 可实现长期强缓存。
 */

interface BuildOutput {
  filename: string
  hash: string
  content: string
  size: number
}

// 简单的字符串哈希函数（仅用于演示，生产环境使用 MD5/SHA）
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  // 转为 8 位十六进制
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const styles: Record<string, CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 960,
    margin: '0 auto',
    padding: '32px 24px',
    color: '#1a1a2e',
    background: '#f8f9fc',
    minHeight: '100vh',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    color: '#2d3a5c',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 1.6,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #eef0f4',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    color: '#2d3a5c',
  },
  codeBlock: {
    background: '#1e293b',
    color: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  button: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    marginRight: 8,
    transition: 'background 0.2s',
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 13,
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    background: '#f1f5f9',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: 600,
    color: '#475569',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #eef0f4',
    fontFamily: 'Consolas, "Courier New", monospace',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
  },
  badgeHit: { background: '#dcfce7', color: '#166534' },
  badgeMiss: { background: '#fee2e2', color: '#991b1b' },
  flow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
    marginBottom: 12,
  },
  flowBox: {
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
  },
  arrow: { color: '#94a3b8', fontSize: 18 },
}

function HashBasedCachingDemo() {
  const [content, setContent] = useState(
    'console.log("Hello, v1.0.0");\nfunction add(a, b) { return a + b; }',
  )
  const [version, setVersion] = useState(1)
  const [builds, setBuilds] = useState<BuildOutput[]>([
    {
      filename: 'main.js',
      hash: simpleHash('console.log("Hello, v1.0.0");\nfunction add(a, b) { return a + b; }'),
      content: 'console.log("Hello, v1.0.0");\nfunction add(a, b) { return a + b; }',
      size: 56,
    },
  ])

  const currentHash = useMemo(() => simpleHash(content), [content])

  const handleBuild = () => {
    const newBuild: BuildOutput = {
      filename: 'main.js',
      hash: currentHash,
      content,
      size: content.length,
    }
    setBuilds((prev) => [...prev, newBuild])
    setVersion((v) => v + 1)
  }

  const lastBuild = builds[builds.length - 1]
  const isCacheHit =
    lastBuild && builds.length > 1 ? builds[builds.length - 2].hash === lastBuild.hash : false

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>方案一：基于内容哈希的缓存策略</h1>
      <p style={styles.subtitle}>
        通过在文件名中注入内容哈希（content
        hash），让浏览器能够精确区分「内容已变更」与「内容未变更」，
        从而实现长期强缓存（immutable）与即时更新之间的平衡。
      </p>

      {/* 核心原理 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>1. 核心原理</h2>
        <div style={styles.flow}>
          <span style={{ ...styles.flowBox, background: '#dbeafe', color: '#1e40af' }}>
            文件内容
          </span>
          <span style={styles.arrow}>&rarr;</span>
          <span style={{ ...styles.flowBox, background: '#fef3c7', color: '#92400e' }}>
            哈希算法（MD5/SHA）
          </span>
          <span style={styles.arrow}>&rarr;</span>
          <span style={{ ...styles.flowBox, background: '#dcfce7', color: '#166534' }}>
            生成指纹 hash
          </span>
          <span style={styles.arrow}>&rarr;</span>
          <span style={{ ...styles.flowBox, background: '#e9d5ff', color: '#6b21a8' }}>
            文件名: main.[hash].js
          </span>
        </div>
        <pre style={styles.codeBlock}>{`// 文件名示例
main.a1b2c3d4.js   // 内容 v1 的哈希
main.e5f6g7h8.js   // 内容 v2 的哈希（内容变了 => 哈希变 => 文件名变）

// 服务端响应头
Cache-Control: public, max-age=31536000, immutable`}</pre>
      </div>

      {/* 交互演示 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>2. 交互演示：模拟构建</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          修改下方源码内容，点击「构建」模拟一次打包。观察文件名的哈希变化及缓存命中情况。
        </p>
        <textarea
          style={styles.textarea}
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={styles.button} onClick={handleBuild}>
            模拟构建
          </button>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            当前哈希：
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              {currentHash}
            </code>
          </span>
          {lastBuild && builds.length > 1 && (
            <span style={{ ...styles.badge, ...(isCacheHit ? styles.badgeHit : styles.badgeMiss) }}>
              {isCacheHit ? '缓存命中 (内容未变)' : '缓存失效 (内容已变)'}
            </span>
          )}
        </div>

        <table style={{ ...styles.table, marginTop: 16 }}>
          <thead>
            <tr>
              <th style={styles.th}>版本</th>
              <th style={styles.th}>输出文件名</th>
              <th style={styles.th}>哈希</th>
              <th style={styles.th}>大小</th>
              <th style={styles.th}>缓存</th>
            </tr>
          </thead>
          <tbody>
            {builds.map((b, i) => {
              const prev = builds[i - 1]
              const hit = prev ? prev.hash === b.hash : false
              return (
                <tr key={i}>
                  <td style={styles.td}>v{i + 1}</td>
                  <td style={styles.td}>main.{b.hash}.js</td>
                  <td style={styles.td}>{b.hash}</td>
                  <td style={styles.td}>{b.size} B</td>
                  <td style={styles.td}>
                    {i === 0 ? (
                      <span style={{ ...styles.badge, ...styles.badgeMiss }}>首次请求</span>
                    ) : hit ? (
                      <span style={{ ...styles.badge, ...styles.badgeHit }}>命中</span>
                    ) : (
                      <span style={{ ...styles.badge, ...styles.badgeMiss }}>失效</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Vite 配置 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>3. Vite 配置（vite.config.ts）</h2>
        <pre style={styles.codeBlock}>{`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // [hash] 基于整个 chunk 内容生成
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        // [ext] 保留原始扩展名（css/png/woff...）
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})`}</pre>
      </div>

      {/* 三种哈希对比 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>4. 三种哈希占位符对比</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>占位符</th>
              <th style={styles.th}>计算范围</th>
              <th style={styles.th}>修改源码</th>
              <th style={styles.th}>修改样式</th>
              <th style={styles.th}>推荐度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>[hash]</td>
              <td style={styles.td}>整个构建所有文件</td>
              <td style={styles.td}>所有文件哈希变</td>
              <td style={styles.td}>所有文件哈希变</td>
              <td style={styles.td}>不推荐</td>
            </tr>
            <tr>
              <td style={styles.td}>[chunkhash]</td>
              <td style={styles.td}>单个 chunk</td>
              <td style={styles.td}>仅该 chunk 变</td>
              <td style={styles.td}>仅对应 chunk 变</td>
              <td style={styles.td}>较推荐</td>
            </tr>
            <tr>
              <td style={styles.td}>[contenthash]</td>
              <td style={styles.td}>文件最终内容</td>
              <td style={styles.td}>仅内容变才变</td>
              <td style={styles.td}>仅内容变才变</td>
              <td style={styles.td}>最推荐</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>
          注：Vite/Rollup 默认使用 [hash]，其内部已基于 chunk 内容计算；Webpack 中推荐使用
          [contenthash]。
        </p>
      </div>

      {/* Nginx 配套配置 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>5. 配套 Nginx 配置</h2>
        <pre style={styles.codeBlock}>{`# 带哈希的静态资源 => 长期强缓存
location ~* \\.(js|css|png|jpg|svg|woff2)$ {
  # hash 不变 => 内容不变 => 缓存一年 + immutable
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML 入口 => 不缓存（始终拉最新以获取新的 hash 引用）
location ~* \\.html$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}`}</pre>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>
          HTML 必须设置为不缓存，否则浏览器将永远拿不到新的 hash 文件名引用。
        </p>
      </div>
    </div>
  )
}

export default HashBasedCachingDemo
