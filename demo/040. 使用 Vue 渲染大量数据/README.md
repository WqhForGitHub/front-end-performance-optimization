# 使用 Vue 渲染大量数据

本目录通过 **Vue3 + TS + Vite** 与 **Vue2 + Vite(模拟 vue-cli 体验)** 两个独立项目，演示 Vue 渲染大量数据时的优化方案。

## 核心问题

Vue 渲染大量数据时的性能瓶颈：
1. **一次性渲染全部 DOM**：10k+ 数据导致首屏卡顿数秒
2. **DOM 节点过多**：浏览器渲染、内存占用过高
3. **响应式开销**：每个对象的属性都被代理，万级数据产生大量 reactive 包装
4. **频繁重排重绘**：列表更新时浏览器需要重新计算布局

## 优化方案

### 1. 朴素渲染（Naive）- 反例

直接 `v-for` 渲染全部数据，DOM 节点数 = 数据量：
- 1000 条：可接受
- 10000 条：卡顿明显
- 100000 条：浏览器卡死

### 2. 虚拟滚动（Virtual Scroll）- 推荐

只渲染可视区域 + 上下缓冲区，DOM 节点数固定为 ~30 个：

```ts
const ITEM_HEIGHT = 40
const VIEWPORT_HEIGHT = 500
const BUFFER = 5

const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER)
  const end = Math.min(
    allData.value.length,
    start + Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + BUFFER * 2,
  )
  return allData.value.slice(start, end).map((item, i) => ({
    ...item,
    _top: (start + i) * ITEM_HEIGHT,
  }))
})
```

### 3. 分页加载（Pagination）- 备选

每次只渲染一页数据，按需翻页：
- 适合用户场景不需要看到全部数据的列表
- 实现简单，兼容性好

### 4. 其他优化手段

- **`shallowRef` / `shallowReactive`**：大数据不深层响应式
- **`markRaw`**：跳过响应式包装
- **`Object.freeze`**：Vue2 中跳过响应式
- **`requestAnimationFrame`**：节流滚动事件
- **`v-memo`**（Vue3）：缓存列表项，依赖未变跳过渲染
- **`key` 优化**：使用稳定唯一的 key

## 子项目一览

| 子项目         | 端口 | 技术栈                 | 说明                                              |
| -------------- | ---- | ---------------------- | ------------------------------------------------- |
| `01-vue3-vite` | 5310 | Vue3 + TS + Vite       | 三种方案独立组件 + 数据量切换 + 渲染耗时监控      |
| `02-vue2-cli`  | 5311 | Vue2 + Vite(vue2 插件) | 三种方案集成在 App + 数据量切换 + 渲染耗时监控    |

## 快速开始

```bash
cd "demo/040. 使用 Vue 渲染大量数据/01-vue3-vite"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 一、Vue3 项目（`01-vue3-vite`）

### 演示内容

- 3 个独立组件对比：
  - `NaiveList.vue`：朴素渲染（限制 5000 条避免卡顿）
  - `VirtualList.vue`：虚拟滚动（10w 条流畅）
  - `PaginatedList.vue`：分页加载（每页 50 条）
- 数据量切换：1k / 10k / 100k
- 实时显示渲染耗时、DOM 节点数
- `requestAnimationFrame` 节流滚动事件

### 关键代码

```ts
// 虚拟滚动核心
const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER)
  const end = Math.min(allData.value.length, start + visibleCount + BUFFER * 2)
  return allData.value.slice(start, end)
})

// rAF 节流
function handleScroll(e: Event) {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    scrollTop.value = (e.target as HTMLElement).scrollTop
  })
}
```

---

## 二、Vue2 项目（`02-vue2-cli`）

### 演示内容

- 三种方案集成在 App.vue 中
- Vue2 options API 实现
- 数据量切换 + 模式切换
- 虚拟滚动使用 `position: absolute` + `top` 定位

### 关键代码

```js
computed: {
  visibleItems() {
    var start = Math.max(0, Math.floor(this.scrollTop / this.ITEM_HEIGHT) - this.BUFFER)
    var end = Math.min(this.virtualData.length, start + visibleCount + this.BUFFER * 2)
    return this.virtualData.slice(start, end).map((item, i) => ({
      ...item,
      _top: (start + i) * this.ITEM_HEIGHT,
    }))
  }
}
```

---

## 性能对比

| 数据量    | 朴素渲染        | 虚拟滚动       | 分页加载         |
| --------- | --------------- | -------------- | ---------------- |
| 1,000     | 流畅 (~50ms)    | 流畅 (~5ms)    | 流畅 (~5ms)      |
| 10,000    | 卡顿 (~500ms)   | 流畅 (~5ms)    | 流畅 (~5ms)      |
| 100,000   | 卡死 (>5s)      | 流畅 (~5ms)    | 流畅 (~5ms)      |
| DOM 节点  | = 数据量        | ~30 个         | = PAGE_SIZE      |
| 内存占用  | 高              | 低             | 低               |
| 滚动性能  | 差              | 流畅           | 不适用           |

## 完整优化方案总结

### 数据层

- **`shallowRef` / `shallowReactive`**：避免深层响应式
- **`markRaw`**：跳过不需要响应式的对象
- **`Object.freeze`**（Vue2）：冻结数据跳过响应式
- **服务端分页**：API 返回分页数据

### 渲染层

- **虚拟滚动**：本目录重点演示
- **分页加载**：备选方案
- **`v-memo`**（Vue3）：缓存列表项
- **`v-once`**：静态内容只渲染一次

### 交互层

- **`requestAnimationFrame`**：节流滚动
- **`IntersectionObserver`**：无限滚动
- **防抖搜索**：避免每次输入都过滤

## 目录结构

```
040. 使用 Vue 渲染大量数据/
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
│           ├── NaiveList.vue
│           ├── VirtualList.vue
│           └── PaginatedList.vue
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
- Performance API
