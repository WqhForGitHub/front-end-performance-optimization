# 如何解决前端 SPA 应用首屏加载速度慢的问题

## 问题本质

SPA（Single Page Application）应用的首屏加载慢，根因是**所有页面代码打包在一个 JS 文件中**：

1. **初始包体积大** - 所有页面的组件、路由、依赖都打包在一个 bundle 中，首次加载需要下载和解析全部代码
2. **串行执行** - 浏览器必须下载 JS -> 解析 JS -> 执行 JS -> 渲染页面，每一步都阻塞首屏
3. **白屏时间长** - JS 下载和执行完成前，页面完全空白

## 四种优化方法

### 方法一：直接加载（baseline）

所有页面组件静态导入（`import HomePage from './pages/HomePage'`），打包在一个 JS 文件中。

- 首屏：需要下载所有页面代码，加载慢
- 切换页面：瞬间完成（代码已在内存中）
- 仅用于对比基准

### 方法二：路由懒加载

使用动态导入（`() => import('./pages/AboutPage')`）按需加载页面组件。

- **React**: `const LazyAbout = lazy(() => import('./pages/AboutPage'))` + `<Suspense>`
- **Vue2**: `import('./pages/AboutPage.vue').then(module => ...)`
- **Vue3**: `defineAsyncComponent(() => import('./pages/AboutPage.vue'))`

核心原理：Vite/Webpack 会将动态导入的模块拆分成单独的 chunk 文件，首次只加载首页 chunk，其他页面按需加载。

- 首屏：只加载首页代码，包体积小，加载快
- 首次切换到新页面：需要下载该页面的 chunk，有短暂延迟
- 二次切换：已下载的 chunk 缓存，瞬间完成

### 方法三：懒加载 + 骨架屏

在方法二基础上，加载期间显示骨架屏（灰色占位块 + shimmer 动画）。

- **React**: `<Suspense fallback={<SkeletonPage />}><LazyComponent /></Suspense>`
- **Vue3**: `defineAsyncComponent({ loader: () => import(...), loadingComponent: SkeletonPage })`
- **Vue2**: 使用 `v-if` 控制 loading 状态 + 骨架屏组件

核心原理：利用骨架屏在加载期间提供视觉占位，避免白屏，用户体验更平滑。

### 方法四：预加载

在方法二/三基础上，利用浏览器空闲时间（`requestIdleCallback`）预取其他页面代码。

```ts
// 首页静态导入（首屏立即可用）
import HomePage from './pages/HomePage'

// 其他页面懒加载
const LazyAbout = defineAsyncComponent(() => import('./pages/AboutPage'))

// 空闲时预取其他页面
requestIdleCallback(() => {
  import('./pages/AboutPage')
  import('./pages/DashboardPage')
})
```

核心原理：

- 首屏只加载首页代码（快）
- 首屏渲染完成后，在浏览器空闲时预取其他页面的 chunk
- 用户切换到其他页面时，chunk 可能已下载完成，瞬间显示

## 方法对比

| 方法          | 首屏速度 | 首次切换速度 | 用户体验     | 实现复杂度 |
| ------------- | -------- | ------------ | ------------ | ---------- |
| 直接加载      | 慢       | 瞬间         | 差（白屏长） | 最低       |
| 路由懒加载    | 快       | 有延迟       | 一般（白屏） | 低         |
| 懒加载+骨架屏 | 快       | 有延迟       | 好（骨架屏） | 中         |
| 预加载        | 快       | 快（已预取） | 最佳         | 中高       |

## 其他优化手段（补充）

除了上述四种核心方法，SPA 首屏优化还包括：

| 手段                    | 说明                                    |
| ----------------------- | --------------------------------------- |
| **Gzip/Brotli 压缩**    | 服务端压缩 JS/CSS，减小传输体积         |
| **Tree Shaking**        | 打包时移除未使用的代码                  |
| **CDN 加速**            | 静态资源放到 CDN，减少网络延迟          |
| **HTTP/2**              | 多路复用，并行下载资源                  |
| **Service Worker 缓存** | 离线缓存 JS/CSS，二次访问秒开           |
| **SSR/SSG**             | 服务端渲染/静态生成，首屏直接有 HTML    |
| **Critical CSS 内联**   | 首屏关键 CSS 内联到 HTML，避免阻塞渲染  |
| **资源预加载**          | `<link rel="preload">` 提前下载关键资源 |

## 目录结构

```
006. SPA 应用首屏加载速度慢的问题/
├── react-ts-vite/               # React + TS + Vite (端口 5220)
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx         # 首页
│       │   ├── AboutPage.tsx        # 关于页
│       │   └── DashboardPage.tsx    # 仪表盘页
│       ├── components/
│       │   └── SkeletonPage.tsx     # 骨架屏组件
│       ├── App.tsx                  # 主应用（4 种方法切换）
│       └── main.tsx
├── vue2/                         # Vue2 (端口 5221)
│   └── src/
│       ├── pages/
│       │   ├── HomePage.vue         # 首页
│       │   ├── AboutPage.vue        # 关于页
│       │   └── DashboardPage.vue    # 仪表盘页
│       ├── components/
│       │   └── SkeletonPage.vue     # 骨架屏组件
│       ├── App.vue                  # 主应用（4 种方法切换）
│       └── main.js
└── vue3-ts-vite/                 # Vue3 + TS + Vite (端口 5222)
    └── src/
        ├── pages/
        │   ├── HomePage.vue         # 首页
        │   ├── AboutPage.vue        # 关于页
        │   └── DashboardPage.vue    # 仪表盘页
        ├── components/
        │   └── SkeletonPage.vue     # 骨架屏组件
        ├── App.vue                  # 主应用（4 种方法切换）
        └── main.ts
```

## 启动方式

```bash
# React
cd "006. SPA 应用首屏加载速度慢的问题/react-ts-vite" && npm run dev

# Vue2
cd "006. SPA 应用首屏加载速度慢的问题/vue2" && npm run dev

# Vue3
cd "006. SPA 应用首屏加载速度慢的问题/vue3-ts-vite" && npm run dev
```

每个项目都实现了 4 种优化方法，可通过 Tab 切换。每个项目有 3 个页面（首页、关于、仪表盘），可点击切换页面体验不同方法的加载行为：

- **方法一**：首次加载慢，但页面切换瞬间完成
- **方法二**：首次加载快，但首次切换到新页面有白屏延迟
- **方法三**：首次加载快，切换时显示骨架屏，无白屏
- **方法四**：首次加载快，空闲时预取其他页面，切换时大概率秒开

建议依次体验四种方法，打开浏览器 DevTools 的 Network 面板观察 chunk 的加载时机和大小差异。
