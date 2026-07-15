# 页面内一次性渲染 10 万条数据并保证不卡顿

## 问题本质

10 万条数据如果直接渲染成 DOM，会一次性创建 10 万个节点，带来三个层面的性能瓶颈：

1. **脚本阻塞** - 创建 10 万个 DOM 节点的 JS 执行时间可达数秒，期间页面完全冻结
2. **布局/绘制开销** - 浏览器需要为 10 万个节点计算布局、绘制、合成，每一帧都超时
3. **内存占用** - 10 万个 DOM 节点 + 对应的框架 VNode/组件实例，内存占用可达数百 MB

## 三种方法核心原理对比

### 方法一：直接渲染（baseline）

把 10 万条数据一次性 map 成 DOM 节点全量插入页面。页面会卡顿甚至假死数秒，仅用于对比感受性能差异。

### 方法二：虚拟列表（推荐）

核心原理是「只渲染可视区域内的元素」：

1. **撑高滚动条** - 用一个 `height = totalCount * itemHeight` 的占位 div 撑出完整滚动条高度
2. **计算可视区间** - 监听 `scroll` 事件，根据 `scrollTop` 和 `itemHeight` 算出当前可见的 `startIndex` / `endIndex`
3. **只渲染可见部分** - `slice(startIndex, endIndex)` 取出这一小段数据渲染，用 `transform: translateY(offsetY)` 偏移到正确位置
4. **overscan 缓冲** - 在可视区域上下各多渲染几条（overscan），避免快速滚动时出现白屏

无论数据量多大，实际 DOM 数量恒定（约 `viewportHeight / itemHeight + 2 * overscan`），10 万条和 10 条的渲染开销几乎一样。这是大数据量长列表的唯一最优解。

### 方法三：时间分片

核心原理是「把一次大任务拆成多个小任务，每帧只做一小块」：

1. 初始只渲染前 `batchSize`（如 200）条
2. 每渲染完一批，用 `requestAnimationFrame` 让出主线程
3. 浏览器有机会响应用户交互、绘制画面后，下一帧再渲染下一批
4. 重复直到全部渲染完毕

用户能逐步看到内容、页面不会长时间冻结。但最终 DOM 数量仍等于数据总量，10 万条 DOM 内存开销大，滚动流畅度不如虚拟列表。适合中等数据量（几千到一两万），大数据量请用虚拟列表。

## 方法选型建议

| 数据量      | 推荐方法 | 理由                                   |
| ----------- | -------- | -------------------------------------- |
| < 500       | 直接渲染 | DOM 数量少，框架开销可忽略，无需优化   |
| 500 ~ 20000 | 时间分片 | 实现简单，DOM 总量可控，逐步展示体验好 |
| > 20000     | 虚拟列表 | DOM 数量恒定，内存和滚动性能最优       |

## 目录结构

```
002. VList/
├── react-ts-vite/              # React + TS + Vite (端口 5180)
│   └── src/
│       ├── components/
│       │   ├── NormalList.tsx      # 方法一: 直接渲染
│       │   ├── VirtualList.tsx     # 方法二: 虚拟列表
│       │   └── TimeSliceList.tsx   # 方法三: requestAnimationFrame 时间分片
│       ├── utils/data.ts           # 数据生成工具
│       ├── App.tsx
│       └── main.tsx
├── vue2/                       # Vue2 (端口 5181)
│   └── src/
│       ├── components/
│       │   ├── NormalList.vue      # 方法一: 直接渲染
│       │   ├── VirtualList.vue     # 方法二: 虚拟列表
│       │   └── TimeSliceList.vue   # 方法三: 分批渲染
│       ├── utils/data.js
│       ├── App.vue
│       └── main.js
└── vue3-ts-vite/               # Vue3 + TS + Vite (端口 5182)
    └── src/
        ├── components/
        │   ├── NormalList.vue      # 方法一: 直接渲染
        │   ├── VirtualList.vue     # 方法二: 虚拟列表
        │   └── TimeSliceList.vue   # 方法三: 分批渲染
        ├── utils/data.ts
        ├── App.vue
        └── main.ts
```

## 启动方式

```bash
# React
cd "002. VList/react-ts-vite" && npm run dev

# Vue2
cd "002. VList/vue2" && npm run dev

# Vue3
cd "002. VList/vue3-ts-vite" && npm run dev
```

每个项目默认生成 10 万条数据，可在三种方法间切换对比。建议先切到「方法一：直接渲染」感受卡顿，再切到「方法二：虚拟列表」体验丝滑滚动，直观感受性能差异。
