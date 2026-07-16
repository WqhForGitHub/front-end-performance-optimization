# 前端项目中资源的缓存配置策略

> 本 demo 演示前端项目中三种主流的资源缓存配置方案，从构建侧到服务端全链路覆盖。

## 简介

Web 性能优化中，**缓存**是收益最高、成本最低的手段之一。合理的缓存策略可以：

- **减少网络请求**：强缓存命中时零请求，零流量
- **减少数据传输**：协商缓存命中返回 304，body 为空
- **降低服务器压力**：减少回源与计算
- **提升用户体验**：页面秒开，资源即时可用

然而，缓存策略配置不当会导致「用户拿不到最新版本」或「缓存命中率低」等问题。本 demo 通过三种方案，演示如何科学配置前端缓存。

## 方案总览

| 方案 | 目录 | 技术栈 | 端口 | 核心思路 |
|------|------|--------|------|----------|
| 方案一：基于内容哈希的缓存 | `01-hash-based-caching` | TypeScript + Vite + React | 5225 | 文件名注入内容 hash，内容变则文件名变 |
| 方案二：分级缓存策略 | `02-split-cache-strategy` | TypeScript + Vite + React | 5226 | 按资源类型配置差异化缓存规则 |
| 方案三：Nginx 服务端缓存配置 | `03-nginx-config` | TypeScript + Vite + React + Nginx | 5227 | nginx.conf 实现强缓存、协商缓存、代理缓存 |

## 缓存基础理论

### 强缓存 vs 协商缓存

| 类型 | 触发条件 | 响应 | 性能 |
|------|----------|------|------|
| 强缓存 | `Cache-Control: max-age` 未过期 | 200 (from disk/memory cache) | 最快，零请求 |
| 协商缓存 | 强缓存过期，携带 `If-None-Match` / `If-Modified-Since` | 304 Not Modified | 较快，有请求无 body |
| 不缓存 | `no-store` | 200 (完整下载) | 最慢 |

### 关键 HTTP 响应头

```
# 强缓存
Cache-Control: public, max-age=31536000, immutable
Expires: Thu, 16 Jul 2026 12:00:00 GMT

# 协商缓存
ETag: "abc123"
Last-Modified: Wed, 16 Jul 2025 12:00:00 GMT

# 禁用缓存
Cache-Control: no-cache        # 每次协商验证
Cache-Control: no-store        # 完全不缓存
Cache-Control: must-revalidate # 过期后必须验证
```

---

## 方案一：基于内容哈希的缓存（Hash-based Cache Busting）

### 核心思想

将文件内容的哈希值注入文件名，作为文件的"指纹"：

- **文件内容不变** → 哈希不变 → 文件名不变 → 浏览器命中强缓存
- **文件内容改变** → 哈希改变 → 文件名改变 → 浏览器重新请求

这样即可安全地配置长期强缓存（`max-age=31536000, immutable`），同时保证内容更新能即时生效。

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
```

### 三种哈希占位符对比（Webpack 体系）

| 占位符 | 计算范围 | 修改源码 | 修改样式 | 推荐度 |
|--------|----------|----------|----------|--------|
| `[hash]` | 整个构建 | 所有文件变 | 所有文件变 | 不推荐 |
| `[chunkhash]` | 单个 chunk | 仅该 chunk 变 | 仅对应 chunk 变 | 较推荐 |
| `[contenthash]` | 文件最终内容 | 仅内容变才变 | 仅内容变才变 | 最推荐 |

> 注：Vite/Rollup 默认的 `[hash]` 已基于 chunk 内容计算，效果类似 `[contenthash]`。

### 配套 Nginx 配置

```nginx
# 带 hash 的静态资源 => 长期强缓存
location ~* \.(js|css|png|jpg|svg|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML 入口 => 不缓存（确保拿到最新 hash 引用）
location ~* \.html$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 运行

```bash
cd "01-hash-based-caching"
npm install
npm run dev      # 开发模式 http://localhost:5225
npm run build    # 构建产物，观察 assets/ 下文件名含 hash
npm run preview  # 预览构建产物
```

---

## 方案二：分级缓存策略（Split Cache Strategy）

### 核心思想

不同类型的资源有不同的更新频率和重要性，一刀切的缓存策略无法兼顾。按资源类型分级配置缓存规则：

| 资源类型 | 缓存策略 | max-age | 原因 |
|----------|----------|---------|------|
| HTML 入口 | no-cache | 0 | 必须每次获取最新 hash 引用 |
| JS/CSS（带 hash） | 长期强缓存 | 1 年 | hash 变化即文件名变化，安全 |
| 图片/字体（带 hash） | 中期缓存 | 30 天 | 更新频率低，平衡命中率 |
| 第三方依赖 vendor | 长期强缓存 | 1 年 | 单独分包，业务变化不影响 |
| API 接口 | no-store | 0 | 实时数据，禁止缓存 |

### Vite 配置：按类型分目录输出

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        // 按类型分目录，便于 Nginx 按 location 匹配不同缓存规则
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) return 'assets/css/[name].[hash].[ext]'
          if (/\.(png|jpe?g|gif|webp|svg)$/.test(name))
            return 'assets/images/[name].[hash].[ext]'
          if (/\.(woff2?|ttf|eot|otf)$/.test(name))
            return 'assets/fonts/[name].[hash].[ext]'
          return 'assets/misc/[name].[hash].[ext]'
        },
        // 第三方依赖单独分包
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    manifest: true,
  },
})
```

### 配套 Nginx 配置

```nginx
# HTML 入口：禁止强缓存
location ~* \.html$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
  expires off;
}

