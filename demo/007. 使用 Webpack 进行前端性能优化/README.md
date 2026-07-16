# 使用 Webpack 进行前端性能优化

本目录用 **纯 Webpack 5 + TypeScript** 实现了 8 种常见的构建期性能优化手段。每个子目录是一个独立、可运行的最小项目，演示一种优化方法。

所有项目的 `webpack.config.ts` 与 `src` 均可通过 `tsc --noEmit` 类型检查（无 TS 报错），且**无需安装依赖**即可运行（见下方「无需安装即可类型检查」说明）。

## 优化方法总览

| 序号 | 目录                       | 优化点                  | 作用                                       |
| ---- | -------------------------- | ----------------------- | ------------------------------------------ |
| 01   | `01-thread-loader`         | thread-loader           | 多进程并行打包，加快编译速度               |
| 02   | `02-image-webpack-loader`  | image-webpack-loader    | 构建期压缩图片，减小资源体积               |
| 03   | `03-babel-loader-cache`    | babel-loader 缓存       | 缓存转译结果，加速二次构建                 |
| 04   | `04-dll-plugin`            | DllPlugin               | 预打包第三方依赖，避免重复编译             |
| 05   | `05-terser-webpack-plugin` | terser-webpack-plugin   | 压缩混淆 JS，移除 console / 注释           |
| 06   | `06-mini-css-extract-plugin` | mini-css-extract-plugin | 抽取 CSS 为独立文件并压缩                  |
| 07   | `07-compression-webpack-plugin` | compression-webpack-plugin | 预生成 gzip 压缩文件，减小传输体积         |
| 08   | `08-split-chunks`          | splitChunks             | 提取公共模块，减少重复代码，利于缓存       |

## 通用约定

- **构建工具**：webpack 5 + webpack-cli + ts-node（用于加载 `webpack.config.ts`）
- **TS 配置**：`module: ESNext` + `moduleResolution: bundler`；`ts-node.compilerOptions` 中覆盖为 `module: CommonJS` + `moduleResolution: node`，让配置文件可被 Node 直接加载
- **类型检查**：每个项目都有 `type-check` 脚本（`tsc --noEmit`），与转译解耦
- **无需安装即可类型检查**：每个项目的 `src/env.d.ts` 提供了 webpack / 各插件 / lodash / Node 内置（path、`__dirname`、`process`）的本地类型声明。因此即使不执行 `npm install`（无 node_modules），`npm run type-check` 也能零报错通过。安装依赖后该文件仍兼容（不会产生重复声明冲突）；若想使用第三方库的完整精确类型，可在安装依赖后删除 `src/env.d.ts`
- **HTML 入口**：统一使用 `html-webpack-plugin` 生成 `index.html`

## 各方法详解

### 01. thread-loader（多进程打包）

`thread-loader` 会把它后面的 loader 放到一个 worker 池中并行执行，利用多核 CPU 加快编译。

```ts
{
  test: /\.ts$/,
  use: [
    { loader: 'thread-loader', options: { workers: 2 } },
    { loader: 'ts-loader', options: { transpileOnly: true, happyPackMode: true } },
  ],
}
```

> 与 `ts-loader` 配合时需开启 `transpileOnly`（跳过类型检查）并设置 `happyPackMode: true`，类型检查交给 `tsc --noEmit` 单独执行。

- **构建**：`npm run build`
- **观察**：对比有无 thread-loader 时的构建耗时

### 02. image-webpack-loader（压缩图片）

在打包时对图片进行有损/无损压缩（mozjpeg / optipng / pngquant / gifsicle / svgo），自动减小图片体积。

```ts
{
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource',
  generator: { filename: 'images/[name].[contenthash:8].[ext]' },
  use: [
    {
      loader: 'image-webpack-loader',
      options: {
        mozjpeg: { quality: 70, progressive: true },
        optipng: { enabled: true, optimizationLevel: 7 },
        // ...
      },
    },
  ],
}
```

- **构建**：`npm run build`
- **观察**：对比 `src/assets` 原图与 `dist/images` 压缩后产物的大小

### 03. babel-loader 缓存

开启 `cacheDirectory` 后，babel-loader 把转译结果缓存到 `node_modules/.cache/babel-loader`，二次构建直接复用。

```ts
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: [['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions'] } }], '@babel/preset-typescript'],
  },
}
```

- **构建**：连续执行两次 `npm run build`
- **观察**：第二次构建明显变快（命中缓存）

### 04. DllPlugin（预打包第三方依赖）

分两步：
1. `webpack.dll.config.ts` 把不常变化的依赖（如 lodash）预打包成 `vendor.dll.js` + `manifest.json`
2. 主构建通过 `DllReferencePlugin` 引用清单，不再重复打包这些依赖

