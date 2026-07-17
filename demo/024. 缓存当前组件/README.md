# Vue 如何缓存当前组件？缓存后如何更新？

本 Demo 通过 3 个独立子项目，演示 Vue3 中使用 `<KeepAlive>` 缓存组件的全部常见场景，以及缓存后让组件数据保持新鲜的 4 种更新策略。

## 子项目一览

| 子项目 | 端口 | 演示内容 |
| --- | --- | --- |
| `01-keep-alive` | 5249 | `<KeepAlive>` 基础缓存：Tab 切换保留组件状态、`onActivated` / `onDeactivated` 生命周期 |
| `02-include-exclude` | 5250 | KeepAlive 的 `include` / `exclude` / `max` 精确控制（字符串、正则、数组三种形式） |
| `03-cache-update` | 5251 | 缓存组件的 4 种更新策略：`onActivated`、`watch`、`:key` 强制重建、手动刷新 |

## 快速开始

每个子项目都是独立的 Vite 工程，进入对应目录安装依赖即可运行：

```bash
# 方式一：基础缓存
cd 01-keep-alive
npm install
npm run dev          # http://localhost:5249

# 方式二：include / exclude 控制
cd 02-include-exclude
npm install
npm run dev          # http://localhost:5250

# 方式三：缓存组件更新策略
cd 03-cache-update
npm install
npm run dev          # http://localhost:5251
```

类型检查：

```bash
npm run type-check
```

构建：

```bash
npm run build
npm run preview
```

---

## 01-keep-alive：KeepAlive 基础缓存

### 核心用法

用 `<KeepAlive>` 包裹动态组件 `<component :is>`，切换 Tab 时被切走的组件不会销毁，而是被缓存；切回来时直接复用，状态保留。

```vue
<KeepAlive>
  <component :is="currentComponent" />
</KeepAlive>
```

### 关键生命周期变化

| 事件 | 无 KeepAlive | 有 KeepAlive |
| --- | --- | --- |
| 首次进入 | `onMounted` | `onMounted` + `onActivated` |
| 切走 | `onUnmounted`（销毁） | `onDeactivated`（仅停用） |
| 切回 | `onMounted`（重新创建） | `onActivated`（从缓存恢复） |

### Demo 中的 4 个示例视图

- **HomeView**：计数器，切换 Tab 后值保留；展示激活次数、最近激活时间
- **SettingsView**：5 个开关，切换后状态完整保留
- **ProfileView**：表单输入，未提交的数据切换 Tab 也不丢失
- **ListView**：待办列表的增删改，切换后列表内容保留

右侧日志面板实时打印每个视图触发的 `onMounted` / `onActivated` / `onDeactivated` 事件，可以直观看到 `onMounted` 只触发一次。

---

## 02-include-exclude：精确控制缓存范围

### 三个核心 Props

```vue
<!-- 只缓存名为 AlphaComp、BetaComp 的组件 -->
<KeepAlive include="AlphaComp,BetaComp">
  <component :is="current" />
</KeepAlive>

<!-- 排除 DeltaComp -->
<KeepAlive exclude="DeltaComp">
  <component :is="current" />
</KeepAlive>

<!-- 最多缓存 2 个实例（LRU 淘汰） -->
<KeepAlive :max="2">
  <component :is="current" />
</KeepAlive>
```

### include / exclude 的三种值形式

| 形式 | 示例 | 说明 |
| --- | --- | --- |
| 字符串 | `"AlphaComp,BetaComp"` | 逗号分隔的组件名 |
| 正则 | `/^Alpha/` | 匹配组件名 |
| 数组 | `['AlphaComp', 'BetaComp']` | 组件名数组 |

### 组件名匹配规则

`include` / `exclude` 匹配的是**组件的 `name` 选项**，不是文件名、不是变量名。

在 `<script setup>` 中推荐用单独的 `<script>` 块声明 name（兼容性好）：

```vue
<script lang="ts">
export default { name: 'AlphaComp' }
</script>

<script setup lang="ts">
// ...
</script>
```

Vue 3.3+ 也可以用 `defineOptions({ name: 'AlphaComp' })`。

### Demo 交互

- 5 种模式切换：全部缓存 / 仅 include / 仅 exclude / include + exclude / max 上限
- include / exclude 各自可切换 字符串 / 正则 / 数组 三种形式
- 顶部实时预判每个组件是否会被缓存
- Tab 按钮上有缓存状态指示点（绿色 = 缓存，灰色 = 不缓存）
- 4 个组件（AlphaComp / BetaComp / GammaComp / DeltaComp）各有计数器，切回时观察计数器是否被重置即可判断是否被缓存

### max 的 LRU 淘汰

`max` 控制最多缓存的实例数。当超过上限时，Vue 会按 LRU（最近最少使用）策略销毁最久未访问的缓存实例。把 `max` 设为 2，依次访问 A → B → C → A，会发现 B 被淘汰（计数器重置），A 仍被缓存。

