# React 进行代码拆分

> 演示 React + Vite + TypeScript 环境下三种主流的代码拆分（Code Splitting）方案，以及拆分时遵循的原则。

## 为什么需要代码拆分？

随着应用规模增长，单 bundle 体积会迅速膨胀，带来以下问题：

- **首屏加载慢**：浏览器必须下载并解析整个 bundle 才能渲染首屏，白屏时间变长。
- **带宽浪费**：用户可能只访问首页，却下载了整个应用的所有代码。
- **缓存失效**：任何一处改动都会使整个 bundle 的 hash 变化，导致缓存全部失效。
- **解析/编译开销**：大体积 JS 需要更长的解析与编译时间，影响交互就绪（TTI）。

代码拆分的目标是把单一大 bundle 拆成多个按需加载的小 chunk，使浏览器只下载当前需要的代码。

## 拆分原则

1. **按路由拆分**：不同路由对应的组件互不依赖，是天然的拆分边界。用户进入某路由时再加载对应代码。
2. **按优先级拆分**：首屏关键路径代码（首屏组件、必要 vendor）单独打包优先加载；非关键代码延迟加载。
3. **按稳定性拆分**：稳定不变的代码（如第三方库）与频繁变动的业务代码分开，提高缓存命中率。
4. **按体积拆分**：体积过大的模块（图表库、编辑器、Markdown 解析器等）单独成 chunk，按需加载。
5. **粒度适中**：拆分过细会导致 HTTP 请求过多、运行时模块查找开销增大；拆分过粗则失去拆分收益。一般单个 chunk 控制在 30KB~200KB（gzip 前）较合理。
6. **共享依赖提取**：多个 chunk 共同依赖的模块应提取到公共 chunk，避免重复下载。
7. **预加载/预取**：对高概率访问的下一路由可使用 `prefetch`，提升体验但不阻塞首屏。

## 三种方案对比

| 方案                         | 适用场景            | 拆分维度             | 触发时机           |
| ---------------------------- | ------------------- | -------------------- | ------------------ |
| **01 React.lazy + Suspense** | 路由级 / 组件级     | 按路由或组件边界     | 路由切换、组件挂载 |
| **02 Vite manualChunks**     | 第三方库 / 稳定代码 | 按依赖分组的静态拆分 | 构建期决定         |
| **03 动态 import()**         | 重型工具 / 按需功能 | 按功能模块           | 用户交互、条件触发 |

> 三者并不互斥，实际项目通常组合使用：路由用 `React.lazy`，vendor 用 `manualChunks`，重型工具用 `import()`。

## 目录结构

```
025. React 进行代码拆分/
├── README.md
├── 01-lazy-suspense/      # React.lazy + Suspense 路由/组件拆分 (端口 5252)
├── 02-manual-chunks/      # Vite manualChunks 配置 vendor 拆分 (端口 5253)
└── 03-import-dynamic/     # 动态 import() 按需加载 (端口 5254)
```

## 运行方式

每个子目录都是独立项目，进入对应目录后执行：

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器
npm run build    # 构建产物（可观察 chunk 拆分效果）
npm run preview  # 预览构建产物
npm run type-check  # 类型检查
```

各 demo 端口：

- 01-lazy-suspense: http://localhost:5252
- 02-manual-chunks: http://localhost:5253
- 03-import-dynamic: http://localhost:5254

## 关键学习点

### 01 React.lazy + Suspense

- `React.lazy()` 包装动态 `import()` 返回的 Promise，得到可延迟渲染的组件。
- `<Suspense fallback={...}>` 在子组件代码未就绪时展示 fallback。
- 路由级拆分让每个路由成为独立 chunk，首屏只加载首路由代码。
- 配合 `ErrorBoundary` 处理 chunk 加载失败（如网络中断）。

### 02 Vite manualChunks

- 在 `vite.config.ts` 的 `build.rollupOptions.output.manualChunks` 中配置。
- 把 `react`/`react-dom` 拆成 `react-vendor`，把工具库拆成 `utils-vendor`。
- 让稳定的第三方代码独立缓存，业务代码改动不会让 vendor 缓存失效。
- 与 `React.lazy` 不同：manualChunks 是构建期静态拆分，不改变加载时机，只改变 chunk 划分。

### 03 动态 import()

- `import('./module')` 是原生 ES 提案，返回 Promise。
- Vite/Webpack 自动把动态 import 的模块拆成独立 chunk。
- 适合「点一下才用」的重型功能：图表、Markdown、PDF 导出、文件解析等。
- 配合 loading 状态和错误处理，提供更好的用户体验。

## 注意事项

- 拆分不是越多越好：HTTP/2 虽能多路复用，但每个 chunk 仍有请求/解析开销。
- 移动端弱网下，过多小 chunk 的请求开销可能高于合并后的单 bundle。
- 始终用 `npm run build` 后的产物体积和真实网络环境验证拆分效果。
