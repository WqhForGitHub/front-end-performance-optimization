# 028. React 性能优化的方法有哪些？比如怎么提升组件渲染效率？

React 应用变慢，绝大多数时候都集中在两个方向：**渲染了不该渲染的组件**、**一次渲染做了太多事 / 挂了太多 DOM 节点**。本目录通过 3 个独立可运行的 Demo 覆盖这两类问题的典型解法——从「跳过无意义重渲染」到「长列表虚拟化」，再到「正确使用 key 与状态管理」。

技术栈：**React 18 + Vite + TypeScript**。每个子目录都是独立项目，互不依赖。

## 子项目一览

| 序号 | 目录               | 端口 | 主题                                     | 核心要点                                    |
| ---- | ------------------ | ---- | ---------------------------------------- | ------------------------------------------- |
| 01   | `01-memo-render`   | 5261 | `React.memo` / `useMemo` / `useCallback` | 三者配合让子组件在 props 不变时跳过渲染     |
| 02   | `02-virtual-list`  | 5262 | 虚拟列表（Virtual Scrolling）            | 1 万条数据只渲染可视区几十个节点            |
| 03   | `03-key-and-state` | 5263 | key 的选择 & `useReducer` vs `useState`  | 错误 key 导致状态错位；reducer 集中管理状态 |

## 如何运行

进入任一子目录后执行：

```bash
npm install
npm run dev
```

然后在浏览器打开对应端口（5261 / 5262 / 5263）。

类型检查（无需安装依赖也能跑，因为使用了本地类型声明）：

```bash
npm run type-check
```

## 三个 Demo 说明

### 01 - `React.memo` / `useMemo` / `useCallback`（端口 5261）

父组件持有 `count`、`text`、`theme` 三个 state，并渲染多组对比子组件，每组都用 `useRef` 统计渲染次数：

- **memo 是否包裹**：未优化子组件在父组件任意 state 变化时都会重渲染；`React.memo` 子组件仅当 `value` 变化时才重渲染。
- **useCallback 对比**：被 `memo` 包裹的子组件如果收到「每次新建的函数」props，memo 仍会失效；改用 `useCallback` 稳定引用后即可跳过渲染。
- **useMemo 对比**：数组 / 对象类型的 props 每次新建都会破坏浅比较，`useMemo` 缓存引用才能让 memo 生效。

末尾附三种 API 的对比表。要点：`React.memo` 只做**浅比较**，必须配合稳定的 props 引用（函数用 `useCallback`，对象 / 数组用 `useMemo`）才能真正生效；滥用 memo 系列也有 deps 比较开销，只在确有瓶颈时使用。

### 02 - 虚拟列表（端口 5262）

对 1 万条数据实现虚拟滚动：

- **虚拟列表**：滚动容器内只有一个总高度 = `itemCount * itemHeight` 的「占位轨道」，实际只渲染 `[startIndex, endIndex)` 区间内的几十个节点（含 `overscan` 预渲染），用绝对定位放到对应 `top`。滚动时根据 `scrollTop` 实时重算区间并替换可见节点。
- **全量渲染对比**：可一键挂载全部 1 万个节点，直观感受首屏卡顿与 DOM 节点数差异。
- 界面实时显示 `scrollTop`、可见区间 `[start, end)`、实际渲染数 / 总数，并给出区间计算公式。

要点：无论数据量多大，DOM 节点数始终约等于 `ceil(viewportHeight / itemHeight) + 2 * overscan`，首屏时间复杂度从 O(n) 降到 O(可视行数)。

### 03 - key 与状态管理（端口 5263）

- **key 对比（index vs id）**：每行带一个**非受控**文本输入框（文字存在 DOM 里）。用 `index` 作 key 时，在头部插入新项会让 React 按位置复用 DOM，导致输入框文字与标签错位；用稳定的 `id` 作 key 时，每行连同输入框一起正确移动。
- **Todo List（useReducer + id key）**：用 reducer 集中管理 `add / toggle / edit / delete` 四种动作，列表项使用 `key = todo.id`，删除 / 排序时组件状态不会错位。
- **useState vs useReducer**：给出等价代码片段与对比表。

> 说明：本项目的本地类型声明 `env.d.ts` 未声明官方 `useReducer`，因此 Demo 中的 `useReducer` 是用 `useState` 实现的等价自定义版本——每次 `dispatch` 就是用 `reducer(prev, action)` 计算下一个 state，借此演示 reducer 思想。

## 核心结论

1. **跳过无意义渲染**：`React.memo` 让组件在 props 浅比较不变时跳过渲染，但必须配合 `useCallback`（函数）/ `useMemo`（对象、数组、昂贵计算）稳定 props 引用，否则 memo 形同虚设。
2. **长列表虚拟化**：数据量到千级以上时，全量渲染 DOM 是性能杀手；虚拟列表只渲染可视区，节点数与数据量解耦。
3. **key 决定组件身份**：用稳定且唯一的 `id` 作 key，保证列表增删 / 排序时组件状态正确跟随；用 `index` 作 key 在涉及输入框、动画、组件内状态时会引发隐蔽 bug。
4. **状态管理选型**：简单独立状态用 `useState`；多个相互关联、更新逻辑复杂的状态用 `useReducer` 集中管理，reducer 是纯函数，便于测试与追踪。
5. **状态就近原则**：把状态下沉到真正使用它的组件，能从源头缩小渲染范围，比事后用 `memo` 补救更优雅。

## 目录结构

```
028. React 性能优化的方法/
├── README.md
├── 01-memo-render/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── index.css
│       └── App.tsx
├── 02-virtual-list/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── index.css
│       └── App.tsx
└── 03-key-and-state/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        ├── index.css
        └── App.tsx
```
