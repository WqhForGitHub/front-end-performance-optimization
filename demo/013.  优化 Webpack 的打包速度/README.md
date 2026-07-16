# 优化 Webpack 的打包速度

本示例集合演示在使用 Webpack 5 + TypeScript 的工程中，如何从多个维度优化**构建（打包）速度**。
构建速度直接影响开发体验（HMR、冷启动）与 CI/CD 流水线耗时，是前端工程化的重要课题。

每个子目录是一个独立的最小可运行示例，聚焦一种优化手段，配置文件中均带有详细中文注释。

---

## 方法总览

| 序号 | 目录 | 优化点 | 作用 |
| :--: | :--- | :--- | :--- |
| 01 | `01-persistent-cache` | 持久化缓存（filesystem cache） | 二次构建直接复用上次的模块解析与转译结果，提速 50%~90% |
| 02 | `02-thread-loader` | 多进程并行打包（thread-loader） | 把 ts-loader 放到 worker 池并行执行，充分利用多核 CPU |
| 03 | `03-dll-plugin` | DLL 预编译（DllPlugin / DllReferencePlugin） | 第三方库提前单独打包，主构建跳过其解析与转译 |
| 04 | `04-loader-cache` | loader 缓存与排除优化 | transpileOnly、文件缓存、exclude node_modules，减少 loader 重复工作 |
| 05 | `05-resolve-optimization` | resolve 解析优化 | alias 缩短路径、精简 extensions、限定 modules，减少磁盘 IO |
| 06 | `06-babel-cache` | babel-loader 缓存 | 用 babel-loader + cacheDirectory 替代 ts-loader，转译与类型检查解耦 |

---

## 通用约定

为保证「不安装依赖也能通过类型检查」，所有子工程遵循以下约定：

1. **本地类型声明 `src/env.d.ts`**：每个子工程都内置一份完整的 fallback 类型声明，
   覆盖 `path`、`webpack`、`html-webpack-plugin`、`lodash`、`thread-loader`、`babel-loader`
   等模块。这样在**没有 `node_modules`** 的情况下，执行 `tsc --noEmit` 也能通过类型检查。
2. **统一的 `tsconfig.json`**：`target: ES2020`、`moduleResolution: bundler`、
   `types: []`（不自动引入 @types 包），并配置 `ts-node` 以便直接用 TS 编写 webpack 配置。
3. **`package.json` 不含 `type` 字段**，保持 CommonJS 默认行为，便于 ts-node 加载 webpack 配置。
4. **脚本统一**：
   - `npm run build`：生产构建
   - `npm run dev`：启动开发服务器
   - `npm run type-check`：仅类型检查（`tsc --noEmit`）
5. 所有 `webpack.config.ts` 使用 `import type { Configuration } from 'webpack'` 与默认导出。

---

## 各方法详解

### 01. 持久化缓存（Persistent Cache）

Webpack 5 内置文件系统级别的持久化缓存。首次构建把中间产物落盘，
二次构建直接读取缓存，跳过重复的解析与转译。

```ts
// webpack.config.ts
cache: {
  type: 'filesystem',
  // 配置文件一旦变化，缓存自动失效
  buildDependencies: {
    config: [__filename]
  }
}
```

验证：连续执行两次 `npm run build`，第二次耗时显著下降。
缓存目录默认位于 `node_modules/.cache/webpack`。

---

### 02. 多进程并行打包（thread-loader）

`thread-loader` 启动 worker 池，把后续 loader（ts-loader）放到子进程中并行执行。
配合 ts-loader 的 `happyPackMode: true` 才能正常工作。

```ts
module: {
  rules: [
    {
      test: /\.ts$/,
      use: [
        {
          loader: 'thread-loader',
          options: { workers: 2 }
        },
        {
          loader: 'ts-loader',
          options: { happyPackMode: true, transpileOnly: true }
        }
      ],
      exclude: /node_modules/
    }
  ]
}
```

适用场景：中大型项目，TypeScript 文件较多。文件较少时进程通信开销可能抵消收益。

---

### 03. DLL 预编译（DllPlugin / DllReferencePlugin）

把不常变化的第三方库（如 lodash）单独预编译为 `vendor.dll.js`，并生成 `manifest.json`。
主构建通过 `DllReferencePlugin` 引用清单，跳过对 lodash 的重新打包。

```ts
// webpack.dll.config.ts —— 预编译
entry: { vendor: ['lodash'] },
output: { filename: '[name].dll.js', library: '[name]_library' },
plugins: [
  new DllPlugin({
    name: '[name]_library',
    path: path.resolve(__dirname, 'dist', '[name]-manifest.json')
  })
]
```

```ts
// webpack.config.ts —— 主构建引用
plugins: [
  new DllReferencePlugin({
    manifest: path.resolve(__dirname, 'dist', 'vendor-manifest.json'),
    context: __dirname
  })
]
```

