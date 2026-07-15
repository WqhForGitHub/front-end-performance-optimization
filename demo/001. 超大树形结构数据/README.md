# 前端处理后端接口一次性返回的超大树形结构数据

## 三种方法核心原理对比

### 方法一：直接渲染（baseline）

递归组件全量渲染所有节点，DOM 数量随节点数线性增长。节点多了页面直接卡死，仅用于对比。

### 方法二：虚拟列表（推荐）

核心思路在 `treeData.ts` 的 `flattenTree` 函数：

1. **扁平化** - 将树形数据递归遍历为一维数组，记录每个节点的 `depth`（缩进层级）
2. **只渲染可视区域** - 根据 `scrollTop` 计算 `startIndex` / `endIndex`，只 slice 这一段渲染
3. **撑高容器** - 用一个 `height = totalCount * itemHeight` 的空 div 模拟完整滚动条

无论数据量多大，实际 DOM 数量恒定（约 `viewport/itemHeight + 5`），是性能最优方案。

### 方法三：时间分片

- **React** 用 `useTransition` 将展开/折叠标记为低优先级更新，不阻塞用户输入
- **Vue2/Vue3** 用 `setTimeout` 分批渲染（每批 200 个），让浏览器有机会响应交互

## 目录结构

```
001. bigTreeData/
├── react-ts-vite/          # React + TS + Vite (端口 5170)
│   └── src/
│       ├── components/
│       │   ├── NormalTree.tsx      # 方法一: 直接递归渲染
│       │   ├── VirtualTree.tsx     # 方法二: 虚拟列表
│       │   └── TimeSliceTree.tsx   # 方法三: useTransition 时间分片
│       ├── utils/treeData.ts       # 数据生成 + 扁平化工具
│       ├── App.tsx
│       └── main.tsx
├── vue2/                   # Vue2 (端口 5171)
│   └── src/
│       ├── components/
│       │   ├── TreeNode.vue        # 递归节点组件
│       │   ├── NormalTree.vue      # 方法一: 直接递归渲染
│       │   ├── VirtualTree.vue     # 方法二: 虚拟列表
│       │   └── TimeSliceTree.vue   # 方法三: 分批渲染
│       ├── utils/treeData.js
│       ├── App.vue
│       └── main.js
└── vue3-ts-vite/           # Vue3 + TS + Vite (端口 5172)
    └── src/
        ├── components/
        │   ├── TreeItem.vue        # 递归节点组件
        │   ├── NormalTree.vue      # 方法一: 直接递归渲染
        │   ├── VirtualTree.vue     # 方法二: 虚拟列表
        │   └── TimeSliceTree.vue   # 方法三: 分批渲染
        ├── utils/treeData.ts
        ├── App.vue
        └── main.ts
```

## 启动方式

```bash
# React
cd "001. bigTreeData/react-ts-vite" && npm run dev

# Vue2
cd "001. bigTreeData/vue2" && npm run dev

# Vue3
cd "001. bigTreeData/vue3-ts-vite" && npm run dev
```

每个项目都支持自定义树深度和广度来生成不同规模的数据，可在三种方法间切换对比性能差异。建议用深度5×广度8（约3.7万节点）测试，虚拟列表方法可轻松应对而直接渲染方法会明显卡顿。
