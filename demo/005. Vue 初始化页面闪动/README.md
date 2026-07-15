# 如何解决 Vue 初始化页面闪动的问题

## 问题现象

在 Vue 应用中，HTML 模板使用 `{{ }}` 插值语法。在 Vue 实例挂载之前，浏览器会将 `{{ }}` 原样显示为文本内容，用户会短暂看到：

```
{{ user.name }}
{{ product.price }}
```

这种"闪动"（FOUC - Flash of Unstyled Content）在以下场景尤其明显：

- 大型 SPA 应用，JS bundle 较大，Vue 挂载延迟
- 弱网环境，脚本下载慢
- 服务端渲染（SSR）水合（hydration）前

## 三种解决方案

### 方法一：v-cloak 指令

**原理**：利用 CSS 隐藏未编译的元素，Vue 挂载后自动移除 `v-cloak` 属性。

```html
<!-- CSS（必须在 Vue 加载前生效） -->
<style>
  [v-cloak] {
    display: none !important;
  }
</style>

<!-- HTML -->
<div id="app" v-cloak>{{ user.name }}</div>
```

**流程**：

1. 页面加载时，`#app` 带有 `v-cloak` 属性 -> CSS `display: none` 隐藏
2. Vue 挂载 -> 自动移除 `v-cloak` 属性 -> 元素显示
3. 用户看不到 `{{ }}` 闪动

**优点**：实现极简，一行 CSS + 一个指令
**缺点**：挂载前页面完全空白，无任何占位内容

### 方法二：v-text 指令

**原理**：用 `v-text` 替代 `{{ }}` 插值，挂载前元素为空。

```html
<!-- 用 v-text 替代 {{ }} -->
<span v-text="user.name"></span>
<!-- 替代： <span>{{ user.name }}</span> -->
```

**流程**：

1. 页面加载时，`v-text="user.name"` 是一个普通属性，不渲染任何内容
2. Vue 挂载 -> 将变量值设置为元素的 `textContent`
3. 挂载前元素为空白，不会闪动 `{{ }}`

**优点**：简单直接，不需要额外 CSS
**缺点**：挂载前元素为空白；不适合包含 HTML 结构的复杂内容

### 方法三：骨架屏（推荐）

**原理**：在 `index.html` 的 `#app` 内预先放入骨架屏 HTML，Vue 挂载后自动替换。

```html
<div id="app">
  <!-- 骨架屏占位内容 -->
  <div class="skeleton-card">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  </div>
</div>
```

```css
.skeleton-line {
  height: 14px;
  background: #f0f0f0;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background: #f0f0f0;
  }
  50% {
    background: #e0e0e0;
  }
  100% {
    background: #f0f0f0;
  }
}
```

**流程**：

1. 页面加载时，`#app` 显示骨架屏（灰色占位块 + shimmer 动画）
2. Vue 挂载 -> 替换 `#app` 内容为真实组件
3. 用户看到的是"骨架 -> 真实内容"的平滑过渡

**优点**：用户体验最佳，有视觉占位，不会白屏
**缺点**：需要额外编写骨架屏 HTML/CSS，维护成本稍高

## 方案对比

| 方案    | 挂载前显示     | 实现复杂度 | 用户体验 | 适用场景             |
| ------- | -------------- | ---------- | -------- | -------------------- |
| v-cloak | 空白（隐藏）   | 低         | 一般     | 简单页面，快速挂载   |
| v-text  | 空白（空元素） | 低         | 一般     | 纯文本内容           |
| 骨架屏  | 灰色占位骨架   | 中         | **最佳** | 大型 SPA，慢加载场景 |

## 目录结构

```
005. Vue 初始化页面闪动/
├── v-cloak/                    # 方法一: v-cloak 指令 (端口 5210)
│   ├── index.html              # 包含 [v-cloak]{display:none} CSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts             # 延迟 2s 挂载模拟慢加载
│       ├── env.d.ts
│       └── App.vue             # 使用 {{ }} 插值 + v-cloak
├── v-text/                     # 方法二: v-text 指令 (端口 5211)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts             # 延迟 2s 挂载模拟慢加载
│       ├── env.d.ts
│       └── App.vue             # 使用 v-text 替代 {{ }}
└── skeleton/                   # 方法三: 骨架屏 (端口 5212)
    ├── index.html              # 包含骨架屏 HTML + shimmer 动画
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.ts             # 延迟 2s 挂载模拟慢加载
        ├── env.d.ts
        └── App.vue             # 真实内容（替换骨架屏）
```

## 启动方式

```bash
# 方法一: v-cloak
cd "005. Vue 初始化页面闪动/v-cloak" && npm run dev

# 方法二: v-text
cd "005. Vue 初始化页面闪动/v-text" && npm run dev

# 方法三: 骨架屏
cd "005. Vue 初始化页面闪动/skeleton" && npm run dev
```

每个项目都故意延迟 2 秒挂载 Vue，模拟大型 SPA 的慢加载场景。打开页面后：

- **v-cloak**：前 2 秒页面空白（元素被隐藏），2 秒后突然显示完整内容
- **v-text**：前 2 秒元素为空（无文字），2 秒后文字出现
- **骨架屏**：前 2 秒显示灰色骨架占位 + shimmer 动画，2 秒后平滑过渡为真实内容

建议依次体验三个项目，直观对比不同方案的用户体验差异。