执行顺序：先 `npm run build:dll`，再 `npm run build`（package.json 中 `build` 已串联两步）。
运行时需在 HTML 中先引入 `vendor.dll.js`。

> 说明：Webpack 5 的持久化缓存已能在多数场景替代 DLL，DLL 更多用于需要极致控制第三方依赖的场景。

---

### 04. loader 缓存优化

从 loader 层面减少重复工作：

- `transpileOnly: true`：跳过类型检查，只做转译。
- `experimentalFileCaching: true`：开启实验性文件缓存。
- `onlyCompileBundledFiles: true`：只编译被引用的文件。
- `exclude: /node_modules/`：第三方依赖已是编译产物，必须排除。

```ts
{
  test: /\.ts$/,
  use: {
    loader: 'ts-loader',
    options: {
      transpileOnly: true,
      experimentalFileCaching: true,
      onlyCompileBundledFiles: true
    }
  },
  exclude: /node_modules/
}
```

配合顶层 `cache: { type: 'filesystem' }` 效果最佳。

---

### 05. resolve 解析优化

Webpack 解析每个 import 都会进行磁盘查找，是隐藏的耗时大头。三个优化点：

```ts
resolve: {
  // 1. 别名：把深层路径映射为短路径
  alias: {
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@src': path.resolve(__dirname, 'src')
  },
  // 2. 精简后缀列表：只保留实际用到的
  extensions: ['.ts', '.js'],
  // 3. 限定模块查找目录：避免向上逐级遍历 node_modules
  modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  mainFiles: ['index']
}
```

后缀每多一个，每个无后缀的 import 都会多一次文件存在性判断；extensions 越短越好。

---

### 06. babel-loader 缓存

用 `babel-loader` + `@babel/preset-typescript` 替代 ts-loader，并开启 `cacheDirectory`。
类型检查交给独立的 `tsc --noEmit`，实现转译与检查解耦。

```ts
{
  test: /\.ts$/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,        // 缓存到 node_modules/.cache/babel-loader
      cacheCompression: false,     // 不压缩缓存，读取更快
      presets: [
        ['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions'] } }],
        '@babel/preset-typescript'
      ]
    }
  },
  exclude: /node_modules/
}
```

对比 ts-loader：babel-loader 不做类型检查，单文件转译更快；缓存机制独立于 Webpack 5 的 cache。

---

## 目录结构

```
013.  优化 Webpack 的打包速度
├── README.md
├── 01-persistent-cache
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── index.ts
│       └── utils
│           ├── data.ts
│           └── format.ts
├── 02-thread-loader
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── index.ts
│       └── utils
│           ├── math.ts
│           └── string.ts
├── 03-dll-plugin
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── webpack.dll.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       └── index.ts
├── 04-loader-cache
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── index.ts
│       └── utils
│           └── processor.ts
├── 05-resolve-optimization
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src
│       ├── env.d.ts
│       ├── index.ts
│       └── utils
│           ├── helper.ts
│           └── constants.ts
└── 06-babel-cache
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src
        ├── env.d.ts
        ├── index.ts
        └── utils
            └── validator.ts
```

---

## 启动方式

进入任意子目录后：

```bash
# 1. 安装依赖（首次）
npm install

# 2. 类型检查（无需依赖也可通过，得益于 src/env.d.ts）
npm run type-check

# 3. 生产构建
npm run build

# 4. 开发模式（启动 dev server）
npm run dev
```

> 对于 `03-dll-plugin`，`npm run build` 会先执行 DLL 预编译再执行主构建；
> 也可单独执行 `npm run build:dll` 仅生成 DLL 产物。

### 不安装依赖进行类型检查

由于每个子工程都内置了 `src/env.d.ts` 本地类型声明，
即使没有 `node_modules`，只要有 TypeScript 编译器即可通过检查：

```bash
# 在子目录下（需全局或父级有 typescript）
npx tsc --noEmit
```

---

## 方法分类

| 分类 | 方法 | 适用阶段 | 收益特点 |
| :--- | :--- | :--- | :--- |
| 缓存复用 | 01 持久化缓存、04 loader 缓存、06 babel-loader 缓存 | 二次及以后构建 | 命中缓存即跳过重复计算，提速最明显 |
| 并行化 | 02 thread-loader | 单次构建 | 利用多核 CPU，文件越多收益越大 |
| 预编译 | 03 DLL 预编译 | 单次构建 | 把稳定第三方依赖移出主构建流程 |
| 解析优化 | 05 resolve 优化 | 单次构建 | 减少磁盘 IO 与路径尝试次数 |

> 实践建议：优先开启 **01 持久化缓存**（收益最高、成本最低）；项目变大后叠加
> **02 thread-loader** 与 **05 resolve 优化**；对第三方依赖有极致控制需求时再考虑
> **03 DLL**；若团队偏好 Babel 工具链，可用 **06 babel-loader** 替代 ts-loader。
