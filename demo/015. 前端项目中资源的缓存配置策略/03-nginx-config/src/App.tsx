import { useState, CSSProperties } from 'react'

/**
 * 方案三：Nginx 服务端缓存配置演示
 *
 * 演示如何通过 nginx.conf 配置：
 * 1. 强缓存（Cache-Control: max-age）
 * 2. 协商缓存（ETag / Last-Modified）
 * 3. 禁用缓存（no-store）
 * 4. gzip 压缩与缓存配合
 * 5. 代理缓存（proxy_cache）
 */

interface CacheHeader {
  header: string
  value: string
  description: string
  type: 'strong' | 'negotiation' | 'none'
}

const cacheHeaders: CacheHeader[] = [
  {
    header: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
    description: '强缓存：浏览器在 1 年内直接使用本地缓存，不发请求。immutable 表示文件永不变。',
    type: 'strong',
  },
  {
    header: 'Cache-Control',
    value: 'no-cache',
    description: '协商缓存：每次都发请求验证资源是否变化（配合 ETag/Last-Modified）。',
    type: 'negotiation',
  },
  {
    header: 'Cache-Control',
    value: 'no-store',
    description: '完全不缓存：连协商缓存都不做，每次都下载完整资源（用于敏感数据）。',
    type: 'none',
  },
  {
    header: 'ETag',
    value: '"abc123"',
    description: '资源的唯一指纹。浏览器发送 If-None-Match 携带 ETag，服务端比对后返回 304 或 200。',
    type: 'negotiation',
  },
  {
    header: 'Last-Modified',
    value: 'Wed, 16 Jul 2025 12:00:00 GMT',
    description: '资源最后修改时间。浏览器发送 If-Modified-Since，服务端比对后返回 304 或 200。',
    type: 'negotiation',
  },
  {
    header: 'Expires',
    value: 'Thu, 16 Jul 2026 12:00:00 GMT',
    description: 'HTTP/1.0 的绝对过期时间，已被 Cache-Control: max-age 取代，作为兜底。',
    type: 'strong',
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
    fontSize: 12.5,
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
  tag: { display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
  flow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 12 },
  flowBox: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 },
  arrow: { color: '#94a3b8', fontSize: 18 },
  tab: {
    padding: '8px 18px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontSize: 14,
    fontWeight: 500,
    color: '#64748b',
  },
  tabActive: { color: '#4f46e5', borderBottom: '2px solid #4f46e5' },
}

const typeLabel: Record<string, { text: string; bg: string; color: string }> = {
  strong: { text: '强缓存', bg: '#dcfce7', color: '#166534' },
  negotiation: { text: '协商缓存', bg: '#dbeafe', color: '#1e40af' },
  none: { text: '不缓存', bg: '#fee2e2', color: '#991b1b' },
}

