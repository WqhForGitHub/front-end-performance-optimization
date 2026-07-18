# 实现 React 组件的记忆

本项目通过 **React + TS + Vite** 演示如何实现 React 组件的记忆及其原理。

## 核心知识点

### React 组件记忆的三剑客

| API          | 作用                          | 类比 Class 组件                |
| ------------ | ----------------------------- | ------------------------------ |
| React.memo   | 记忆组件，浅比较 props        | PureComponent + SCU            |
| useMemo      | 记忆值，依赖不变则复用结果    | -                              |
| useCallback  | 记忆函数，依赖不变则引用不变  | -                              |

### 原理

React 默认情况下，父组件 re-render 会触发所有子组件 re-render，即使子组件 props 没有变化。
"组件记忆"通过浅比较跳过不必要的渲染，从而提升性能。

#### 1. React.memo 原理

```jsx
// React.memo 工作原理（伪代码）
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false
  return prevKeys.every((key) => prev[key] === next[key])
}

function memo(Component) {
  return function Memoized(props) {
    const prevProps = useRef(props)
    const prevResult = useRef(null)

    if (!prevResult.current || !shallowEqual(prevProps.current, props)) {
      prevResult.current = Component(props)
      prevProps.current = props
    }
    return prevResult.current
  }
}
```

#### 2. useMemo 原理

```jsx
// useMemo 工作原理（伪代码）
function useMemo(factory, deps) {
  const prevDeps = useRef(deps)
  const prevValue = useRef()

  if (!prevValue.current || !shallowEqual(prevDeps.current, deps)) {
    prevValue.current = factory() // 依赖变化时重新计算
    prevDeps.current = deps
  }
  return prevValue.current
}
```

#### 3. useCallback 原理

`useCallback(fn, deps)` 实际上是 `useMemo(() => fn, deps)` 的语法糖：

```jsx
// 这两个写法等价
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])

const handleClick = useMemo(() => () => {
  console.log('clicked')
}, [])
```

## 三剑客配合使用

```jsx
function Parent() {
  // useCallback 稳定函数引用
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  // useMemo 稳定对象引用
  const config = useMemo(() => ({
    title: '优化后',
    version: '1.0.0',
  }), [])

  // 必须配合 React.memo 才能避免 re-render
  return <MemoChild onClick={handleClick} config={config} />
}

const MemoChild = memo(function Child({ onClick, config }) {
  return <div onClick={onClick}>{config.title}</div>
})
```

> **关键**：单独使用 useCallback 或 useMemo 没有意义，必须配合 React.memo 才能避免子组件 re-render。

## 快速开始

```bash
cd "demo/044. 实现 React 组件的记忆"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 演示内容

### 1. MemoDemo（React.memo）

- 子组件用 React.memo 包裹
- 父组件传入的 title 是基本类型，浅比较有效
- 父组件传入的 onClick 用 useCallback 稳定引用
- 父组件 re-render 时本组件不渲染

### 2. UseMemoDemo（useMemo）

- 昂贵的计算用 useMemo 缓存
- 仅当 count 变化时才重新计算
- 输入文字触发 re-render 但不触发计算
- 实时显示渲染次数和计算执行次数

### 3. UseCallbackDemo（useCallback）

- 父组件传入的 onAction 用 useCallback 稳定引用
- 本组件用 React.memo 包裹
- 父组件 re-render 时本组件不渲染
- 但点击按钮仍能正常调用 onAction

## 渲染次数对比

| 操作                | MemoDemo | UseMemoDemo | UseCallbackDemo |
| ------------------- | -------- | ----------- | --------------- |
| 父组件 tick +1      | 不渲染   | 不渲染      | 不渲染          |
| 子组件内部 +1       | 渲染 +1  | 渲染 +1     | 渲染 +1         |
| 输入文字（UseMemo） | -        | 渲染 +1     | -               |

## 使用场景

### React.memo 适用场景

- 纯展示组件
- props 较少且为基本类型
- 子组件渲染开销大

### useMemo 适用场景

- 昂贵的计算（循环、递归、复杂算法）
- 稳定对象/数组引用（传递给 memo 子组件）
- 派生状态计算

### useCallback 适用场景

- 传递给被 memo 包裹的子组件的回调
- 作为 useEffect 的依赖
- 作为其他 useCallback 的依赖

## 常见误区

### 1. 滥用 useMemo/useCallback

```jsx
// ❌ 滥用：简单值不需要 useMemo
const value = useMemo(() => a + b, [a, b]) // 计算本身比 useMemo 还快

// ❌ 滥用：未传递给 memo 子组件的函数不需要 useCallback
const handleClick = useCallback(() => {
  setCount(c => c + 1)
}, []) // 没有传递给子组件，useCallback 无意义
```

### 2. 依赖数组错误

```jsx
// ❌ 依赖缺失：闭包陷阱
const handleClick = useCallback(() => {
  console.log(count) // 永远是初始值
}, []) // 应该写 [count]

// ❌ 依赖过多：每次都重新创建
const handleClick = useCallback(() => {
  setCount(c => c + 1)
}, [obj]) // obj 每次都是新引用，useCallback 失效
```

### 3. 单独使用无效

```jsx
// ❌ 单独使用 useCallback 没有 meaning
function Parent() {
  const handleClick = useCallback(() => {}, [])
  return <Child onClick={handleClick} /> // Child 未 memo，仍会 re-render
}
```

## 目录结构

```
044. 实现 React 组件的记忆/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── env.d.ts
    ├── main.tsx
    ├── App.tsx
    └── components/
        ├── MemoDemo.tsx
        ├── UseMemoDemo.tsx
        └── UseCallbackDemo.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Vite 5.3+
