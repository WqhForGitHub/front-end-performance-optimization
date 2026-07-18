# Vue 性能优化的方法

本目录通过 **Vue3 + TypeScript + Vite** 演示前端开发中常见的 Vue 性能优化手段，包含 3 个独立可运行的子项目。

## 子项目一览

| 子项目               | 端口 | 核心技术                          | 说明                                                     |
| -------------------- | ---- | --------------------------------- | -------------------------------------------------------- |
| `01-keep-alive-vite` | 5273 | `KeepAlive` 组件缓存              | 通过 KeepAlive 缓存组件实例，保留状态、避免重复挂载      |
| `02-v-once-v-memo`   | 5274 | `v-once` / `v-memo`               | 静态内容一次性渲染、条件化记忆子树，跳过不必要的重新渲染 |
| `03-lazy-virtual`    | 5275 | `defineAsyncComponent` + 虚拟滚动 | 异步组件按需加载 + 万级列表虚拟滚动                      |

## 快速开始

```bash
# 进入任一子项目
cd "demo/034. Vue 性能优化的方法/01-keep-alive-vite"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 一、KeepAlive 组件缓存（`01-keep-alive-vite`）

### 原理

`<KeepAlive>` 是 Vue 内置组件，用于缓存不活动的组件实例而不是销毁它们。当组件被切换出去时，它的状态会被保留；切回时无需重新执行 `setup`、`onMounted` 等完整生命周期。

### 关键 API

- `<KeepAlive>`：包裹动态组件 `<component :is="..." />`
- `include` / `exclude` / `max`：控制缓存范围与上限
- `onActivated`：组件被激活（从缓存恢复）时触发
- `onDeactivated`：组件被缓存（移出视图）时触发

### 演示内容

- 4 个 Tab 组件（计数器、表单、计时器、列表）通过 KeepAlive 缓存
- 计数器数值、表单输入、计时器秒数在切换 Tab 后依然保留
- 控制台输出 `onActivated` / `onDeactivated` / `onMounted` 生命周期日志
- 提供 KeepAlive 开关，对比开启/关闭时的重新挂载次数

### 收益

- 避免重复的组件初始化与销毁开销
- 保留用户操作状态，提升交互体验
- 适合 Tab 切换、路由缓存（结合 `vue-router` 的 `keep-alive`）等场景

---

## 二、v-once 与 v-memo 静态优化（`02-v-once-v-memo`）

### 原理

- `v-once`：元素和子组件只渲染一次，后续更新完全跳过，适合纯静态内容
- `v-memo`：仅当依赖数组中的值发生变化时才重新渲染该子树，否则复用上次渲染结果

### 关键用法

```vue
<!-- 静态内容只渲染一次 -->
<div v-once>{{ title }} {{ version }}</div>

<!-- 仅当 id/selected/label 变化时才重新渲染 -->
<div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected, item.label]">
  <ListItem :data="item" />
</div>
```

### 演示内容

- `v-once` 区域：标题、版本号等静态内容渲染后冻结，tick 不再影响
- `v-memo` 区域：依赖 `message` 变化才更新，与外部 `tick` 解耦
- 列表 `v-memo`：每项右侧显示自身渲染次数，修改单项时其余项渲染次数不变
- 全局渲染次数实时显示，直观对比优化效果

### 收益

- 减少静态子树的 diff 开销
- 大列表局部更新时，跳过未变更项的重新渲染
- 适合静态文档、营销页、大数据量列表等场景

---

## 三、懒加载与虚拟滚动（`03-lazy-virtual`）

### 原理

- `defineAsyncComponent`：将组件代码拆分为独立 chunk，首次使用时才请求加载，减小首屏 bundle 体积
- 虚拟滚动：只渲染可视区域内的少量 DOM，配合占位容器撑起总高度，滚动时动态替换可视项

### 关键 API

```ts
// 异步组件懒加载
const LazyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: LoadingComp,
  errorComponent: ErrorComp,
  delay: 200,
  timeout: 10000,
})

// 虚拟滚动核心：根据 scrollTop 计算可视区间
const start = Math.floor(scrollTop.value / ITEM_HEIGHT)
const end = start + Math.ceil(viewportHeight / ITEM_HEIGHT) + buffer
```

### 演示内容

- 异步图表组件：可切换同步/异步加载模式，配合 `<Suspense>` 显示 loading
- 1 万条数据虚拟滚动：实时显示总数据量、实际渲染 DOM 数、可视区间、滚动位置
- 提供回到顶部、跳到中间等快捷操作
- 使用 `requestAnimationFrame` 节流滚动事件，避免高频重排

### 收益

- 首屏只加载核心代码，重型组件按需请求
- 万级数据列表始终保持少量 DOM 节点，滚动流畅
- 内存占用与渲染时间不随数据量线性增长

---

## Vue 性能优化方法总结

除本目录演示的三种方法外，Vue 项目常见的性能优化手段还包括：

### 编译期优化

- **静态提升（Static Hoisting）**：Vue3 模板编译器自动将静态节点提升到渲染函数外
- **PatchFlag**：编译期标记动态节点类型，运行时 diff 时只比对动态部分
- **Block Tree**：将模板划分为 Block，跳过静态节点的遍历

### 运行时优化

- **响应式精细化**：使用 `shallowRef` / `shallowReactive` 避免深层响应式开销
- **`computed` 缓存**：依赖未变时复用计算结果
- **`watchEffect` 与 `watch` 选择**：按需使用，避免不必要的依赖追踪
- **`v-show` vs `v-if`**：频繁切换用 `v-show`，条件少变用 `v-if`

### 资源加载优化

- **路由懒加载**：`() => import('./views/xxx.vue')` 实现按路由分包
- **组件异步加载**：`defineAsyncComponent` 拆分重型组件
- **图片懒加载**：`loading="lazy"` 或自定义指令
- **Tree Shaking**：按需引入第三方库（如 lodash-es、element-plus）

### 渲染优化

- **`key` 的正确使用**：列表项使用稳定唯一的 key，避免就地复用
- **`Object.freeze` / `markRaw`**：跳过不需要响应式的数据
- **大列表虚拟滚动**：本目录 `03-lazy-virtual` 演示
- **分页/无限滚动**：替代一次性渲染全部数据

### 构建优化（Vite/Webpack）

- 代码分割（Code Splitting）
- 压缩与 Gzip/Brotli
- CDN 加速静态资源
- 预加载（preload）与预取（prefetch）

### 监控与度量

- 使用 Chrome DevTools Performance 面板分析渲染耗时
- Vue DevTools 检查组件更新频率
- Lighthouse 评估整体性能得分

---

## 目录结构

```
034. Vue 性能优化的方法/
├── README.md
├── 01-keep-alive-vite/        # KeepAlive 组件缓存
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           ├── CounterTab.vue
│           ├── FormTab.vue
│           ├── TimerTab.vue
│           └── ListTab.vue
├── 02-v-once-v-memo/          # v-once 与 v-memo
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           └── MemoListItem.vue
└── 03-lazy-virtual/           # 懒加载与虚拟滚动
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.ts
        ├── App.vue
        └── components/
            └── HeavyChart.vue
```

## 技术栈

- Vue 3.4+
- TypeScript 5.5+
- Vite 5.3+
- `@vitejs/plugin-vue` 5.0+
