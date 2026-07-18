# 减小生成的 JavaScript 文件大小

本项目通过 **React + Webpack** 演示如何减小 Webpack 打包生成的 JavaScript 文件大小。

## 核心优化手段

### 1. Tree Shaking（摇树优化）

- 使用 ESM 按需导入，未使用代码被移除
- `package.json` 中 `"sideEffects": false`：标记模块无副作用
- `@babel/preset-env` 设置 `modules: false`：保留 ESM 让 Webpack 做 Tree Shaking

```ts
// ❌ 全量导入
import _ from 'lodash'

// ✅ 按需导入
import { debounce } from 'lodash-es'
```

### 2. TerserPlugin 压缩

- 压缩、混淆、移除注释
- `drop_console: true`：移除 console
- `mangle: true`：变量名混淆

```ts
new TerserPlugin({
  parallel: true,
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info'],
    },
    format: { comments: false },
    mangle: { safari10: true },
  },
})
```

### 3. externals + CDN

把 React、ReactDOM 等大库走 CDN，不打包进 bundle：

```ts
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
}
```

### 4. Gzip/Brotli 压缩

服务器开启 Gzip/Brotli，传输体积减小 60%-80%：

```ts
new CompressionPlugin({ algorithm: 'gzip', threshold: 10240 })
new CompressionPlugin({ algorithm: 'brotliCompress', threshold: 10240 })
```

### 5. splitChunks 分包

把第三方库单独分包，利用浏览器缓存：

```ts
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
    },
  },
}
```

### 6. 动态导入（Dynamic Import）

按需加载路由/组件，独立成 chunk：

```tsx
const LazyPage = lazy(() => import('./Page'))
```

### 7. production 模式

- 自动开启 Tree Shaking
- 自动开启代码压缩
- 自动移除未使用代码

## 快速开始

```bash
cd "demo/041. 减小生成的 JavaScript 文件大小"

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建（观察产物体积）
npm run build

# 类型检查
npm run type-check
```

## 演示内容

- 8 张优化方案卡片（含前后体积对比）
- 交互演示：
  - `useMemo` 缓存计算结果
  - `useCallback` + 自定义 `debounce` 演示按需导入
  - 计数器交互验证功能正常
- 生产构建时：
  - React/ReactDOM 走 CDN
  - TerserPlugin 移除 console
  - Gzip + Brotli 压缩
  - splitChunks 分包

## 优化效果对比

| 优化手段                 | 前            | 后            | 减幅     |
| ------------------------ | ------------- | ------------- | -------- |
| Tree Shaking (lodash)    | 70KB          | 4KB           | 94%      |
| TerserPlugin 压缩        | 800KB         | 280KB         | 65%      |
| externals + CDN          | 1.2MB         | 400KB         | 67%      |
| Gzip 压缩                | 传输 800KB    | 传输 200KB    | 75%      |
| Brotli 压缩              | 传输 800KB    | 传输 160KB    | 80%      |
| splitChunks 分包         | app 1MB       | app 200KB + vendor 800KB | 80% (首屏) |
| dynamic import           | app 1MB       | app 200KB + page 800KB | 80% (首屏) |
| sideEffects: false       | 保留全部导出  | 只保留用到的  | 视情况   |

## 完整优化清单

### 构建配置

| 配置                              | 作用                            |
| --------------------------------- | ------------------------------- |
| `mode: 'production'`              | 启用所有内置优化                |
| `optimization.minimize: true`     | 启用压缩                        |
| `TerserPlugin parallel: true`     | 多进程压缩                      |
| `splitChunks.chunks: 'all'`       | 分包                            |
| `externals`                       | 大库走 CDN                      |
| `sideEffects: false`              | Tree Shaking                    |
| `@babel/preset-env modules: false`| 保留 ESM                        |

### 代码层面

| 手段                  | 作用                              |
| --------------------- | --------------------------------- |
| ESM 按需导入          | 只打包用到的代码                  |
| 动态导入              | 按需加载                          |
| 避免引入大库全量      | 用 `lodash-es` 替代 `lodash`      |
| Polyfill 按需         | `@babel/preset-env useBuiltIns: 'usage'` |

### 服务器配置

| 手段             | 作用                              |
| ---------------- | --------------------------------- |
| Gzip 压缩        | 传输体积 -75%                     |
| Brotli 压缩      | 传输体积 -80%                     |
| HTTP/2           | 多路复用                          |
| 强缓存           | 重复访问不请求                    |

## 目录结构

```
041. 减小生成的 JavaScript 文件大小/
├── README.md
├── package.json
├── tsconfig.json
├── webpack.config.ts
├── index.html
└── src/
    ├── env.d.ts
    ├── index.tsx
    └── App.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Webpack 5.93+
- Babel 7.24+（@babel/preset-env, @babel/preset-react, @babel/preset-typescript）
- terser-webpack-plugin
- compression-webpack-plugin
- mini-css-extract-plugin
