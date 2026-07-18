# 027. 如何让 React 跳过重新渲染？

React 默认在父组件重新渲染时会递归重新渲染所有子组件，即使子组件的 props 没有变化。这会带来大量无意义的渲染开销。本目录通过 3 个独立可运行的 Demo 演示 3 类常见的「跳过重新渲染」手段。

技术栈：**React 18 + Vite + TypeScript**。每个子目录都是独立项目，互不依赖。

## 子项目一览

| 序号 | 目录                  | 端口 | 主题                                     | 核心要点                                   |
| ---- | --------------------- | ---- | ---------------------------------------- | ------------------------------------------ |
| 01   | `01-memo-useCallback` | 5258 | `React.memo` + `useCallback` + `useMemo` | 稳定 props 引用，让 `memo` 真正生效        |
| 02   | `02-useMemo-compute`  | 5259 | `useMemo` 用于昂贵计算                   | 缓存昂贵计算结果，避免每次渲染重算         |
| 03   | `03-state-colocation` | 5260 | 状态就近 & 依赖数组                      | 状态下沉到使用处，避免兄弟组件被牵连重渲染 |

## 如何运行

进入任一子目录后执行：

```bash
npm install
npm run dev
```

然后在浏览器打开对应端口（5258 / 5259 / 5260）。

类型检查（无需安装依赖也能跑，因为使用了本地类型声明）：

```bash
npm run type-check
```

## 三个 Demo 说明

### 01 - `React.memo` + `useCallback` + `useMemo`（端口 5258）

父组件持有一个 `counter` 和一个 `text` 状态，并渲染两个子组件：

- **BadChild**：虽然用 `React.memo` 包裹，但父组件每次渲染都传入**内联函数** `onClick` 和**内联对象** `config`。由于引用每次都变，`memo` 浅比较失效，子组件被迫重新渲染。
- **GoodChild**：用 `useCallback` 稳定函数引用、`useMemo` 稳定对象引用。当父组件只改 `counter` 时，子组件 props 引用不变，`memo` 跳过重新渲染。

要点：`React.memo` 只做**浅比较**；要让它在 props 含函数/对象时生效，必须配合 `useCallback` / `useMemo` 稳定引用。

### 02 - `useMemo` 用于昂贵计算（端口 5259）

对一个 4000 条数据集做「过滤 + 多轮变换 + 排序」的昂贵计算，并提供开关：

- **关闭 useMemo**：每次父组件因不相关状态（`unrelated`）重新渲染时，都会重跑昂贵计算，耗时明显。
- **开启 useMemo**：仅当 `threshold` 变化时重算，其余情况复用缓存结果。

界面实时显示本次计算耗时和列表组件的渲染次数。要点：`useMemo` 的依赖数组要列出所有影响结果的变量；昂贵计算才值得 memo，简单计算反而增加开销。

### 03 - 状态就近 & 依赖数组（端口 5260）

对比两种状态放置方式：

- **Panel A（状态在父组件）**：输入框的 `text` 状态放在父组件 `PanelA`，导致每次输入都会让父组件重渲染，进而牵连**不使用 `text` 的兄弟组件 `SiblingA`** 一起重渲染（浪费）。
- **Panel B（状态就近）**：输入框的 `text` 状态下沉到真正使用它的 `ChildB` 内部，输入只触发 `ChildB` 自身重渲染，`SiblingB` 不受影响。

另外演示 `useEffect` 依赖数组：effect 仅在 `count` 变化时触发，修改 `text` 不会触发，体现依赖数组对 effect 执行时机的精确控制。

## 核心结论

1. 想让 `React.memo` 真正跳过渲染，必须保证传入子组件的 props **引用稳定**（函数用 `useCallback`，对象/数组用 `useMemo`）。
2. 昂贵计算用 `useMemo` 缓存，依赖数组要准确；简单计算不必 memo。
3. **状态就近原则**：把状态下沉到真正使用它的组件，能从根本上减少不必要的渲染范围，比事后用 `memo` 补救更优雅。
4. `useEffect` 依赖数组决定了 effect 的重新执行时机，列错依赖会导致漏执行或过度执行。

## 目录结构

```
027. React 跳过重新渲染/
├── README.md
├── 01-memo-useCallback/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       └── App.tsx
├── 02-useMemo-compute/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       └── App.tsx
└── 03-state-colocation/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        └── App.tsx
```
