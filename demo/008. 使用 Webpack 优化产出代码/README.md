# 使用 Webpack 优化产出代码

本目录用 **纯 Webpack 5 + TypeScript** 实现了 8 种常见的产出代码优化手段。每个子目录是一个独立、可运行的最小项目，演示一种优化方法。

所有项目的 `webpack.config.ts` 与 `src` 均已通过 `tsc --noEmit` 严格类型检查（无 TS 报错）。

## 优化方法总览

| 序号 | 目录                       | 优化点                   | 作用                                       |
| ---- | -------------------------- | ------------------------ | ------------------------------------------ |
| 01   | `01-tree-shaking`          | Tree Shaking             | 移除未使用的代码，减小产物体积             |
| 02   | `02-scope-hoisting`        | Scope Hoisting           | 合并模块作用域，减少函数包装开销           |
| 03   | `03-dynamic-import`        | Dynamic Import           | 动态导入拆分代码块，按需加载减小首屏体积   |
| 04   | `04-externals`             | externals                | 将大依赖排除出 bundle，通过 CDN 加载       |
| 05   | `05-prefetch-preload`      | Prefetch / Preload       | 资源提示优化加载时机，提升用户体验         |
| 06   | `06-runtime-chunk`         | runtimeChunk             | 分离运行时代码，优化长缓存命中率           |
| 07   | `07-bundle-analysis`       | Bundle Analysis          | 可视化分析产物体积，辅助优化决策           |
| 08   | `08-source-map`            | Source Map 优化           | 生产环境 Source Map 策略，平衡调试与安全   |

## 通用约定

- **构建工具**：webpack 5 + webpack-cli + ts-node（用于加载 `webpack.config.ts`）
- **TS 配置**：`module: ESNext` + `moduleResolution: bundler`，并通过 `ts-node.compilerOptions.module: CommonJS` 让配置文件可被 Node 直接加载
- **类型检查**：每个项目都有 `type-check` 脚本（`tsc --noEmit`），与转译解耦
- **HTML 入口**：统一使用 `html-webpack-plugin` 生成 `index.html`
- **无依赖类型检查**：每个项目包含 `src/env.d.ts` 本地类型声明，无需 `npm install` 即可通过 `tsc --noEmit`

## 各方法详解

### 01. Tree Shaking（摇树优化）

**原理**：webpack 在生产模式下自动开启 Tree Shaking，通过两个机制配合：

1. `optimization.usedExports` — 分析模块的导入导出关系，标记未使用的导出，压缩阶段移除
2. `package.json` 的 `sideEffects: false` — 告知 webpack 所有模块都是纯模块，可安全删除未被引用的整个文件

**对比**：
- `npm run build` — 开启 Tree Shaking，未使用的函数不会出现在产物中
- `npm run build:no-shake` — 关闭 usedExports，对比产物体积差异

**关键点**：
- Tree Shaking 只对 ESM（`import/export`）有效，CommonJS（`require`）无效
- 有副作用的模块（如 polyfill、CSS）需要在 `sideEffects` 中白名单声明

### 02. Scope Hoisting（作用域提升）

**原理**：默认情况下 webpack 把每个模块包裹在单独的函数闭包中，模块间通过 `__webpack_require__` 调用。开启 `optimization.concatenateModules` 后，webpack 将多个 ESM 模块提升到同一函数作用域，消除不必要的包装函数。

**好处**：
1. 产物体积更小（减少函数包装代码）
2. 运行时更快（减少函数调用开销）
3. 代码可读性更好

**对比**：
- `npm run build` — 开启 Scope Hoisting（production 默认）
- `npm run build:no-hoist` — 关闭 concatenateModules，对比产物结构

### 03. Dynamic Import（动态导入）

**原理**：使用 `import()` 语法时，webpack 自动将动态导入的模块拆分为独立 chunk，运行时按需加载。

**应用场景**：
- 路由级懒加载（SPA 按路由分割）
- 大型组件按需加载（图表编辑器、富文本编辑器）
- 条件性功能加载

**魔法注释**：
- `/* webpackChunkName: "xxx" */` — 自定义 chunk 名称
- `/* webpackMode: "lazy" */` — 加载模式（lazy / lazy-once / eager / weak）

### 04. externals（外部依赖）

**原理**：通过 `externals` 配置将依赖排除出打包，运行时通过 CDN `<script>` 标签加载，webpack 直接引用全局变量。

**适用场景**：
- 体积较大的库（lodash、moment、jQuery）通过 CDN 加载
- 多个项目共享同一份库
- 库开发时将 peerDependencies 排除

