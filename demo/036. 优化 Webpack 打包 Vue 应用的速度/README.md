# 优化 Webpack 打包 Vue 应用的速度

本目录通过 **Vue2 + Webpack** 与 **Vue3 + TS + Webpack** 两个独立项目，演示如何优化 Webpack 打包 Vue 应用的速度。

## 核心优化手段

### 1. 多进程/多线程处理

- **thread-loader**：把后续 loader 放到 worker 池中并行执行
- **TerserPlugin parallel**：多进程压缩 JS

### 2. 缓存

- **cache-loader**：缓存 loader 处理结果，二次构建加速 50%-90%
- **babel-loader cacheDirectory**：Babel 缓存编译结果
- **webpack5 cache**：`cache: { type: 'filesystem' }` 持久化缓存

### 3. 跳过类型检查

- Vue3 项目使用 `@babel/preset-typescript` 而非 `ts-loader`，Babel 转 TS 不做类型检查
- 类型检查通过 `tsc --noEmit` 单独执行（CI 阶段）

### 4. externals + CDN

- 把 Vue 等大库走 CDN，不打包进 bundle
- 减小 bundle 体积与构建耗时

### 5. 路径解析优化

- `resolve.alias`：缩短路径解析时间
- `resolve.extensions`：合理设置扩展名顺序，减少尝试次数

### 6. 代码分割

- `splitChunks`：合理分包，避免重复打包

## 子项目一览

| 子项目               | 端口 | 技术栈                 | 说明                                              |
| -------------------- | ---- | ---------------------- | ------------------------------------------------- |
| `01-vue2-webpack`    | 5303 | Vue2 + Webpack5        | 演示 Vue2 应用的 Webpack 打包速度优化             |
| `02-vue3-ts-webpack` | 5304 | Vue3 + TS + Webpack5   | 演示 Vue3 + TS 应用的 Webpack 打包速度优化        |

## 快速开始

```bash
# 进入任一子项目
cd "demo/036. 优化 Webpack 打包 Vue 应用的速度/01-vue2-webpack"

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产打包（观察构建时间）
npm run build
```

---

## 一、Vue2 + Webpack（`01-vue2-webpack`）

### 关键配置

```js
// 1. thread-loader + babel-loader 多进程转译
{
  test: /\.js$/,
  use: [
    'cache-loader',
    { loader: 'thread-loader', options: { workers: 2 } },
    { loader: 'babel-loader', options: { cacheDirectory: true } },
  ]
}

// 2. externals：Vue 走 CDN
externals: { vue: 'Vue' }

// 3. TerserPlugin 多进程压缩
new TerserPlugin({ parallel: true })
```

### 演示内容

- 6 张优化卡片展示各项优化手段
- 计数器交互验证功能正常
- 生产构建时 Vue 走 CDN，不打包进 bundle

---

## 二、Vue3 + TS + Webpack（`02-vue3-ts-webpack`）

### 关键配置

```ts
// 1. 使用 @babel/preset-typescript 替代 ts-loader，跳过类型检查
{
  test: /\.ts$/,
  use: [
    'cache-loader',
    { loader: 'thread-loader', options: { workers: 2 } },
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: [
          ['@babel/preset-env', { targets: { browsers: ['> 1%'] } }],
          ['@babel/preset-typescript', { allExtensions: true }]
        ],
      },
    },
  ]
}

// 2. externals + CDN
externals: { vue: 'Vue' }
```

### 演示内容

- 6 张优化卡片展示各项优化手段
- Vue3 Composition API + TypeScript
- 计数器交互验证功能正常
- 类型检查通过 `npm run type-check` 单独执行

---

## 性能对比参考

| 优化项                  | 首次构建 | 二次构建 | 备注                          |
| ----------------------- | -------- | -------- | ----------------------------- |
| 无优化                  | 100%     | 100%     | baseline                      |
| + thread-loader         | -30%     | -30%     | 多进程并行                    |
| + cache-loader          | -5%      | -70%     | 二次构建大幅加速              |
| + babel cacheDirectory  | -5%      | -20%     | Babel 缓存                    |
| + externals CDN         | -15%     | -15%     | 不打包 Vue                    |
| + TerserPlugin parallel | -10%     | -10%     | 多进程压缩                    |
| 全部启用                | -50%     | -85%     | 综合优化效果                  |

> 注：数据为参考值，实际效果取决于项目规模与硬件。

## 目录结构

```
036. 优化 Webpack 打包 Vue 应用的速度/
├── README.md
├── 01-vue2-webpack/
│   ├── package.json
│   ├── webpack.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       └── App.vue
└── 02-vue3-ts-webpack/
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.ts
        └── App.vue
```

## 技术栈

- Vue 2.7+ / Vue 3.4+
- Webpack 5.93+
- TypeScript 5.5+（vue3 项目）
- Babel 7.24+
- thread-loader / cache-loader / terser-webpack-plugin
