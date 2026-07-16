# 使用 Webpack 进行高效分包优化

## 简介

Webpack 的分包（Code Splitting）是前端性能优化的核心手段之一。通过将代码拆分为多个
小 chunk，可以实现按需加载、并行下载、长期缓存，从而显著减小首屏加载体积、提升页面
加载速度。

本示例集演示了 **5 种** 常见的 Webpack 分包方法，每种方法对应一个独立的子项目，
涵盖从多入口、第三方依赖分离、公共模块提取、动态导入到运行时分离的完整分包策略。

## 分包方法总览

| 序号 | 目录 | 优化点 | 作用 |
| --- | --- | --- | --- |
| 01 | `01-entry-split` | 多入口分包 | 多页面应用中为每个页面生成独立 bundle，互不干扰 |
| 02 | `02-vendor-split` | 第三方依赖分离 | 将 node_modules 中的第三方库分离到独立 vendor chunk，长期缓存 |
| 03 | `03-common-split` | 公共模块提取 | 提取多个入口共享的业务模块到 common chunk，避免重复打包 |
| 04 | `04-dynamic-import` | 动态导入懒加载 | 使用 import() 按需加载模块，减小首屏 bundle 体积 |
| 05 | `05-runtime-chunk` | 运行时分离 | 将 Webpack 运行时代码分离，提升缓存稳定性 |

## 通用约定

所有子项目遵循以下统一约定：

- **构建工具**：Webpack 5 + TypeScript + ts-loader
- **模式**：`mode: 'production'`（生产模式，启用代码压缩）
- **类型检查**：`tsconfig.json` 中 `strict: true`，开启严格类型检查
- **无依赖类型检查**：每个子项目包含 `src/env.d.ts` 本地类型声明，使 `tsc --noEmit`
  在未安装 node_modules 的情况下也能通过
- **配置文件**：使用 TypeScript 编写 `webpack.config.ts`，通过 ts-node 执行
- **HTML 生成**：使用 `html-webpack-plugin` 自动生成 HTML 并注入 chunk 引用

### 文件结构约定

```
<子项目>/
├── package.json          # 依赖与脚本
├── tsconfig.json         # TypeScript 编译配置
├── webpack.config.ts     # Webpack 分包配置（核心）
├── index.html            # HTML 模板
└── src/
    ├── env.d.ts          # 本地类型声明（无需 node_modules 即可通过类型检查）
    ├── index.ts          # 入口文件（单入口项目）
    ├── pages/            # 页面入口（多入口项目）
    ├── shared/           # 共享模块
    ├── utils/            # 工具模块
    └── modules/          # 动态加载模块
```

## 各方法详解

### 01. 多入口分包（entry-split）

**原理**：通过配置多个 `entry` 入口，Webpack 为每个入口生成独立的 bundle。配合多个
`HtmlWebpackPlugin` 实例，为每个页面生成独立的 HTML 文件，只引入该页面需要的 chunk。

**适用场景**：多页面应用（MPA），每个页面相互独立。

**核心配置**：

```typescript
// webpack.config.ts
const config: Configuration = {
  mode: 'production',
  // 多入口：每个入口生成独立 bundle
  entry: {
    pageA: './src/pages/pageA.ts',
    pageB: './src/pages/pageB.ts',
    pageC: './src/pages/pageC.ts'
  },
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    // 每个页面独立 HTML，chunks 指定只引入对应入口
    new HtmlWebpackPlugin({
      filename: 'pageA.html',
      template: './index.html',
      chunks: ['pageA']
    }),
    new HtmlWebpackPlugin({
      filename: 'pageB.html',
      template: './index.html',
      chunks: ['pageB']
    }),
    new HtmlWebpackPlugin({
      filename: 'pageC.html',
      template: './index.html',
      chunks: ['pageC']
    })
  ]
}
```

**构建产出**：

```
dist/
├── pageA.[hash].js     # 页面 A 的 bundle
├── pageB.[hash].js     # 页面 B 的 bundle
├── pageC.[hash].js     # 页面 C 的 bundle
├── pageA.html          # 页面 A 的 HTML
├── pageB.html          # 页面 B 的 HTML
└── pageC.html          # 页面 C 的 HTML
```

> 注意：多入口模式下，被多个入口共享的模块（如 `shared/utils.ts`）会被重复打包进
> 每个入口的 bundle 中。需要配合 `splitChunks` 提取公共模块（见 03）。

---

### 02. 第三方依赖分离（vendor-split）

**原理**：通过 `optimization.splitChunks.cacheGroups.vendors` 将 `node_modules` 中的
第三方库单独打包成 vendor chunk，与应用业务代码分离。

**优势**：
1. 第三方库变更频率低，可长期缓存（浏览器缓存命中率高）
2. 业务代码变更不会导致 vendor chunk 的 contenthash 变化，缓存不失效
3. 浏览器可并行下载多个 chunk，提升加载速度

**核心配置**：

```typescript
// webpack.config.ts
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 将第三方依赖分离到单独的 vendor chunk
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        }
      }
    }
  }
}
```

**构建产出**：

```
dist/
├── vendors.[hash].js   # 第三方库（如 lodash）
└── main.[hash].js      # 业务代码
```

---

### 03. 公共模块提取（common-split）

**原理**：当多个入口共享相同的模块时，`splitChunks` 会自动将公共模块提取到独立的
common chunk 中，避免重复打包。

**对比多入口分包（01）**：01 中 `shared/utils.ts` 会被重复打包进每个页面的 bundle；
本示例通过 `cacheGroups.common` 将共享模块提取到独立的 common chunk。

**核心配置**：