**对比**：
- `npm run build` — lodash 通过 CDN 引入，不打包进 bundle
- `npm run build:bundle` — lodash 打包进 bundle，对比体积差异

### 05. Prefetch / Preload（资源提示）

**原理**：webpack 支持在动态 `import()` 中使用魔法注释添加资源提示：

| 提示类型 | 加载时机 | 优先级 | 适用场景 |
|----------|----------|--------|----------|
| `webpackPrefetch: true` | 浏览器空闲时 | 低 | 用户「可能」访问的下一页资源 |
| `webpackPreload: true`  | 与当前页面并行 | 高 | 当前页面「一定」会用到的关键资源 |

**观察方式**：
- 构建后查看 `<head>` 中的 `<link rel="prefetch">` 和 `<link rel="preload">`
- DevTools Network 面板观察加载时机和优先级

### 06. runtimeChunk（运行时分离）

**原理**：webpack 在每个 bundle 中注入运行时代码（模块加载器、模块映射表）。这段代码随模块关系变化而变化，即使业务代码没改，增删模块也会导致 contenthash 更新，使整个 bundle 缓存失效。

通过 `optimization.runtimeChunk` 将 runtime 单独提取：
- 业务代码修改不影响 runtime chunk 的 hash
- runtime chunk 修改不影响业务代码的 hash
- 配合 splitChunks 实现最优缓存命中率

**对比**：
- `npm run build` — 分离 runtime，查看 dist 中的 `runtime.*.js`
- `npm run build:no-runtime` — 不分离，runtime 内联在 bundle 中

### 07. Bundle Analysis（产物分析）

**原理**：webpack-bundle-analyzer 插件在构建后生成可视化报告，以 Treemap 方式展示产物中每个模块的体积占比。

**用途**：
- 发现体积异常的模块
- 分析依赖关系，找出重复打包
- 评估 Tree Shaking、Code Splitting 优化效果
- 对比优化前后的产物体积

**使用**：
- `npm run build` — 构建并生成 `dist/bundle-report.html` 静态报告
- 也可用 `webpack --profile --json > stats.json` 配合 [webpack 官方分析工具](https://webpack.github.io/analyse/)

### 08. Source Map 优化

**原理**：Source Map 记录压缩后代码与源码的映射关系，让浏览器调试时显示原始源码。生产环境需平衡调试体验、安全性和产物体积。

**常用 devtool 选项**：

| devtool                       | 产物体积 | 安全性 | 适用场景           |
|-------------------------------|----------|--------|--------------------|
| `false`                       | 最小     | 最安全  | 生产，无需调试     |
| `nosources-source-map`        | 中       | 中等    | 生产推荐，仅行列号 |
| `hidden-source-map`           | 较大     | 较安全  | 生产，仅后端监控   |
| `source-map`                  | 最大     | 暴露源码 | 开发环境          |
| `cheap-source-map`            | 中       | 暴露源码 | 开发环境          |
| `eval-cheap-source-map`       | 小       | 暴露源码 | 开发环境推荐      |

**对比命令**：
- `npm run build` — nosources-source-map（生产推荐）
- `npm run build:cheap` — cheap-source-map（开发友好）
- `npm run build:source` — source-map（完整 Source Map）
- `npm run build:none` — false（无 Source Map，最小产物）

## 方法分类

| 类别         | 方法                                         | 说明                          |
| ------------ | -------------------------------------------- | ----------------------------- |
| 体积优化     | Tree Shaking、Scope Hoisting、externals     | 减小产物体积                  |
| 加载优化     | Dynamic Import、Prefetch / Preload          | 按需加载，优化加载时机        |
| 缓存优化     | runtimeChunk、Dynamic Import                 | 提升长缓存命中率              |
| 分析与调试   | Bundle Analysis、Source Map                  | 辅助分析与线上调试            |

## 快速开始

```bash
# 进入任意子目录
cd "01-tree-shaking"

# 安装依赖
npm install

# 类型检查
npm run type-check

# 构建
npm run build

# 开发模式
npm run dev
```

## 目录结构

```
008. 使用 Webpack 优化产出代码/
├── README.md
├── 01-tree-shaking/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           ├── math.ts
│           └── unused.ts
├── 02-scope-hoisting/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           ├── format.ts
│           └── calculator.ts
├── 03-dynamic-import/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── modules/
│           ├── chart.ts
│           └── exportUtil.ts
├── 04-externals/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       └── index.ts
├── 05-prefetch-preload/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── modules/
│           ├── auth.ts
│           └── settings.ts
├── 06-runtime-chunk/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       └── index.ts
├── 07-bundle-analysis/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           └── dataProcessor.ts
└── 08-source-map/
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── index.ts
        └── utils/
            └── processor.ts
```
