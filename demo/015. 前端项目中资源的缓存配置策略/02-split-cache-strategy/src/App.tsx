import { useState, CSSProperties } from 'react'

/**
 * 方案二：分级缓存策略（Split Cache Strategy）
 *
 * 核心思想：根据资源的类型、更新频率、是否带 hash，配置差异化的缓存规则。
 * 一刀切的缓存策略要么导致更新不及时，要么导致缓存命中率低。
 *
 * 分级原则：
 * 1. HTML 入口（无 hash）=> no-cache，每次协商验证
 * 2. JS/CSS（带 hash） => max-age=31536000, immutable，一年强缓存
 * 3. 图片/字体（带 hash） => max-age=2592000，30 天缓存
 * 4. 第三方依赖 => 单独拆 chunk，独立缓存，业务变化不影响
 */

interface ResourceRule {
  type: string
  pattern: string
  cacheControl: string
  maxAge: number // 秒
  strategy: 'no-cache' | 'long' | 'medium' | 'short'
  reason: string
  color: string
}

const resourceRules: ResourceRule[] = [
  {
    type: 'HTML 入口文件',
    pattern: '*.html',
    cacheControl: 'no-cache, no-store, must-revalidate',
    maxAge: 0,
    strategy: 'no-cache',
    reason: 'HTML 引用了带 hash 的 JS/CSS，必须每次获取最新引用，否则用户永远拿不到新版本',
    color: '#fee2e2',
  },
  {
    type: 'JS / CSS（带 hash）',
    pattern: 'assets/js/*.js, assets/css/*.css',
    cacheControl: 'public, max-age=31536000, immutable',
    maxAge: 31536000,
    strategy: 'long',
    reason: '文件名含内容哈希，内容变化 => 文件名变化，可安全长期强缓存',
    color: '#dcfce7',
  },
  {
    type: '图片 / 字体（带 hash）',
    pattern: 'assets/images/*, assets/fonts/*',
    cacheControl: 'public, max-age=2592000',
    maxAge: 2592000,
    strategy: 'medium',
    reason: '更新频率较低，30 天缓存平衡命中率与更新及时性',
    color: '#dbeafe',
  },
  {
    type: '第三方依赖 vendor',
    pattern: 'assets/js/react-vendor.*.js',
    cacheControl: 'public, max-age=31536000, immutable',
    maxAge: 31536000,
    strategy: 'long',
    reason: '依赖版本固定时内容稳定，单独拆分可避免业务代码变化导致依赖缓存失效',
    color: '#fef3c7',
  },
  {
    type: 'API 接口响应',
    pattern: '/api/*',
    cacheControl: 'no-store',
    maxAge: 0,
    strategy: 'no-cache',
    reason: '接口数据实时性要求高，禁止缓存，避免脏数据',
    color: '#fee2e2',
  },
]

const styles: Record<string, CSSProperties> = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: 1000,
    margin: '0 auto',
    padding: '32px 24px',
    color: '#1a1a2e',
    background: '#f8f9fc',
    minHeight: '100vh',
  },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#2d3a5c' },
  subtitle: { fontSize: 15, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #eef0f4',
  },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#2d3a5c' },
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
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    background: '#f1f5f9',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: 600,
    color: '#475569',
  },
  td: { padding: '10px 12px', borderBottom: '1px solid #eef0f4' },
  tag: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
  },
  legend: { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' as const },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 },
  legendColor: { width: 14, height: 14, borderRadius: 4 },
  button: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    marginRight: 8,
  },
  tier: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
}

const strategyLabel: Record<string, { text: string; bg: string; color: string }> = {
  'no-cache': { text: '不缓存', bg: '#fee2e2', color: '#991b1b' },
  long: { text: '长期缓存', bg: '#dcfce7', color: '#166534' },
  medium: { text: '中期缓存', bg: '#dbeafe', color: '#1e40af' },
  short: { text: '短期缓存', bg: '#fef3c7', color: '#92400e' },
}

function formatMaxAge(seconds: number): string {
  if (seconds === 0) return '0（不缓存）'
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)} 天`
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)} 小时`
  return `${seconds} 秒`
}

