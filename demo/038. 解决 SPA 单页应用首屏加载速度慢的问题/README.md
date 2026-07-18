# 解决 SPA 单页应用首屏加载速度慢的问题

本项目通过 **React + TS + Vite** 演示 SPA 单页应用首屏加载速度优化的完整方案。

## 核心问题

SPA 首屏加载慢的根因：
1. **所有页面代码打包在一个 JS 文件中**，首次加载需下载和解析全部代码
2. **白屏时间过长**，从 HTML 下载到 JS 执行渲染中间有空白
3. **vendor 文件过大**，第三方库占用大量首屏带宽
4. **没有预加载机制**，路由切换时才下载对应代码

## 优化方案

### 1. 骨架屏（Skeleton Screen）

- 在 React 挂载前显示骨架屏，避免白屏
- 通过内联 CSS 实现动画，不依赖 JS
- React 挂载完成后移除骨架屏 DOM

### 2. 路由懒加载

- 使用 `React.lazy` 按路由拆分代码
- 首屏只加载首页代码，其他路由按需加载
- 配合 `<Suspense>` 显示 loading 占位

```tsx
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

<Suspense fallback={<LoadingFallback />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
</Suspense>
```

### 3. 代码分割（Code Splitting）

- Vite/Webpack 的 `manualChunks`：把 React、Router 等单独分包
- 利用浏览器缓存：vendor 文件不变则使用缓存

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router-vendor': ['react-router-dom'],
      },
    },
  },
}
```

### 4. 资源预连接与预解析

- `<link rel="preconnect">`：提前建立 TLS 连接
- `<link rel="dns-prefetch">`：提前完成 DNS 解析

### 5. hover 预加载

- 用户 hover 路由链接时预加载对应代码
- 路由切换时几乎瞬间渲染

```tsx
onMouseEnter={() => {
  import('./pages/AboutPage') // 触发预加载
}}
```

### 6. 性能监控

- 使用 `Performance API` 采集 FCP、LCP、DOM Ready 等指标
- 实时显示在页面上，便于观察优化效果

## 快速开始

```bash
cd "demo/038. 解决 SPA 单页应用首屏加载速度慢的问题"

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建（观察 chunk 体积）
npm run build
```

## 演示内容

- **骨架屏**：index.html 内联骨架屏，React 挂载后移除
- **路由懒加载**：3 个页面（首页、关于、仪表盘）按需加载
- **hover 预加载**：鼠标 hover 路由链接时预加载对应代码
- **代码分割**：react-vendor、router-vendor 单独分包
- **性能监控**：实时显示 FCP、LCP、DOM Ready 指标

## 完整优化方案对比

| 优化手段          | 效果                      | 适用场景                       |
| ----------------- | ------------------------- | ------------------------------ |
| 骨架屏            | 避免白屏，提升感知性能    | 所有 SPA                       |
| 路由懒加载        | 首屏只加载首页代码        | 多路由 SPA                     |
| 代码分割          | vendor 单独分包，利用缓存 | 所有项目                       |
| 资源预连接        | 减少 DNS/TLS 握手时间     | 跨域资源多的项目               |
| hover 预加载      | 路由切换瞬间渲染          | 路由较多的项目                 |
| SSR/SSG           | 服务端直出 HTML           | 对 SEO 和首屏有极致要求的项目  |
| CDN 加速          | 减小网络延迟              | 所有生产项目                   |
| Gzip/Brotli 压缩  | 减小传输体积 60%-80%      | 所有生产项目                   |
| 图片懒加载        | 非首屏图片延迟加载        | 图片密集型项目                 |
| Tree Shaking      | 移除未使用代码            | 使用 ESM 的项目                |

## 目录结构

```
038. 解决 SPA 单页应用首屏加载速度慢的问题/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── env.d.ts
    ├── main.tsx
    ├── App.tsx
    └── pages/
        ├── HomePage.tsx
        ├── AboutPage.tsx
        └── DashboardPage.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Vite 5.3+
- React Router 6.26+
- Performance API
