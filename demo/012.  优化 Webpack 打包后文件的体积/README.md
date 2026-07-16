# 优化 Webpack 打包后文件的体积

## 简介

在前端工程化实践中，**打包产物的体积**直接影响页面加载速度、用户体验和服务器带宽成本。Webpack 5 提供了丰富的优化手段，从代码级别的 Tree Shaking 到传输级别的 gzip 压缩，覆盖了打包优化的各个环节。

本 demo 通过 **6 个独立的子项目**，分别演示不同的 Webpack 打包体积优化方法。每个子项目都可以独立运行，并包含详细的中文注释和对比脚本，便于直观理解每种优化手段的效果。

---

## 优化方法概览

| 序号 | 目录 | 优化点 | 作用 |
|:---:|:---|:---|:---|
| 1 | `01-tree-shaking` | Tree Shaking 深度优化 | 移除未使用的代码，减小产物体积 |
| 2 | `02-css-optimization` | CSS 抽取与压缩 | CSS 独立文件 + 压缩，优化加载与缓存 |
| 3 | `03-js-minification` | JS 压缩优化 | terser 激进压缩，移除 console/注释/混淆变量 |
| 4 | `04-gzip-compression` | gzip 预压缩 | 构建时生成 .gz 文件，减少传输体积 |
| 5 | `05-externals-cdn` | externals + CDN | 第三方库走 CDN，不打包进产物 |
| 6 | `06-image-optimization` | 图片压缩 | 构建时压缩图片，减小图片资源体积 |

---

## 通用约定

### 技术栈

- **Webpack 5.93+**：模块打包工具
- **TypeScript 5.5+**：类型安全的 JavaScript
- **ts-loader**：TypeScript 编译加载器
- **ts-node**：直接运行 TypeScript 配置文件
- **html-webpack-plugin**：HTML 模板插件

### 无 node_modules 类型检查

所有子项目均包含 `src/env.d.ts` 本地类型声明文件，使得在 **不执行 `npm install`**（无 node_modules）的情况下，`tsc --noEmit` 也能通过类型检查：

```bash
# 在任意子项目目录下执行，无需安装依赖
npx tsc --noEmit
```

### 构建对比

部分子项目提供对比脚本，通过命令行参数切换配置，便于对比优化前后的产物体积差异：

```bash
# 例如 01-tree-shaking
npm run build          # 开启 tree shaking
npm run build:no-shake # 关闭 tree shaking
```

---

## 各方法详解

### 1. Tree Shaking 深度优化（`01-tree-shaking`）

**原理**：基于 ES Module 的静态结构分析，在编译阶段标记未使用的导出（`usedExports`），在压缩阶段移除未使用代码。

**关键配置**：

```typescript
// webpack.config.ts
optimization: {
  usedExports: true,     // 标记未使用的导出
  sideEffects: true,     // 读取 package.json 的 sideEffects 字段
  minimize: true,        // 压缩并移除未使用代码
}
```

```json
// package.json
{
  "sideEffects": false   // 声明所有模块无副作用，允许安全移除
}
```

**对比脚本**：

```bash
npm run build          # Tree Shaking 开启
npm run build:no-shake # Tree Shaking 关闭（--no-shake）
```

**核心文件**：
- `src/utils/used.ts`：被使用的模块（保留）
- `src/utils/unused.ts`：未被使用的模块（被移除）

---

### 2. CSS 抽取与压缩（`02-css-optimization`）

**原理**：使用 `mini-css-extract-plugin` 将 CSS 从 JS 中抽取为独立文件，使用 `css-minimizer-webpack-plugin` 压缩 CSS。

**关键配置**：

```typescript
// webpack.config.ts
module: {
  rules: [
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    },
  ],
},
plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
  }),
],
optimization: {
  minimizer: [new CssMinimizerPlugin({ parallel: true })],
},
```

**优化效果**：
- CSS 独立文件，可被浏览器并行加载
- 移除注释和空白字符
- 精简颜色值（`#ffffff` -> `#fff`）
- 利用 `contenthash` 实现长效缓存

---

### 3. JS 压缩优化（`03-js-minification`）

**原理**：使用 `terser-webpack-plugin` 进行激进的 JS 代码压缩，包括移除 `console.log`、注释、混淆变量名等。

**关键配置**：

```typescript
// webpack.config.ts
new TerserPlugin({
  parallel: true,
  extractComments: false,
  terserOptions: {
    compress: {
      drop_console: true,      // 移除 console.log
      drop_debugger: true,     // 移除 debugger
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
      passes: 3,               // 多次压缩
      unused: true,            // 移除未使用函数
      collapse_vars: true,     // 折叠常量
      inline: 2,               // 内联函数
    },
    mangle: {
      toplevel: true,          // 顶级变量混淆
    },
    format: {
      comments: false,         // 移除所有注释
    },
  },
}),
```

**对比脚本**：

```bash
npm run build          # 开启 terser 压缩
npm run build:no-minify # 关闭压缩（--no-minify）
```

---

### 4. gzip 预压缩（`04-gzip-compression`）

**原理**：使用 `compression-webpack-plugin` 在构建时生成 `.gz` 预压缩文件，而非在运行时由服务器动态压缩。

**关键配置**：

