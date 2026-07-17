# 前端项目中如何配置 HTTP 缓存机制？

HTTP 缓存是前端性能优化中收益最高、成本最低的手段之一。合理的缓存配置可以让二次访问几乎“零网络、零下载”，同时通过协商缓存保证资源实时性。

本目录提供 **3 个递进式方案**，从指令理解到生产部署，覆盖 HTTP 缓存的完整链路。技术栈：**TypeScript + Vite + React**，方案三额外包含可直接部署的 **Nginx** 配置。

## 缓存两阶段速览

| 阶段 | 触发条件 | 关键头 | 状态码 | 传输 |
| --- | --- | --- | --- | --- |
| 强缓存 | `max-age` 未过期 | `Cache-Control`, `Expires` | 200 (from cache) | 0 字节 |
| 协商缓存 | `no-cache` / 过期 | `ETag`, `Last-Modified` 及对应请求头 | 304 / 200 | 304 仅头部 |

## 方案一：Cache-Control 指令演示（端口 5234）

路径：`01-cache-control/`

- Cache-Control 全部核心指令速查表（max-age / no-cache / no-store / public / private / immutable / must-revalidate / s-maxage / stale-while-revalidate 等）
- 浏览器缓存决策流程图，可切换 6 种场景高亮走过的分支
- 交互式 Cache-Control 配置器：勾选指令实时拼接响应头，并给出语义校验提示
- 常见资源推荐配置卡片

```bash
cd 01-cache-control
npm install
npm run dev      # http://localhost:5234
npm run type-check
```

## 方案二：ETag / Last-Modified 协商缓存（端口 5235）

路径：`02-etag-last-modified/`

- 强校验器（ETag）与弱校验器（Last-Modified）对比，响应头/请求头映射关系
- 协商请求交互流程（客户端/服务端双泳道图），可切换“未变更 -> 304”与“已变更 -> 200”两个场景
- 304 协商缓存模拟器：点击发送请求、修改资源，实时记录日志与节省带宽统计
- 强缓存 vs 协商缓存对照表与实战提示

```bash
cd 02-etag-last-modified
npm install
npm run dev      # http://localhost:5235
npm run type-check
```

## 方案三：Nginx 完整 HTTP 缓存配置（端口 5236）

路径：`03-nginx-full-config/`

- 真实可部署的 `nginx.conf`，按资源类型分级设置 Cache-Control：
  - HTML 入口：`no-cache`（每次协商，保证拿到最新 hash 引用）
  - 带 hash 的 JS/CSS：`public, max-age=31536000, immutable`（永久强缓存）
  - 图片：30 天；字体：1 年 + 跨域；JSON/manifest：`no-cache`；Service Worker：`no-store`
- 带语法高亮的配置展示，点击分段查看说明
- 按资源类型的缓存策略卡片表
- 部署与验证：Docker 启动命令 + curl 验证各类响应头（含 304 触发）
- 6 个生产踩坑要点（add_header 继承、HTML 必须 no-cache、immutable 前提等）

```bash
cd 03-nginx-full-config
npm install
npm run dev      # http://localhost:5236（仅本地预览，缓存逻辑以 nginx.conf 为准）
npm run build    # 产物在 dist/

# 用 Nginx 部署验证真实缓存头
docker run -d -p 5236:80 \
  -v $(pwd)/dist:/usr/share/nginx/html \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

## 目录结构

```
018. 前端项目中如何配置 HTTP 缓存机制/
├── README.md
├── 01-cache-control/            # 方案一：Cache-Control 指令
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts             # 本地类型声明（无 node_modules 也能 tsc 通过）
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles.css
│       ├── data/directives.ts
│       └── components/
│           ├── DirectiveTable.tsx
│           ├── CacheFlowDiagram.tsx
│           └── CacheBuilder.tsx
├── 02-etag-last-modified/       # 方案二：ETag / Last-Modified
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles.css
│       ├── data/cacheData.ts
│       └── components/
│           ├── ValidatorComparison.tsx
│           ├── ConditionalRequestFlow.tsx
│           └── SimulationDemo.tsx
└── 03-nginx-full-config/        # 方案三：Nginx 完整配置
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── nginx.conf               # 可直接部署的 Nginx 缓存配置
    └── src/
        ├── env.d.ts
        ├── main.tsx
        ├── App.tsx
        ├── styles.css
        ├── data/nginxData.ts
        └── components/
            ├── ResourceTypeTable.tsx
            ├── ConfigDisplay.tsx
            └── DeploymentGuide.tsx
```

## 核心结论

1. **带 contenthash 的产物**（Vite 默认）-> `max-age=31536000, immutable`，永久强缓存。
2. **HTML 入口** -> `no-cache`，每次协商，避免旧 HTML 指向失效的旧 hash 文件。
3. **敏感数据** -> `no-store`，彻底禁缓存。
4. **ETag 优先于 Last-Modified**，两者并存时服务器只校验 If-None-Match。
5. **生产环境由 Nginx 统一管理缓存头**，注意 `add_header` 在子 location 会覆盖父级。

> 说明：各方案的 `src/env.d.ts` 包含完整的本地类型声明，因此即使不执行 `npm install`（无 node_modules），`npm run type-check`（`tsc --noEmit`）也能通过。