```ts
// 主配置
new DllReferencePlugin({
  manifest: path.resolve(__dirname, 'dll/vendor.manifest.json'),
  name: 'vendor_lib',
})
```

- **构建**：`npm run build`（脚本会先执行 `build:dll` 再执行主构建）
- **观察**：`dist/bundle.js` 中不包含 lodash，lodash 在 `vendor.dll.js` 中

### 05. terser-webpack-plugin（压缩 JS）

使用 terser 压缩混淆 JS，移除注释、缩短变量名、删除 `console` / `debugger`。

```ts
optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: 4,
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true, pure_funcs: ['console.log'] },
        format: { comments: false },
        mangle: { keep_classnames: true },
      },
      extractComments: false,
    }),
  ],
}
```

- **构建**：`npm run build`
- **观察**：`dist/bundle.js` 已被压缩，`console.log` 被移除

### 06. mini-css-extract-plugin（抽取并压缩 CSS）

把 CSS 从 JS 中抽取成独立 `.css` 文件，配合 `css-minimizer-webpack-plugin` 压缩。

```ts
plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
    chunkFilename: 'css/[name].[contenthash:8].chunk.css',
  }),
],
optimization: {
  minimizer: [new CssMinimizerPlugin()],
},
```

- **构建**：`npm run build`
- **观察**：`dist/css/` 下生成压缩后的 CSS 文件

### 07. compression-webpack-plugin（gzip 预压缩）

在产物基础上额外生成 `.gz` 文件，配合 Nginx `gzip_static` 直接返回预压缩文件。

```ts
new CompressionPlugin({
  filename: '[path][base].gz',
  algorithm: 'gzip',
  threshold: 10240, // 仅压缩大于 10KB 的资源
  minRatio: 0.8,
})
```

- **构建**：`npm run build`
- **观察**：`dist/` 下出现 `bundle.*.js.gz`，体积远小于原文件

### 08. splitChunks（提取公共模块）

自动识别公共模块并提取成单独 chunk：`vendors`（node_modules）与 `common`（被多个入口共享的本地模块）。

```ts
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendors: { test: /[\\/]node_modules[\\/]/, name: 'vendors', chunks: 'all', priority: 1 },
      default: { minChunks: 2, reuseExistingChunk: true, name: 'common' },
    },
  },
}
```

本 demo 提供两个入口 `pageA` / `pageB`，共享 lodash 与 `shared/format.ts`。

- **构建**：`npm run build`
- **观察**：`dist/` 下生成 `vendors.*.js`、`common.*.js` 与各页面 chunk，公共代码不重复

## 目录结构

```
007. 使用 Webpack 进行前端性能优化/
├── 01-thread-loader/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── index.ts
│       └── utils/{math,string}.ts
├── 02-image-webpack-loader/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── index.ts
│       ├── asset-modules.d.ts      # 图片模块类型声明
│       └── assets/{logo,banner}.svg
├── 03-babel-loader-cache/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── index.ts
│       └── utils/{debounce,throttle}.ts
├── 04-dll-plugin/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.dll.config.ts       # 预打包 dll
│   ├── webpack.config.ts           # 主构建引用 dll
│   ├── index.html
│   └── src/index.ts
├── 05-terser-webpack-plugin/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/index.ts
├── 06-mini-css-extract-plugin/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── index.ts
│       ├── css.d.ts                # CSS 模块类型声明
│       └── styles/{main,theme}.css
├── 07-compression-webpack-plugin/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/index.ts
└── 08-split-chunks/
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src/
        ├── pages/{pageA,pageB}.ts
        └── shared/format.ts
```

> 每个项目的 `src/` 下还包含 `env.d.ts`（本地类型声明，用于无 node_modules 时通过类型检查），上表为简洁起见省略。

## 启动方式

每个项目都是独立项目。**类型检查无需安装依赖**，构建/开发需要先安装依赖：

```bash
# 进入任一项目目录，例如
cd "007. 使用 Webpack 进行前端性能优化/01-thread-loader"

# 安装依赖（构建/开发需要；类型检查不需要）
npm install

# 生产构建（产物在 dist/）
npm run build

# 开发模式（本地预览）
npm run dev

# 仅做类型检查（无需安装依赖即可运行）
npm run type-check
```

> 04-dll-plugin 的 `build` 脚本会自动先执行 `build:dll` 再执行主构建，无需手动分步。

## 方法分类

| 类别     | 方法                                   | 说明                       |
| -------- | -------------------------------------- | -------------------------- |
| 构建提速 | thread-loader、babel-loader 缓存、DllPlugin | 减少重复编译工作量         |
| 产物瘦身 | terser-webpack-plugin、mini-css-extract-plugin、image-webpack-loader、compression-webpack-plugin | 减小产物 / 传输体积        |
| 缓存优化 | splitChunks                            | 公共模块独立打包，利于长缓存 |