---

## 03-cache-update：缓存组件的 4 种更新策略

KeepAlive 缓存的组件再次激活时**不会重新执行 `onMounted`**，因此无法在 `onMounted` 中拉取最新数据。需要让缓存组件"刷新"时，可采用以下 4 种策略。

### 策略 1：`onActivated` 钩子刷新（最常用）

在 `onActivated` 中重新拉取数据，每次切回该 Tab 都会自动刷新：

```ts
import { onActivated } from 'vue'

onActivated(() => {
  fetchData() // 重新拉取最新数据
})
```

### 策略 2：`watch` 监听 prop 变化

父组件通过 prop 传入参数（如分类、过滤条件、时间戳），子组件 watch 该 prop，变化时刷新：

```ts
const props = defineProps<{ category: string }>()

watch(
  () => props.category,
  (newVal, oldVal) => {
    if (newVal !== oldVal) fetchData(newVal)
  },
)
```

### 策略 3：`:key` 强制重建（最暴力）

改变组件的 `key`，Vue 会销毁旧实例并创建新实例，**绕过 KeepAlive 缓存**：

```vue
<KeepAlive>
  <component :is="comp" :key="refreshKey" />
</KeepAlive>
```

```ts
const refreshKey = ref(0)
function forceRefresh() {
  refreshKey.value++ // key 变化 -> 组件销毁重建
}
```

### 策略 4：手动刷新按钮

组件内部暴露刷新方法或提供按钮，由用户主动触发：

```ts
async function manualRefresh() {
  loading.value = true
  const data = await fetchData()
  // ...
}

defineExpose({ refresh: manualRefresh })
```

### Demo 交互

- 顶部控制台可以单独开关策略 1 和策略 2，方便对比效果
- 分类选择器驱动策略 2 的 prop
- "强制重建"按钮触发策略 3
- 新闻列表组件内的"手动刷新"按钮对应策略 4
- "其他页面"Tab 内有实时时钟，演示 KeepAlive 场景下的最佳实践：`onActivated` 启动定时器、`onDeactivated` 清理定时器
- 右侧日志面板实时打印每次数据刷新的触发来源和生命周期事件

### KeepAlive 场景下的定时器最佳实践

```ts
let timer: number | null = null

onActivated(() => {
  // 激活时启动定时器
  if (timer === null) timer = window.setInterval(tick, 1000)
})

onDeactivated(() => {
  // 被缓存时务必清理，避免后台持续占用资源
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
})

onUnmounted(() => {
  // 兜底：组件真正销毁时也清理
  if (timer !== null) clearInterval(timer)
})
```

---

## 知识点总结

### KeepAlive 的工作机制

- KeepAlive 是 Vue 内置抽象组件，包裹动态组件后，组件实例在切换时不销毁，而是缓存到内存中
- 被缓存的组件会多出 `onActivated` / `onDeactivated` 两个生命周期钩子
- `onMounted` / `onUnmounted` 在缓存场景下只触发一次（首次挂载 / 真正销毁时）

### 何时该用 KeepAlive

- 表单页：用户中途切走又回来，未保存的输入应保留
- 列表页 + 详情页：列表的滚动位置、筛选条件应保留
- 重计算页面：避免每次切换都重新计算

### 何时**不该**用 KeepAlive

- 数据需要强实时（如行情、监控），缓存反而展示旧数据误导用户
- 组件占用大量内存且不常访问，缓存收益小于成本
- 表单页提交成功后，应通过 `exclude` 或 `:key` 主动让其重新初始化

### 4 种更新策略对比

| 策略 | 触发时机 | 是否保留状态 | 适用场景 |
| --- | --- | --- | --- |
| `onActivated` | 切回 Tab 时 | 保留 | 列表页切回时拉取最新数据 |
| `watch` prop | 父组件 prop 变化 | 保留 | 筛选条件、分类变化 |
| `:key` 重建 | 父组件改 key | 不保留（重置） | 表单提交后清空、强刷新 |
| 手动刷新 | 用户点击 | 保留 | 用户主动获取最新数据 |

### 常见坑

1. **`include` / `exclude` 不生效**：99% 是组件 `name` 没设置，或设错位置。`<script setup>` 默认用文件名推导，但生产构建后会丢失，务必显式声明
2. **缓存后定时器还在跑**：必须在 `onDeactivated` 清理，否则组件被缓存后定时器仍在后台执行，浪费资源
3. **缓存后数据是旧的**：缓存的本意就是保留状态，需要新鲜数据时要在 `onActivated` 主动刷新
4. **`max` 设置过小**：会频繁 LRU 淘汰，反而不如不缓存
5. **路由组件用 KeepAlive**：Vue Router 中要把 `<router-view>` 用 `<KeepAlive>` 包裹，并通过路由 `meta` 或组件 `name` 控制
