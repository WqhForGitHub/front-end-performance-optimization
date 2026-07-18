# 解决 Vue 打包时 vendor 文件过大的问题

本目录通过 **Vue3 + TS + Vite** 与 **Vue2 + Vite(模拟 vue-cli 体验)** 两个独立项目，演示 Vue 打包时 vendor 文件过大问题的解决方案。

## 问题分析

vendor 文件过大的常见原因：
1. **所有第三方库打包到同一个 vendor.js**
2. **未使用 externals 把大库走 CDN**
3. **未启用代码分割（Code Splitting）**
4. **未开启 Gzip/Brotli 压缩**
5. **未使用 Tree Shaking 按需引入**
6. **全量引入第三方 UI 库**（如 Element 全量引入）

## 优化方案

### 1. manualChunks 分包

把 Vue、Router、Pinia 等核心库单独分包，把第三方库按组分包：

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vue: ['vue'],
        router: ['vue-router'],
        ui: ['element-plus'],
      },
    },
  },
}
```

### 2. externals + CDN

把 Vue、Lodash 等大库走 CDN，不打包进 bundle：

```ts
// vite.config.ts
build: {
  rollupOptions: {
    external: ['vue'],
  },
}

// index.html
<script src="https://unpkg.com/vue@3.4.0/dist/vue.runtime.global.prod.js"></script>
```

### 3. 异步组件懒加载

非首屏组件通过 `import()` 异步加载，独立成 chunk：

```ts
const LazyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))
```

### 4. Gzip/Brotli 压缩

服务器开启 Gzip/Brotli，传输体积减小 60%-80%：

```ts
import viteCompression from 'vite-plugin-compression'

plugins: [
  viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
  viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
]
```

### 5. Tree Shaking

使用 ESM 按需引入，未使用代码被移除：

```ts
// ❌ 全量引入
import _ from 'lodash'

// ✅ 按需引入
import { debounce } from 'lodash-es'
```

### 6. 按需引入第三方 UI 库

```ts
// ❌ 全量引入
import { Button, Select, Table } from 'element-plus'
import 'element-plus/dist/index.css'

// ✅ 按需引入
import { ElButton } from 'element-plus'
import 'element-plus/es/components/button/style/css'
```

## 子项目一览

| 子项目         | 端口 | 技术栈                 | 说明                                              |
| -------------- | ---- | ---------------------- | ------------------------------------------------- |
| `01-vue3-vite` | 5308 | Vue3 + TS + Vite       | 演示 Vue3 vendor 优化（分包+压缩+异步组件）       |
| `02-vue2-cli`  | 5309 | Vue2 + Vite(vue2 插件) | 演示 Vue2 vendor 优化（分包+压缩+异步组件）       |

## 快速开始

```bash
cd "demo/039. 解决 Vue 打包时 vendor 文件过大的问题/01-vue3-vite"

# 安装依赖
npm install

# 生产构建（观察分包效果）
npm run build

# 查看产物
ls dist/assets
```

---

## 一、Vue3 项目（`01-vue3-vite`）

### 关键配置

```ts
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: { vue: ['vue'] },
      },
    },
  },
})
```

### 演示内容

- 6 张优化方案卡片（含前后体积对比）
- 异步组件懒加载演示：点击按钮懒加载图表组件
- 图表组件独立成 chunk，不进入主 bundle

---

## 二、Vue2 项目（`02-vue2-cli`）

### 关键配置

```js
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    createVuePlugin(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: { vue: ['vue'] },
      },
    },
  },
})
```

---

## 优化效果对比

| 优化手段                | 前          | 后          | 减幅     |
| ----------------------- | ----------- | ----------- | -------- |
| manualChunks 分包       | vendor 800KB| vendor 200KB + vue 60KB | 75%   |
| externals + CDN         | bundle 1.2MB| bundle 400KB| 67%      |
| 异步组件懒加载          | app 600KB   | app 200KB + chart 400KB | 67% (首屏) |
| Gzip 压缩               | 传输 800KB  | 传输 200KB  | 75%      |
| Brotli 压缩             | 传输 800KB  | 传输 160KB  | 80%      |
| Tree Shaking (lodash)   | 70KB        | 4KB         | 94%      |
| Element Plus 按需引入   | 1MB         | 50KB        | 95%      |

## 目录结构

```
039. 解决 Vue 打包时 vendor 文件过大的问题/
├── README.md
├── 01-vue3-vite/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           └── HeavyChart.vue
└── 02-vue2-cli/
    ├── package.json
    ├── jsconfig.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        └── App.vue
```

## 技术栈

- Vue 3.4+ / Vue 2.7+
- TypeScript 5.5+（Vue3 项目）
- Vite 5.3+ / Vite 4.5+ (Vue2)
- vite-plugin-compression（Gzip/Brotli 压缩）