function SplitCacheStrategyDemo() {
  const [selected, setSelected] = useState<ResourceRule | null>(null)

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>方案二：分级缓存策略（Split Cache Strategy）</h1>
      <p style={styles.subtitle}>
        针对不同类型的资源配置差异化的缓存规则，在「缓存命中率」与「更新及时性」之间取得最优平衡。
        这是生产环境最常用的缓存策略。
      </p>

      {/* 分级概览 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>1. 分级缓存概览</h2>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, background: '#dcfce7' }} /> 长期缓存（1年）
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, background: '#dbeafe' }} /> 中期缓存（30天）
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, background: '#fef3c7' }} /> 短期缓存
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, background: '#fee2e2' }} /> 不缓存
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>资源类型</th>
              <th style={styles.th}>匹配规则</th>
              <th style={styles.th}>Cache-Control</th>
              <th style={styles.th}>max-age</th>
              <th style={styles.th}>策略</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {resourceRules.map((rule, i) => (
              <tr key={i} style={{ background: i === resourceRules.length - 1 ? '#fafafa' : '#fff' }}>
                <td style={styles.td}>{rule.type}</td>
                <td style={{ ...styles.td, fontFamily: 'Consolas, monospace', fontSize: 12 }}>{rule.pattern}</td>
                <td style={{ ...styles.td, fontFamily: 'Consolas, monospace', fontSize: 11 }}>{rule.cacheControl}</td>
                <td style={styles.td}>{formatMaxAge(rule.maxAge)}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.tag, background: strategyLabel[rule.strategy].bg, color: strategyLabel[rule.strategy].color }}>
                    {strategyLabel[rule.strategy].text}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={styles.button} onClick={() => setSelected(rule)}>
                    详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情 */}
      {selected && (
        <div style={{ ...styles.tier, borderLeftColor: selected.color.split('#')[1] ? selected.color : '#4f46e5' }}>
          <h3 style={{ marginTop: 0, color: '#2d3a5c' }}>{selected.type}</h3>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
            <strong>匹配规则：</strong>
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{selected.pattern}</code>
          </p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
            <strong>Cache-Control：</strong>
            <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{selected.cacheControl}</code>
          </p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
            <strong>原因：</strong>{selected.reason}
          </p>
        </div>
      )}

      {/* Vite 配置 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>2. Vite 配置：按类型分目录输出</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          关键点：通过 assetFileNames 将不同类型资源输出到不同目录，便于 Nginx 按 location 匹配不同缓存规则。
        </p>
        <pre style={styles.codeBlock}>{`export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) return 'assets/css/[name].[hash].[ext]'
          if (/\\.(png|jpe?g|gif|webp|svg)$/.test(name))
            return 'assets/images/[name].[hash].[ext]'
          if (/\\.(woff2?|ttf|eot|otf)$/.test(name))
            return 'assets/fonts/[name].[hash].[ext]'
          return 'assets/misc/[name].[hash].[ext]'
        },
        // 第三方依赖单独分包，独立缓存
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    manifest: true, // 生成 manifest 便于服务端映射
  },
})`}</pre>
      </div>

      {/* Nginx 配置 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>3. 对应 Nginx 配置</h2>
        <pre style={styles.codeBlock}>{`# === HTML 入口：禁止强缓存 ===
location ~* \\.html$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
  expires off;
}

# === JS/CSS（带 hash）：一年强缓存 + immutable ===
location /assets/js/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location /assets/css/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# === 图片/字体（带 hash）：30 天缓存 ===
location /assets/images/ {
  add_header Cache-Control "public, max-age=2592000";
}
location /assets/fonts/ {
  add_header Cache-Control "public, max-age=2592000";
}

# === API 接口：禁止缓存 ===
location /api/ {
  add_header Cache-Control "no-store";
  proxy_pass http://backend;
}`}</pre>
      </div>

      {/* 决策树 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>4. 缓存决策树</h2>
        <pre style={styles.codeBlock}>{`资源请求
  │
  ├─ 是否带内容哈希（hash）？
  │    ├─ 是 ──→ 内容变化时文件名变化 ──→ max-age=31536000, immutable
  │    │                                    （可放心长期强缓存）
  │    └─ 否 ──→ 继续判断
  │
  ├─ 是否为 HTML 入口？
  │    ├─ 是 ──→ no-cache（每次协商验证，确保拿到最新 hash 引用）
  │    └─ 否 ──→ 继续判断
  │
  ├─ 是否为 API 接口？
  │    ├─ 是 ──→ no-store（实时数据，禁止缓存）
  │    └─ 否 ──→ 继续判断
  │
  └─ 更新频率？
       ├─ 低（字体/图标）──→ max-age=2592000（30 天）
       ├─ 中（图片）    ──→ max-age=604800（7 天）
       └─ 高（用户头像）──→ max-age=86400（1 天）+ ETag 协商`}</pre>
      </div>
    </div>
  )
}

export default SplitCacheStrategyDemo
