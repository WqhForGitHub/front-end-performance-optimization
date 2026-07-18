# CSS 优化和提高性能的方法

本目录演示前端工程中三种常见的 CSS 性能优化方案，每个子项目独立可运行。

## 子项目

| #   | 目录                       | 端口 | 主题                                                                       |
| --- | -------------------------- | ---- | -------------------------------------------------------------------------- |
| 01  | `01-critical-css`          | 5267 | Critical CSS 提取与内联（消除渲染阻塞，加速 FCP）                          |
| 02  | `02-css-modules`           | 5268 | CSS Modules 与样式作用域（局部作用域、命名 hash 化、避免冲突）             |
| 03  | `03-will-change-transform` | 5269 | GPU 加速：will-change / transform / opacity（替代 left/top，仅合成层动画） |

## 运行方式

每个子项目都是独立的 Vite + React + TypeScript 工程，进入对应目录安装依赖后即可启动：

```bash
# 进入某个子项目
cd "demo/031. CSS 优化和提高性能的方法/01-critical-css"

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 生产构建
npm run build
```

## 技术栈

- **构建工具**：Vite 5
- **语言**：TypeScript 5
- **UI 框架**：React 18
- **类型声明**：自定义 `src/env.d.ts`（不依赖 `@types/react` 的全局类型，避免污染）

## 各方案要点

### 01 · Critical CSS 关键 CSS 提取与内联

- **问题**：外部 CSS 通过 `<link rel="stylesheet">` 引入时，浏览器必须等 CSS 下载解析完才能渲染首屏，导致白屏时间延长。
- **方案**：把首屏（above-the-fold）所需的最小 CSS 集合直接内联到 `<head>` 的 `<style>` 标签中；非关键 CSS 通过 `rel="preload" + onload` 异步加载，不阻塞渲染。
- **效果**：FCP（First Contentful Paint）可显著提前，特别是网络较慢或 CSS 体积较大时。
- **工具**：`critical`、`penthouse` 自动提取；Vite 用 `vite-plugin-critical`，Webpack 用 `critters`。
- **注意**：内联 CSS 不会被浏览器缓存，HTML 体积会增大，适合首屏固定、CSS 较大的场景。

### 02 · CSS Modules 与样式作用域

- **问题**：全局 CSS 命名容易冲突，第三方样式相互覆盖，维护成本高。
- **方案**：使用 `*.module.css` 文件，构建工具自动将类名转换为唯一 hash（如 `.card` -> `_card_1a2b3_15`），实现局部作用域。
- **优势**：
  - 杜绝命名冲突，无需 BEM 等命名约定。
  - 显式 `import` 引用，零隐式依赖，便于 Tree-shaking。
  - 支持 `composes` 组合样式、`:global(.x)` 选择性引入全局样式。
- **集成**：Vite 原生支持，零配置；TypeScript 在 `env.d.ts` 声明 `*.module.css` 模块即可获得类型提示。

### 03 · GPU 加速：will-change / transform / opacity

- **问题**：动画使用 `left / top / width / height` 等属性会触发**重排 + 重绘**，主线程负担大，多元素并发时容易掉帧。
- **方案**：改用 `transform` 和 `opacity` 做动画，这两个属性只触发**合成（Composite）**阶段，由 GPU 直接处理，主线程无压力。
- **will-change**：提前告知浏览器哪个属性将变化，浏览器预创建独立合成层（layer）并上传 GPU。但不要长期开启，会持续占用内存。
- **效果**：即使 100+ 元素并发动画，transform 模式仍能保持 60 FPS，而 left/top 模式在 30-40 元素时就开始掉帧。
- **调试**：Chrome DevTools 的 **Layers** 面板查看合成层，**Performance** 面板分析掉帧原因。

## 目录结构

```
031. CSS 优化和提高性能的方法/
├── README.md                       <- 本文件
├── 01-critical-css/                <- 端口 5267
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       └── App.tsx
├── 02-css-modules/                 <- 端口 5268
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── App.module.css          <- CSS Modules 文件
│       └── global.css              <- 全局 CSS（用于对比）
└── 03-will-change-transform/       <- 端口 5269
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        └── App.tsx
```

## 其他常见 CSS 优化方法（补充参考）

除上述三个演示外，CSS 性能优化还包括：

- **减少选择器复杂度**：避免过深的嵌套选择器，优先使用类选择器。
- **避免强制同步布局**：JS 中读写 `offsetWidth` 等属性会触发强制重排。
- **使用 `contain` 属性**：隔离子树的渲染、布局、绘制，限制重排范围。
- **`content-visibility: auto`**：让浏览器跳过屏幕外内容的渲染。
- **CSS 代码分割**：路由级别按需加载 CSS，减小初始包体积。
- **压缩与去除无用 CSS**：PurgeCSS、cssnano 等工具移除未使用的规则。
- **使用 `font-display: swap`**：避免自定义字体加载阻塞文本渲染。
- **避免 `@import`**：CSS 中的 `@import` 会串行加载，改用 `<link>` 并行加载或构建时合并。

## 相关资源

- [web.dev - Critical CSS](https://web.dev/articles/extract-critical-css)
- [CSS Modules 官方文档](https://github.com/css-modules/css-modules)
- [MDN - will-change](https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change)
- [Chrome DevTools - Layers 面板](https://developer.chrome.com/docs/devtools/layers/)