```typescript
// webpack.config.ts
const config: Configuration = {
  mode: 'production',
  entry: {
    pageA: './src/pages/pageA.ts',
    pageB: './src/pages/pageB.ts'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        // 第三方依赖分离
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        },
        // 公共业务模块提取：被 >= 2 个入口共享的模块
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

**构建产出**：

```
dist/
├── vendors.[hash].js   # 第三方依赖
├── common.[hash].js    # 公共业务模块（config、logger）
├── pageA.[hash].js     # 页面 A 业务代码
└── pageB.[hash].js     # 页面 B 业务代码
```

---

### 04. 动态导入懒加载（dynamic-import）

**原理**：使用 ES 的 `import()` 语法实现动态导入，Webpack 会将动态导入的模块拆分为
独立的 chunk，在运行时按需加载。

**优势**：
1. 减小首屏加载的 bundle 体积，加快首屏渲染
2. 用户实际访问某功能时才加载对应代码（按需加载）
3. 配合 `webpackChunkName` 魔法注释可自定义 chunk 名称

**核心配置**：

```typescript
// webpack.config.ts
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: '[name].[contenthash:8].js',
    // 异步加载的 chunk 文件名
    chunkFilename: '[name].[contenthash:8].js'
  }
}
```

**源码用法**：

```typescript
// src/index.ts
document.getElementById('load-chart')?.addEventListener('click', async () => {
  // webpackChunkName 魔法注释：指定异步 chunk 名称
  const { Chart } = await import(/* webpackChunkName: "chart" */ './modules/chart')
  const chart = new Chart({ width: 400, height: 300, type: 'bar' })
  chart.render(content)
})
```

**构建产出**：

```
dist/
├── main.[hash].js      # 主入口代码（首屏加载）
├── chart.[hash].js     # 图表模块（点击时加载）
├── table.[hash].js     # 表格模块（点击时加载）
└── editor.[hash].js    # 编辑器模块（点击时加载）
```

---

### 05. 运行时分离（runtime-chunk）

**原理**：Webpack 在每个 bundle 中会注入运行时代码（模块加载、解析逻辑、chunk 映射表
等）。通过 `optimization.runtimeChunk` 将运行时代码分离到独立的 chunk，避免业务代码
变更导致运行时代码变化，从而影响其他 chunk 的缓存。

**优势**：
1. 运行时代码单独缓存，不受业务代码变更影响
2. 配合 splitChunks 实现最优的缓存策略
3. contenthash 更稳定，提升浏览器缓存命中率

**核心配置**：

```typescript
// webpack.config.ts
const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  optimization: {
    // 将运行时代码分离到单独的 chunk
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        }
      }
    }
  }
}
```

**构建产出**：

```
dist/
├── runtime.[hash].js   # Webpack 运行时代码（模块加载逻辑）
├── vendors.[hash].js   # 第三方依赖
└── main.[hash].js      # 业务代码
```

## 目录结构

```
011.  使用 Webpack 进行高效分包优化/
├── README.md
├── 01-entry-split/                  # 多入口分包
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── pages/
│       │   ├── pageA.ts
│       │   ├── pageB.ts
│       │   └── pageC.ts
│       └── shared/
│           └── utils.ts
├── 02-vendor-split/                 # 第三方依赖分离
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── utils/
│           └── data-processor.ts
├── 03-common-split/                 # 公共模块提取
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── pages/
│       │   ├── pageA.ts
│       │   └── pageB.ts
│       └── shared/
│           ├── config.ts
│           └── logger.ts
├── 04-dynamic-import/               # 动态导入懒加载
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── modules/
│           ├── chart.ts
│           ├── table.ts
│           └── editor.ts
└── 05-runtime-chunk/                # 运行时分离
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── index.ts
        └── utils/
            └── math.ts
```

## 启动方式

### 1. 安装依赖并构建

进入任意子项目目录执行：

```bash
cd 01-entry-split

# 安装依赖
npm install

# 生产构建
npm run build

# 开发模式（本地开发服务器）
npm run dev

# 类型检查
npm run type-check
```

### 2. 无依赖类型检查

每个子项目包含 `src/env.d.ts` 本地类型声明，无需安装 node_modules 即可通过类型检查：

```bash
cd 01-entry-split

# 无需 npm install，直接执行类型检查
npx tsc --noEmit
```

### 3. 查看构建结果

构建完成后，`dist/` 目录下会生成分包后的产物。可通过以下方式查看：

- **多入口项目（01、03）**：直接在浏览器打开 `dist/pageA.html`、`dist/pageB.html`
- **单入口项目（02、04、05）**：直接在浏览器打开 `dist/index.html`
- **动态导入项目（04）**：打开页面后点击按钮，通过 Network 面板观察按需加载的 chunk

## 方法分类

| 分类 | 方法 | 分包触发方式 | 适用场景 |
| --- | --- | --- | --- |
| **入口级分包** | 01 多入口分包 | entry 配置 | 多页面应用（MPA） |
| **入口级分包** | 03 公共模块提取 | splitChunks.minChunks | 多入口共享模块 |
| **依赖级分包** | 02 第三方依赖分离 | splitChunks.cacheGroups.vendors | 第三方库长期缓存 |
| **加载级分包** | 04 动态导入懒加载 | import() 语法 | 按需加载、首屏优化 |
| **缓存级分包** | 05 运行时分离 | optimization.runtimeChunk | 缓存稳定性优化 |

> **最佳实践**：在实际项目中，通常会将多种分包方法组合使用。例如同时启用 vendor
> 分离 + 公共模块提取 + 运行时分离 + 动态导入，以达到最优的加载性能和缓存效果。
