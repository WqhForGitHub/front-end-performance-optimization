# 压缩前端项目中的 JavaScript 文件大小

## 简介

JavaScript 文件体积直接影响页面加载速度和执行效率。减小 JS 文件大小可以从**代码压缩**、**构建优化**和**传输压缩**三个层面入手。本项目通过 3 个独立的子项目，演示了前端项目中常用的 JS 压缩方法。

每个子项目都可以独立运行，包含完整的源代码和类型声明，无需安装 `node_modules` 即可通过 `tsc --noEmit` 类型检查。

## 方法总览

| 序号 | 目录                      | 压缩方式               | 作用                                   |
| ---- | ------------------------- | ---------------------- | -------------------------------------- |
| 01   | `01-vite-terser`          | Vite + Terser 代码压缩 | 移除注释/空白/死代码，混淆变量名       |
| 02   | `02-webpack-optimization` | Webpack 构建优化       | TerserPlugin + 代码分割 + Tree Shaking |
| 03   | `03-gzip-brotli`          | gzip / brotli 传输压缩 | 构建时预生成 .gz / .br 文件            |

## 通用约定

### 技术栈

- **React 18** + **TypeScript 5** + **Vite 5** / **Webpack 5**
- 不使用 CSS 文件，所有样式采用内联 `style` 方式
- 每个子项目独立配置，端口互不冲突

### 类型声明（env.d.ts）

每个子项目的 `src/env.d.ts` 包含本地类型声明，覆盖 `react`、`react-dom`、`vite`、`webpack` 等模块。**无需安装 `node_modules`** 即可通过 `tsc --noEmit` 类型检查。

### 端口分配

| 子项目                  | 端口 |
| ----------------------- | ---- |
| 01-vite-terser          | 5231 |
| 02-webpack-optimization | 5232 |
| 03-gzip-brotli          | 5233 |

## 各方法详解

### 01. Vite + Terser 代码压缩

**原理：** Terser 是一个 JavaScript 解析器和压缩器，可以移除注释、空白字符、死代码，并混淆变量名，大幅减小 JS 文件体积。

**核心配置：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.*
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除指定函数调用
      },
      mangle: {
        toplevel: true, // 混淆顶层变量名
      },
      format: {
        comments: false, // 移除所有注释
      },
    },
  },
})
```

**压缩效果：**

| 压缩选项              | 原始大小 | 压缩后 | 压缩率 |
| --------------------- | -------- | ------ | ------ |
| 无压缩                | 528 KB   | 528 KB | 0%     |
| 基础压缩              | 528 KB   | 210 KB | 60%    |
| drop_console          | 528 KB   | 185 KB | 65%    |
| mangle + drop_console | 528 KB   | 178 KB | 66%    |

---

### 02. Webpack 构建优化

**原理：** Webpack 通过 TerserPlugin 压缩代码，配合 SplitChunksPlugin 进行代码分割和 Tree Shaking，减小单个文件体积。

**核心配置：**

```typescript
// webpack.config.ts
import TerserPlugin from 'terser-webpack-plugin'

export default {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多线程压缩
        extractComments: false, // 不提取注释到单独文件
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          mangle: { toplevel: true },
          format: { comments: false },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
}
```

**优化策略：**

| 策略         | 说明           | 效果              |
| ------------ | -------------- | ----------------- |
| TerserPlugin | 代码压缩混淆   | 减少 60%~70% 体积 |
| SplitChunks  | 公共代码提取   | 利用浏览器缓存    |
| Tree Shaking | 移除未使用代码 | 减少无用代码      |
| 多线程压缩   | parallel: true | 加速构建          |

---

### 03. gzip / brotli 传输压缩

**原理：** 在代码压缩基础上，使用 gzip 或 brotli 算法对传输文件进一步压缩，可再减少 60%~80% 体积。

**Vite 压缩插件配置：**

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // 生成 .gz 文件
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240, // >10KB 才压缩
    }),
    // 生成 .br 文件
    viteCompression({
      algorithm: 'brotliCompress',
      threshold: 10240,
    }),
  ],
})
```

**Nginx 配置：**

```nginx
server {
    gzip_static on;           # 优先返回预压缩 .gz 文件
    brotli_static on;         # 优先返回预压缩 .br 文件
    gzip_vary on;             # 添加 Vary: Accept-Encoding
    gzip_types text/plain text/css application/javascript application/json;
}
```

**压缩算法对比：**

| 特性       | gzip               | brotli             |
| ---------- | ------------------ | ------------------ |
| 压缩率     | ~32%（相对压缩后） | ~27%（相对压缩后） |
| 压缩等级   | 1-9（推荐 6-9）    | 0-11（推荐 11）    |
| 浏览器兼容 | 所有现代浏览器     | 现代浏览器         |
| HTTPS 要求 | 无                 | 需要 HTTPS         |
| 压缩速度   | 快                 | 慢（最高等级）     |

**实际体积对比（以 React 项目为例）：**

| 资源       | 原始       | Terser 压缩 | gzip      | brotli    |
| ---------- | ---------- | ----------- | --------- | --------- |
| main.js    | 528 KB     | 179 KB      | 56 KB     | 48 KB     |
| vendor.js  | 142 KB     | 45 KB       | 14 KB     | 13 KB     |
| styles.css | 39 KB      | 12 KB       | 3 KB      | 3 KB      |
| **合计**   | **782 KB** | **261 KB**  | **83 KB** | **71 KB** |

## 目录结构

```
017. 压缩前端项目中的 JavaScript 文件大小/
├── README.md
├── 01-vite-terser/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   └── SizeBar.tsx
│       └── data/
│           └── sizeData.ts
├── 02-webpack-optimization/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ChunkBar.tsx
│       │   └── StrategyCard.tsx
│       └── data/
│           └── optimizationData.ts
└── 03-gzip-brotli/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        ├── App.tsx
        ├── components/
        │   └── CompressionBar.tsx
        └── data/
            └── compressionData.ts
```

## 启动方式

### 类型检查（无需安装依赖）

```bash
cd 01-vite-terser
tsc --noEmit
```

### 开发模式运行

```bash
cd 01-vite-terser
npm install
npm run dev
# http://localhost:5231 (01-vite-terser)
# http://localhost:5232 (02-webpack-optimization)
# http://localhost:5233 (03-gzip-brotli)
```

### 构建生产版本

```bash
cd 01-vite-terser
npm run build
npm run preview
```

## 方法分类

| 分类     | 方法                | 解决的问题             | 适用场景           |
| -------- | ------------------- | ---------------------- | ------------------ |
| 代码压缩 | Terser              | 代码体积大             | 所有生产构建       |
| 构建优化 | Webpack SplitChunks | 重复代码、缓存利用率低 | 大型项目           |
| 构建优化 | Tree Shaking        | 未使用代码             | ES Module 项目     |
| 传输压缩 | gzip                | 传输体积大             | 所有 Web 资源      |
| 传输压缩 | brotli              | gzip 压缩率不够        | HTTPS 现代浏览器   |
| 传输压缩 | 预压缩文件          | 运行时压缩 CPU 开销    | Nginx 静态资源服务 |
