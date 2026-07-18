# Vue 如何优化网站首页的加载速度

本目录通过 **Vue3 + TS + Vite** 与 **Vue2 + Vite(模拟 vue-cli 体验)** 两个独立项目，演示 Vue 网站首页加载速度的优化方案。

## 核心优化手段

### 1. 骨架屏（Skeleton Screen）

- 在 Vue 挂载前显示骨架屏，避免白屏
- 通过内联 CSS 实现骨架屏动画，不依赖 JS
- Vue 挂载完成后移除骨架屏 DOM

### 2. 异步组件懒加载

- 首屏关键内容（Hero 区域）同步加载，确保 LCP 快速渲染
- 非首屏内容（功能特性、数据统计、页脚）使用 `defineAsyncComponent` 异步加载
- 配合 `<Suspense>` 显示 loading 占位

### 3. 资源预连接与预解析

- `<link rel="preconnect">`：提前建立 TLS 连接
- `<link rel="dns-prefetch">`：提前完成 DNS 解析
- 减少首屏关键资源的网络延迟

### 4. 代码分割

- Vite/Webpack 的 `manualChunks`：把 Vue 等大库单独分包
- `cssCodeSplit`：CSS 按需分割
- 路由懒加载（如有路由）

### 5. 关键 CSS 内联

- 首屏关键 CSS 直接内联到 HTML，避免额外请求阻塞渲染
- 非关键 CSS 异步加载

### 6. 性能监控

- 使用 `Performance API` 采集 FCP、LCP、DOM Ready 等指标
- `performance.getEntriesByType('navigation')` 获取详细时间线

## 子项目一览

| 子项目         | 端口 | 技术栈                 | 说明                                              |
| -------------- | ---- | ---------------------- | ------------------------------------------------- |
| `01-vue3-vite` | 5305 | Vue3 + TS + Vite       | 演示 Vue3 首页加载优化（异步组件+骨架屏+性能监控）|
| `02-vue2-cli`  | 5306 | Vue2 + Vite(vue2 插件) | 演示 Vue2 首页加载优化（异步组件+骨架屏+性能监控）|

## 快速开始

```bash
# 进入任一子项目
cd "demo/037. Vue 如何优化网站首页的加载速度/01-vue3-vite"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 一、Vue3 项目（`01-vue3-vite`）

### 演示内容

- **骨架屏**：index.html 中内联骨架屏 CSS + DOM，Vue 挂载后移除
- **首屏 Hero 区域**：同步加载，确保 LCP
- **非首屏内容**：通过 `defineAsyncComponent` 异步加载
- **性能监控**：实时显示 FCP、LCP、DOM Ready 指标
- **Vite 配置**：`manualChunks` 分包、`assetsInlineLimit` 资源内联

### 关键代码

```ts
// 异步组件懒加载
const LazyFeatures = defineAsyncComponent(() => import('./components/FeaturesSection.vue'))

// 性能监控
const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
```

---

## 二、Vue2 项目（`02-vue2-cli`）

### 演示内容

- **骨架屏**：与 Vue3 项目相同的骨架屏方案
- **首屏 Hero 区域**：同步加载
- **非首屏内容**：通过 `v-if="loading"` 模拟异步加载
- **性能监控**：实时显示 FCP、LCP、DOM Ready 指标

### 关键代码

```js
// Vue2 异步组件
components: {
  HeavyComp: () => import('./HeavyComp.vue')
}

// 性能监控
const nav = performance.getEntriesByType('navigation')[0]
```

---

## 首页加载优化完整方案

### 网络层

| 手段                | 效果                                | 实现方式                          |
| ------------------- | ----------------------------------- | --------------------------------- |
| CDN 加速            | 减小网络延迟                        | 静态资源部署到 CDN                |
| HTTP/2              | 多路复用，减少连接数                | 服务器配置                        |
| Gzip/Brotli 压缩    | 减小传输体积 60%-80%                | 服务器/构建工具配置               |
| 资源预连接          | 提前建立连接                        | `<link rel="preconnect">`         |
| DNS 预解析          | 提前完成 DNS                        | `<link rel="dns-prefetch">`       |
| 资源预加载          | 关键资源提前下载                    | `<link rel="preload">`            |

### 资源层

| 手段                | 效果                                | 实现方式                          |
| ------------------- | ----------------------------------- | --------------------------------- |
| 代码分割            | 首屏只加载必要代码                  | 异步组件、路由懒加载              |
| Tree Shaking        | 移除未使用代码                      | ESM + 构建工具                    |
| 图片优化            | 减小图片体积                        | WebP、懒加载、响应式图片          |
| 关键 CSS 内联       | 避免 CSS 阻塞渲染                   | 内联到 HTML                       |
| 字体优化            | 避免字体闪烁                        | `font-display: swap`              |

### 渲染层

| 手段                | 效果                                | 实现方式                          |
| ------------------- | ----------------------------------- | --------------------------------- |
| 骨架屏              | 避免白屏                            | 内联 HTML + CSS                   |
| SSR/SSG             | 服务端直出 HTML                     | Nuxt/Vite SSG                     |
| 懒加载              | 非首屏延迟加载                      | `loading="lazy"`、IntersectionObserver |
| 减少重排重绘        | 提升渲染性能                        | transform、opacity 动画           |

### 监控层

| 指标 | 含义                       | 采集方式                                  |
| ---- | -------------------------- | ----------------------------------------- |
| FCP  | First Contentful Paint     | `performance.getEntriesByName('paint')`  |
| LCP  | Largest Contentful Paint   | `PerformanceObserver` `largest-contentful-paint` |
| FID  | First Input Delay          | `PerformanceObserver` `first-input`       |
| CLS  | Cumulative Layout Shift    | `PerformanceObserver` `layout-shift`      |
| TTFB | Time To First Byte         | `navigation.timing.responseStart`         |

## 目录结构

```
037. Vue 如何优化网站首页的加载速度/
├── README.md
├── 01-vue3-vite/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           ├── HeroSection.vue
│           ├── FeaturesSection.vue
│           ├── StatsSection.vue
│           └── FooterSection.vue
└── 02-vue2-cli/
    ├── package.json
    ├── jsconfig.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        └── App.vue
```

## 技术栈

- Vue 3.4+ / Vue 2.7+
- TypeScript 5.5+（Vue3 项目）
- Vite 5.3+ / Vite 4.5+ (Vue2)
- Performance API