# JS/CSS（带 hash）：一年强缓存
location /assets/js/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location /assets/css/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# 图片/字体（带 hash）：30 天缓存
location /assets/images/ {
  add_header Cache-Control "public, max-age=2592000";
}
location /assets/fonts/ {
  add_header Cache-Control "public, max-age=2592000";
}

# API 接口：禁止缓存
location /api/ {
  add_header Cache-Control "no-store";
  proxy_pass http://backend;
}
```

### 运行

```bash
cd "02-split-cache-strategy"
npm install
npm run dev      # http://localhost:5226
npm run build    # 观察产物按类型分目录
npm run preview
```

---

## 方案三：Nginx 服务端缓存配置

### 核心思想

在服务端通过 `nginx.conf` 配置各类缓存响应头，实现：

1. **强缓存**（`Cache-Control: max-age`）—— 命中时零请求
2. **协商缓存**（`ETag` / `Last-Modified`）—— 命中时返回 304
3. **代理缓存**（`proxy_cache`）—— 缓存后端 API 响应，减少回源
4. **gzip 压缩** —— 减小传输体积

### 完整 nginx.conf

详见 [`03-nginx-config/nginx.conf`](./03-nginx-config/nginx.conf)，关键片段：

```nginx
http {
    # gzip 压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # 代理缓存路径
    proxy_cache_path /var/cache/nginx/api levels=1:2
        keys_zone=api_cache:10m max_size=1g inactive=60m;

    etag on;

    server {
        listen 80;
        root /usr/share/nginx/html;

        # HTML：禁止强缓存
        location ~* \.html$ {
            add_header Cache-Control "no-cache, must-revalidate";
        }

        # 带 hash 的 JS/CSS：一年强缓存
        location ~* \.[a-f0-9]{8,}\.js$ {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # 图片：30 天缓存
        location ~* \.(png|jpg|gif|webp|svg)$ {
            add_header Cache-Control "public, max-age=2592000";
        }

        # API：代理缓存 5 分钟
        location /api/ {
            proxy_cache api_cache;
            proxy_cache_valid 200 5m;
            add_header X-Cache-Status $upstream_cache_status;
            proxy_pass http://backend:3000;
        }

        # SPA 路由回退
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### 浏览器缓存判定流程

```
浏览器请求资源
  │
  ├─ 本地有缓存？
  │    └─ 否 ──-> 请求服务器（200）
  │
  ├─ 强缓存过期？
  │    ├─ 未过期 ──-> 200 (from cache)  [零请求，最快]
  │    └─ 已过期 ──-> 进入协商缓存
  │
  └─ 协商缓存（If-None-Match / If-Modified-Since）
       ├─ 一致 ──-> 304 Not Modified  [有请求无 body，较快]
       └─ 不一致 ──-> 200 + 新资源  [完整下载，最慢]
```

### 运行

```bash
cd "03-nginx-config"
npm install
npm run dev      # http://localhost:5227（仅前端预览）

# 配合 nginx 运行完整缓存演示
npm run build
docker run -d -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

### 验证缓存配置

```bash
# 查看响应头
curl -I http://localhost:8080/assets/js/main.a1b2c3d4.js
# Cache-Control: public, max-age=31536000, immutable
# ETag: "abc123"

# 模拟协商缓存
curl -I -H 'If-None-Match: "abc123"' http://localhost:8080/assets/js/main.a1b2c3d4.js
# HTTP/1.1 304 Not Modified
```

---

## 目录结构

```
015. 前端项目中资源的缓存配置策略/
├── README.md                          # 本文件
├── 01-hash-based-caching/             # 方案一：基于内容哈希的缓存
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                 # 端口 5225，hash 命名
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       └── App.tsx                    # 交互式哈希演示
├── 02-split-cache-strategy/           # 方案二：分级缓存策略
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                 # 端口 5226，按类型分目录
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       └── App.tsx                    # 分级缓存规则可视化
└── 03-nginx-config/                   # 方案三：Nginx 服务端缓存配置
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts                 # 端口 5227
    ├── index.html
    ├── nginx.conf                     # 完整 Nginx 缓存配置
    ├── README.md                      # Nginx 配置详解
    └── src/
        ├── env.d.ts
        ├── main.tsx
        └── App.tsx                    # 缓存响应头/流程/代理缓存演示
```

## 如何运行

### 前置要求

- Node.js >= 18
- Nginx（方案三完整演示需要，可选）

### 运行步骤

```bash
# 进入任一方案目录
cd "01-hash-based-caching"

# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run type-check

# 构建生产产物
npm run build

# 预览构建产物
npm run preview
```

## 最佳实践总结

1. **HTML 文件永远不缓存**：它是获取最新 hash 引用的入口
2. **带 hash 的资源长期强缓存**：内容变则文件名变，安全可靠
3. **按资源类型分级缓存**：更新频率不同，缓存策略不同
4. **第三方依赖单独分包**：业务变化不影响依赖缓存
5. **API 接口按需缓存**：实时数据用 no-store，可缓存数据用代理缓存
6. **开启 gzip 压缩**：减小体积，间接提升缓存效率
7. **保留 ETag 协商缓存兜底**：即使强缓存过期也能减少传输
