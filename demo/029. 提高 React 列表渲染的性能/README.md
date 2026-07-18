# 如何提高 React 列表渲染的性能？

当列表数据量较大（数百、数千甚至数万条）时，React 列表渲染的性能瓶颈通常来自三个方面：

1. **DOM 节点过多** —— 一次性把所有数据渲染成 DOM，首屏慢、滚动卡、内存高。
2. **无谓的重渲染** —— 父组件状态变化时，未变化的子项也被重新渲染。
3. **实例与数据错位** —— 列表顺序变化时，错误的 `key` 导致组件状态错乱、重渲染异常。

本目录通过三个子 Demo 分别演示对应的优化方案，技术栈统一为 **React + Vite + TypeScript**。

## 子 Demo

| 子 Demo                                    | 端口 | 核心方案                       | 说明                                                                           |
| ------------------------------------------ | ---- | ------------------------------ | ------------------------------------------------------------------------------ |
| [`01-virtual-scroll`](./01-virtual-scroll) | 5264 | 虚拟滚动（Virtual Scrolling）  | 10000 条数据只渲染可视区约 20 项，展示渲染数 vs 总数、滚动指示器与全量渲染对比 |
| [`02-pagination`](./02-pagination)         | 5265 | 分页（Pagination）             | 1000 条数据，支持 10/20/50 每页切换、上/下页/首末页/跳转，并与一次性渲染对比   |
| [`03-windowing-key`](./03-windowing-key)   | 5266 | 窗口化 + 稳定 key + React.memo | 三件套组合：虚拟滚动 + memo 避免无谓重渲染 + 稳定 key 保证状态正确             |

## 运行方式

每个子目录都是独立工程，进入对应目录后安装依赖并启动即可：

```bash
cd 01-virtual-scroll
npm install
npm run dev          # 浏览器访问 http://localhost:5264
```

其余两个子目录同理，端口分别为 `5265`、`5266`。

```bash
cd 02-pagination && npm install && npm run dev   # http://localhost:5265
cd 03-windowing-key && npm install && npm run dev # http://localhost:5266
```

类型检查与构建：

```bash
npm run type-check   # tsc --noEmit
npm run build        # tsc --noEmit && vite build
```

## 方案速览

### 1. 虚拟滚动（01-virtual-scroll）

只渲染「可视区域 + 上下预渲染（overscan）」的少量节点，滚动时根据 `scrollTop` 动态替换：

```ts
const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
const endIndex = Math.min(total, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan)
const visible = items.slice(startIndex, endIndex)
```

- DOM 节点数 ≈ `ceil(viewportHeight / itemHeight) + 2 * overscan`，与总数据量解耦。
- 适合信息流、长列表等「连续滚动」场景。
- 定高列表实现最简单；变高列表需要缓存每项真实高度或使用 `ResizeObserver`。

### 2. 分页（02-pagination）

把数据切成固定大小的页，只渲染当前页：

```ts
const totalPages = Math.ceil(total / pageSize)
const startIdx = (current - 1) * pageSize
const endIdx = Math.min(total, startIdx + pageSize)
const pageItems = items.slice(startIdx, endIdx)
```

- DOM 节点数 = `pageSize`，首屏稳定。
- 适合表格、搜索结果等「按顺序浏览」场景，配合服务端分页可进一步降低网络与内存开销。
- 与虚拟滚动相比，分页没有连续滚动体验，但实现更简单、对 SEO 与 URL 友好。

### 3. 窗口化 + 稳定 key + React.memo（03-windowing-key）

三件套组合，分别解决不同层面的问题：

- **窗口化（虚拟滚动）**：解决「DOM 太多」。
- **React.memo**：父组件重渲染时，props 不变的子项被跳过；配合 `useMemo` / `useCallback` 保证传入子项的对象/函数引用稳定。
- **稳定 key**：用唯一且不变的 `item.id` 作为 key，保证数据项与组件实例一一对应；避免用数组索引 `index`，否则顺序变化时状态会错位。

```tsx
const Row = memo(function Row(props: RowProps) {
  /* ... */
})

{
  visible.map((it) => <Row key={it.id} id={it.id} name={it.name} />)
}
```

## 选型建议

| 场景                                   | 推荐方案                         |
| -------------------------------------- | -------------------------------- |
| 信息流 / 聊天记录 / 长列表（连续滚动） | 虚拟滚动                         |
| 表格 / 搜索结果（按页浏览）            | 分页（可配合服务端分页）         |
| 数据量大 + 频繁更新的列表              | 虚拟滚动 + React.memo + 稳定 key |
| 数据量小（几十到几百）                 | 直接渲染即可，避免过度优化       |

## 通用补充

- **`key` 必须稳定且唯一**：不要用数组索引作为 key（除非列表纯展示、无顺序变化、无内部状态）。避免用 `Math.random()` 生成 key。
- **memo 不是银弹**：仅当子项渲染成本较高、且 props 真的稳定时收益明显；滥用反而增加浅比较开销。
- **优先测量再优化**：用 React DevTools Profiler 与 Performance 面板定位真实瓶颈，避免过早优化。