function NginxConfigDemo() {
  const [tab, setTab] = useState<'headers' | 'nginx' | 'flow' | 'proxy'>('headers')

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>方案三：Nginx 服务端缓存配置</h1>
      <p style={styles.subtitle}>
        通过 nginx.conf 为不同资源配置 Cache-Control、ETag、Last-Modified 等响应头，
        实现强缓存、协商缓存、代理缓存，最大化复用已下载资源。
      </p>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
        <span
          style={{ ...styles.tab, ...(tab === 'headers' ? styles.tabActive : {}) }}
          onClick={() => setTab('headers')}
        >
          缓存响应头
        </span>
        <span
          style={{ ...styles.tab, ...(tab === 'nginx' ? styles.tabActive : {}) }}
          onClick={() => setTab('nginx')}
        >
          nginx.conf
        </span>
        <span
          style={{ ...styles.tab, ...(tab === 'flow' ? styles.tabActive : {}) }}
          onClick={() => setTab('flow')}
        >
          缓存流程
        </span>
        <span
          style={{ ...styles.tab, ...(tab === 'proxy' ? styles.tabActive : {}) }}
          onClick={() => setTab('proxy')}
        >
          代理缓存
        </span>
      </div>

      {/* Tab: 缓存响应头 */}
      {tab === 'headers' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>HTTP 缓存响应头一览</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>响应头</th>
                <th style={styles.th}>示例值</th>
                <th style={styles.th}>类型</th>
                <th style={styles.th}>说明</th>
              </tr>
            </thead>
            <tbody>
              {cacheHeaders.map((h, i) => (
                <tr key={i}>
                  <td style={{ ...styles.td, fontFamily: 'Consolas, monospace', fontWeight: 600 }}>{h.header}</td>
                  <td style={{ ...styles.td, fontFamily: 'Consolas, monospace', fontSize: 12 }}>{h.value}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.tag, background: typeLabel[h.type].bg, color: typeLabel[h.type].color }}>
                      {typeLabel[h.type].text}
                    </span>
                  </td>
                  <td style={styles.td}>{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: nginx.conf */}
      {tab === 'nginx' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>nginx.conf 完整配置</h2>
          <pre style={styles.codeBlock}>{`# ====== HTTP 主配置 ======
http {
  # ----- gzip 压缩（减小传输体积，间接提升缓存效率）-----
  gzip on;
  gzip_comp_level 6;
  gzip_min_length 1024;
  gzip_types text/css application/javascript application/json
             image/svg+xml font/woff2;

  # ----- 代理缓存路径配置 -----
  proxy_cache_path /var/cache/nginx levels=1:2
    keys_zone=api_cache:10m max_size=1g
    inactive=60m use_temp_path=off;

  # ----- ETag 默认开启（基于文件 mtime + size）-----
  etag on;

  server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;

    # 1) HTML 入口：禁止强缓存，每次协商验证
    location ~* \\.html$ {
      add_header Cache-Control "no-cache, must-revalidate";
      expires off;
    }

    # 2) 带 hash 的 JS/CSS：一年强缓存 + immutable
    location ~* \\.[a-f0-9]{8,}\\.js$ {
      add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location ~* \\.[a-f0-9]{8,}\\.css$ {
      add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 3) 图片/字体：30 天缓存
    location ~* \\.(png|jpe?g|gif|webp|avif|svg)$ {
      add_header Cache-Control "public, max-age=2592000";
    }
    location ~* \\.(woff2?|ttf|eot|otf)$ {
      add_header Cache-Control "public, max-age=2592000";
    }

    # 4) API 接口：使用代理缓存（5 分钟）
    location /api/ {
      proxy_cache api_cache;
      proxy_cache_key "$scheme$request_method$host$request_uri";
      proxy_cache_valid 200 5m;
      proxy_cache_valid 404 1m;
      add_header X-Cache-Status $upstream_cache_status;
      proxy_pass http://backend;
    }

    # 5) SPA History 路由回退
    location / {
      try_files $uri $uri/ /index.html;
    }
  }
}`}</pre>
        </div>
      )}

      {/* Tab: 缓存流程 */}
      {tab === 'flow' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>浏览器缓存判定流程</h2>
          <pre style={styles.codeBlock}>{`浏览器请求资源
  │
  ├─ 本地是否有缓存？
  │    └─ 否 ──-> 向服务器请求（200）
  │
  ├─ 强缓存是否过期？（Cache-Control: max-age / Expires）
  │    ├─ 未过期 ──-> 直接使用本地缓存（200 from disk/memory cache）
  │    │             （零请求，最快）
  │    │
  │    └─ 已过期 ──-> 进入协商缓存
  │
  ├─ 协商缓存验证（发送条件请求）
  │    ├─ 发送 If-None-Match: <ETag>
  │    ├─ 发送 If-Modified-Since: <Last-Modified>
  │    │
  │    └─ 服务器比对
  │         ├─ 一致 ──-> 返回 304 Not Modified（无 body，极小）
  │         │            （浏览器使用本地缓存）
  │         └─ 不一致 ──-> 返回 200 + 新资源 + 新 ETag/Last-Modified
  │
  └─ 备注：Cache-Control: no-cache 跳过强缓存，直接协商
           Cache-Control: no-store 完全不缓存`}</pre>
          <div style={styles.flow}>
            <span style={{ ...styles.flowBox, background: '#dcfce7', color: '#166534' }}>200 (from cache)</span>
            <span style={styles.arrow}>最快</span>
            <span style={{ ...styles.flowBox, background: '#dbeafe', color: '#1e40af' }}>304</span>
            <span style={styles.arrow}>较快</span>
            <span style={{ ...styles.flowBox, background: '#fee2e2', color: '#991b1b' }}>200 (完整下载)</span>
            <span style={styles.arrow}>最慢</span>
          </div>
        </div>
      )}

      {/* Tab: 代理缓存 */}
      {tab === 'proxy' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Nginx 代理缓存（proxy_cache）</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
            代理缓存位于 Nginx 与后端之间，可缓存后端 API 响应，减少回源请求。
          </p>
          <pre style={styles.codeBlock}>{`# 定义缓存区域
proxy_cache_path /var/cache/nginx
  levels=1:2              # 目录层级
  keys_zone=api_cache:10m # 共享内存区名:大小（10m ≈ 8万 key）
  max_size=1g             # 磁盘最大缓存 1GB
  inactive=60m            # 60 分钟未访问则淘汰
  use_temp_path=off;      # 直接写入缓存目录，减少拷贝

server {
  location /api/ {
    proxy_cache api_cache;
    # 缓存 key：协议+方法+域名+URI
    proxy_cache_key "$scheme$request_method$host$request_uri";

    # 状态码 -> 缓存时长
    proxy_cache_valid 200 5m;    # 200 响应缓存 5 分钟
    proxy_cache_valid 404 1m;    # 404 缓存 1 分钟

    # 暴露缓存命中状态（HIT/MISS/EXPIRED/STALE）
    add_header X-Cache-Status $upstream_cache_status;

    # 当后端异常时，使用旧缓存兜底（提升可用性）
    proxy_cache_use_stale error timeout updating;

    # 后端
    proxy_pass http://backend;
  }
}`}</pre>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>
            X-Cache-Status 响应头含义：HIT（命中缓存）、MISS（未命中）、EXPIRED（过期已回源）、
            STALE（使用旧缓存兜底）、UPDATING（正在更新）。
          </p>
        </div>
      )}

      {/* 验证命令 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>如何验证缓存配置是否生效</h2>
        <pre style={styles.codeBlock}>{`# 1. 查看响应头（首次请求）
curl -I https://example.com/assets/js/main.a1b2c3d4.js
# 预期看到:
#   Cache-Control: public, max-age=31536000, immutable
#   ETag: "abc123"
#   Last-Modified: Wed, 16 Jul 2025 12:00:00 GMT

# 2. 模拟协商缓存（携带 If-None-Match）
curl -I -H 'If-None-Match: "abc123"' \\
     https://example.com/assets/js/main.a1b2c3d4.js
# 预期返回: HTTP/1.1 304 Not Modified

# 3. 浏览器 DevTools -> Network -> Disable cache 关闭
#    刷新页面，观察 Size 列：
#    - "(disk cache)"  => 强缓存命中
#    - 304              => 协商缓存命中
#    - 实际大小          => 完整下载`}</pre>
      </div>
    </div>
  )
}

export default NginxConfigDemo