```typescript
// webpack.config.ts
new CompressionPlugin({
  algorithm: 'gzip',       // 压缩算法
  threshold: 10240,        // 只压缩大于 10KB 的文件
  minRatio: 0.8,           // 最小压缩比率
  deleteOriginalAssets: false, // 保留原始文件
  filename: '[path][base].gz',
  compressionOptions: {
    level: 9,               // 最高压缩级别
  },
}),
```

**优势**：
- 构建时压缩，不占用服务器 CPU
- 响应速度更快，无实时压缩开销
- 服务器配置 `Content-Encoding: gzip` 使用预压缩文件

---

### 5. externals + CDN（`05-externals-cdn`）

**原理**：使用 `externals` 配置将第三方库（如 lodash）排除出打包产物，改为通过 CDN `<script>` 标签加载。

**关键配置**：

```typescript
// webpack.config.ts
externals: {
  lodash: '_',  // key: 模块名, value: CDN 全局变量名
}
```

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

**对比脚本**：

```bash
npm run build          # CDN 模式（lodash 不打包）
npm run build:bundle   # 打包模式（lodash 打包进产物）
```

**优势**：
- 减小打包体积（lodash 约 70KB 不打包）
- CDN 资源可被多站点共享缓存
- 不变更第三方库时，产物 hash 不变

---

### 6. 图片压缩（`06-image-optimization`）

**原理**：使用 `image-webpack-loader` 在构建时压缩图片，配合 Webpack 5 Asset Modules 处理图片资源。

**关键配置**：

```typescript
// webpack.config.ts
{
  test: /\.(png|jpe?g|gif|svg|webp)$/i,
  use: [
    {
      loader: 'image-webpack-loader',
      options: {
        mozjpeg: { quality: 80, progressive: true },
        optipng: { optimizationLevel: 7 },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        svgo: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeMetadata', active: true },
            { name: 'removeComments', active: true },
          ],
        },
      },
    },
  ],
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024,  // 小于 8KB 内联为 base64
    },
  },
},
```

**优化效果**：
- JPEG/PNG/WEBP/GIF/SVG 全格式压缩
- 小图片自动内联为 base64（减少 HTTP 请求）
- 大图片输出独立文件，带 hash 缓存标识

---

## 目录结构

```
012.  优化 Webpack 打包后文件的体积/
├── README.md                          # 本说明文件
├── 01-tree-shaking/                   # Tree Shaking 深度优化
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           ├── used.ts                # 被使用的模块
│           └── unused.ts              # 未被使用的模块（被移除）
├── 02-css-optimization/               # CSS 抽取与压缩
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── css.d.ts
│       ├── index.ts
│       └── styles/
│           ├── main.css
│           └── theme.css
├── 03-js-minification/                # JS 压缩优化
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           └── calculator.ts
├── 04-gzip-compression/               # gzip 预压缩
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           └── data.ts
├── 05-externals-cdn/                  # externals + CDN
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           └── array-utils.ts
└── 06-image-optimization/             # 图片压缩
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── asset-modules.d.ts
        ├── index.ts
        └── assets/
            ├── logo.svg
            └── banner.svg
```

---

## 启动方式

### 1. 安装依赖

进入需要运行的子项目目录，安装依赖：

```bash
cd 01-tree-shaking
npm install
```

### 2. 类型检查（无需安装依赖）

所有子项目均支持在无 node_modules 的情况下进行类型检查：

```bash
npx tsc --noEmit
```

### 3. 开发模式

启动开发服务器：

```bash
npm run dev
```

### 4. 生产构建

执行生产构建：

```bash
npm run build
```

### 5. 对比构建（部分子项目）

部分子项目提供对比脚本，用于对比优化前后的产物体积：

```bash
# 01-tree-shaking
npm run build          # Tree Shaking 开启
npm run build:no-shake # Tree Shaking 关闭

# 03-js-minification
npm run build          # 压缩开启
npm run build:no-minify # 压缩关闭

# 05-externals-cdn
npm run build          # CDN 模式
npm run build:bundle   # 打包模式
```

---

## 方法分类

| 分类 | 方法 | 优化阶段 | 效果 |
|:---|:---|:---:|:---|
| **代码级别** | Tree Shaking | 编译期 | 移除未使用代码 |
| **代码级别** | JS 压缩（terser） | 压缩期 | 移除注释/console、混淆变量 |
| **资源级别** | CSS 抽取与压缩 | 压缩期 | CSS 独立文件 + 压缩 |
| **资源级别** | 图片压缩 | 构建期 | 压缩图片资源 |
| **依赖级别** | externals + CDN | 构建期 | 第三方库走 CDN |
| **传输级别** | gzip 预压缩 | 构建期 | 生成 .gz 预压缩文件 |

---

## 最佳实践建议

1. **生产环境必须开启**：Tree Shaking、JS 压缩、CSS 压缩
2. **大文件推荐**：gzip 预压缩（threshold: 10KB）
3. **第三方库评估**：体积大且稳定的库可走 CDN（externals）
4. **图片资源**：构建时压缩 + 小图片内联 base64
5. **缓存策略**：使用 `contenthash` 实现长效缓存
6. **按需加载**：配合动态 import() 进一步减小首屏体积
