/**
 * Nginx 缓存配置的数据模型：资源类型策略、配置分段说明、nginx.conf 内容
 */

export interface ResourcePolicy {
  type: string
  pattern: string
  cacheControl: string
  ttl: string
  reason: string
  color: string
  icon: string
}

/** 各类资源的缓存策略表 */
export const resourcePolicies: ResourcePolicy[] = [
  {
    type: 'HTML 入口',
    pattern: 'index.html, /',
    cacheControl: 'no-cache',
    ttl: '每次协商',
    reason: '入口必须实时拿到最新 hash 引用，否则旧 HTML 指向失效的旧 hash 资源',
    color: '#2563eb',
    icon: 'H'
  },
  {
    type: '带 hash 的 JS / CSS',
    pattern: '*.js, *.css',
    cacheControl: 'public, max-age=31536000, immutable',
    ttl: '1 年',
    reason: '文件名含 contenthash，内容变即换名，可永久强缓存且刷新也命中',
    color: '#16a34a',
    icon: 'J'
  },
  {
    type: '图片',
    pattern: 'png/jpg/webp/svg…',
    cacheControl: 'public, max-age=2592000',
    ttl: '30 天',
    reason: '图片不常变更，中等时长缓存兼顾更新与性能',
    color: '#9333ea',
    icon: 'I'
  },
  {
    type: '字体',
    pattern: 'woff2/ttf/otf…',
    cacheControl: 'public, max-age=31536000',
    ttl: '1 年',
    reason: '字体文件几乎不变，长缓存并允许跨域',
    color: '#0891b2',
    icon: 'F'
  },
  {
    type: 'JSON / manifest',
    pattern: '*.json, *.webmanifest',
    cacheControl: 'no-cache',
    ttl: '每次协商',
    reason: '配置类文件可能随时更新，需协商校验',
    color: '#ea580c',
    icon: 'J'
  },
  {
    type: 'Service Worker',
    pattern: 'sw.js',
    cacheControl: 'no-cache, no-store, must-revalidate',
    ttl: '禁缓存',
    reason: 'SW 自身必须实时更新，否则无法升级版本',
    color: '#dc2626',
    icon: 'S'
  }
]

/** nginx.conf 分段说明 */
export interface ConfigSection {
  id: string
  title: string
  lineRange: string
  desc: string
  directives: { name: string; explain: string }[]
}

export const configSections: ConfigSection[] = [
  {
    id: 'gzip',
    title: 'Gzip 压缩',
    lineRange: 'L11-L19',
    desc: '压缩文本类资源，减小传输体积。配合 Vary: Accept-Encoding 避免不同编码客户端拿到错乱的缓存。',
    directives: [
      { name: 'gzip on', explain: '开启压缩' },
      { name: 'gzip_vary on', explain: '响应头加 Vary: Accept-Encoding' },
      { name: 'gzip_types', explain: '指定压缩的 MIME 类型' }
    ]
  },
  {
    id: 'html',
    title: 'HTML 入口 (no-cache)',
    lineRange: 'L28-L33',
    desc: 'HTML 是引用其它带 hash 资源的入口，必须每次协商，保证用户始终拿到最新版本引用。',
    directives: [
      { name: 'Cache-Control: no-cache', explain: '可缓存但每次必须校验（ETag/Last-Modified）' }
    ]
  },
  {
    id: 'jscs',
    title: 'JS / CSS (immutable)',
    lineRange: 'L40-L45',
    desc: 'Vite 产物带 contenthash，内容变更即换文件名，因此可永久强缓存并标记 immutable。',
    directives: [
      { name: 'max-age=31536000', explain: '一年强缓存' },
      { name: 'immutable', explain: '用户主动刷新也不发协商请求' }
    ]
  },
  {
    id: 'media',
    title: '图片 / 字体',
    lineRange: 'L52-L66',
    desc: '静态媒体资源不常变化，设置中等至长周期的强缓存。',
    directives: [
      { name: 'max-age=2592000', explain: '图片 30 天' },
      { name: 'max-age=31536000', explain: '字体 1 年，并允许跨域' }
    ]
  },
  {
    id: 'sw',
    title: 'Service Worker 禁缓存',
    lineRange: 'L73-L83',
    desc: 'Service Worker 脚本必须实时更新，否则浏览器会一直运行旧版本导致无法升级。',
    directives: [
      { name: 'no-store', explain: '禁止任何缓存存储' },
      { name: 'must-revalidate', explain: '过期必校验' }
    ]
  },
  {
    id: 'spa',
    title: 'SPA 路由回退',
    lineRange: 'L90-L94',
    desc: '前端路由路径全部回退到 index.html，且 index.html 仍走 no-cache 策略。',
    directives: [
      { name: 'try_files $uri $uri/ /index.html', explain: '找不到文件则返回 index.html' }
    ]
  }
]

/** nginx.conf 原文（用于在界面中展示，与项目根目录 nginx.conf 保持一致） */
export const nginxConfSource = `# ---- Gzip 压缩 ----
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_types text/plain text/css text/javascript
           application/javascript application/json
           application/xml image/svg+xml;

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    etag on;

    # 1. HTML 入口：no-cache 每次协商
    location = /index.html {
        add_header Cache-Control "no-cache" always;
    }

    # 2. 带 hash 的 JS / CSS：永久强缓存
    location ~* \\.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        access_log off;
    }

    # 3. 图片：30 天
    location ~* \\.(png|jpe?g|gif|webp|avif|ico|bmp|svg)$ {
        add_header Cache-Control "public, max-age=2592000" always;
        access_log off;
    }

    # 4. 字体：1 年 + 跨域
    location ~* \\.(woff2?|eot|ttf|otf|ttc)$ {
        add_header Cache-Control "public, max-age=31536000" always;
        add_header Access-Control-Allow-Origin "*" always;
        access_log off;
    }

    # 5. JSON / manifest：no-cache
    location ~* \\.(json|webmanifest)$ {
        add_header Cache-Control "no-cache" always;
    }

    # 6. Service Worker：禁缓存
    location = /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    # 7. SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /index.html;
}`
