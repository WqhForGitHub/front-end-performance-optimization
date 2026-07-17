# 022. 解决前端 SPA 应用首屏加载速度慢的问题

> 针对单页应用（SPA）首屏加载缓慢的痛点，本目录提供 3 种工程化优化方案的完整可运行 Demo（TypeScript + Vite + React）。

## 一、问题背景

SPA 应用通常将所有路由、组件、第三方依赖打包到一个 `bundle.js` 中，导致：

- 首屏需要下载并解析整个 bundle，TTFB / FCP / LCP 都被拉长
- 用户访问 `/home` 时，把 `/dashboard`、`/settings` 的代码也一起加载了，造成带宽浪费
- 第三方库（react、lodash 等）体积庞大，挤占了业务代码的加载预算
- 没有预取（prefetch / preload）策略，路由切换时才开始请求资源，存在明显白屏

## 二、三种优化方案

| 方案 | 目录 | 端口 | 核心思路 |
| --- | --- | --- | --- |
| 路由级懒加载 | `01-route-lazy-loading` | 5243 | `React.lazy` + `Suspense`，按路由切分 bundle |
| 资源预取 / 预连接 | `02-resource-prefetch` | 5244 | `idle` / `hover` 预取、`dns-prefetch`、`preconnect` |
| 构建产物优化 | `03-bundle-optimization` | 5245 | `manualChunks`、CDN externals、tree shaking |

## 三、快速开始

```bash
# 进入任一 demo 目录
cd "01-route-lazy-loading"
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建产物
npm run preview  # 预览构建产物
npm run type-check  # 仅类型检查
```

## 四、目录结构

```
022. 解决前端 SPA 应用首屏加载速度慢的问题
├── README.md
├── 01-route-lazy-loading      # 方案一：路由级懒加载
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── router.ts
│       ├── components
│       │   ├── Layout.tsx
│       │   ├── LoadingFallback.tsx
│       │   └── BundleSizeComparison.tsx
│       └── pages
│           ├── Home.tsx
│           ├── About.tsx
│           ├── Dashboard.tsx
│           └── Settings.tsx
├── 02-resource-prefetch       # 方案二：资源预取
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── hooks
│       │   └── usePrefetch.ts
│       ├── components
│       │   ├── PrefetchDemo.tsx
│       │   ├── NetworkWaterfall.tsx
│       │   └── RoutePrefetchList.tsx
│       └── pages
│           ├── Home.tsx
│           ├── About.tsx
│           └── Contact.tsx
└── 03-bundle-optimization     # 方案三：构建产物优化
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src
        ├── env.d.ts
        ├── main.tsx
        ├── App.tsx
        ├── components
        │   ├── BundleAnalysis.tsx
        │   ├── ViteConfigExample.tsx
        │   └── TreeShakingDemo.tsx
        └── utils
            └── exampleUtils.ts
```

## 五、方案对比

### 1. 路由级懒加载（`01-route-lazy-loading`）

- 使用 `React.lazy` 动态 `import()` 每个路由组件
- `Suspense` 提供 loading fallback
- 收益：首屏只下载当前路由的 chunk，其他路由按需加载
- 量化：单 bundle 假设 320KB，拆分后首屏 chunk 仅 80KB

### 2. 资源预取（`02-resource-prefetch`）

- `requestIdleCallback` 在浏览器空闲时预取下一可能路由的 chunk
- 路由 `hover` 时立即预取，点击时大概率命中缓存
- 通过 `<link rel="dns-prefetch">` / `<link rel="preconnect">` 提前与 API 域名握手
- 收益：路由切换不再有白屏，TTFB 接近 0

### 3. 构建产物优化（`03-bundle-optimization`）

- `build.rollupOptions.output.manualChunks` 把 react、lodash 等稳定依赖拆为独立 chunk，便于长期缓存
- `build.rollupOptions.external` + CDN 引入 react/react-dom，bundle 体积显著下降
- ESM `import` 静态分析 + `sideEffects: false` 启用 tree shaking
- 收益：产物总体积下降 40%+，首屏 chunk 进一步瘦身

## 六、注意事项

- 本 demo 不依赖 `react-router-dom`，使用自定义 hash router 以减少依赖
- `src/env.d.ts` 包含本地类型 fallback，即使不执行 `npm install` 也能通过 `tsc --noEmit`
- `type-check` 脚本与 `vite.config.ts` 在 `tsconfig.json` 的 `include` 中
