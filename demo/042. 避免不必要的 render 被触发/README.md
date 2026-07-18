# 避免不必要的 render 被触发

本项目通过 **React + TS + Vite** 演示如何避免 React 中不必要的 re-render 被触发。

## 核心问题

React 中触发不必要 re-render 的常见场景：
1. **父组件 re-render 导致所有子组件 re-render**：即使子组件 props 没变
2. **每次渲染创建新函数/对象**：即使内容相同，引用不同也会触发渲染
3. **状态下放不当**：状态放在父组件，但只影响子组件
4. **Context 变化**：Context 值变化导致所有消费者 re-render

## 优化方案

### 1. React.memo

对函数组件进行记忆化，对 props 进行浅比较，相同则跳过渲染：

```tsx
const MyComponent = memo(function MyComponent(props) {
  return <div>{props.name}</div>
})
```

### 2. useCallback

稳定函数引用，避免函数每次重新创建：

```tsx
const handleClick = useCallback(() => {
  console.log('clicked')
}, []) // 依赖不变则函数引用不变
```

### 3. useMemo

稳定对象/数组引用，避免每次重新创建：

```tsx
const config = useMemo(() => ({
  label: '优化后',
  color: '#3b82f6',
}), [])
```

### 4. 状态下放

把只影响子组件的状态下放到子组件内部：

```tsx
// ❌ 状态在父组件，父组件 re-render 影响所有子组件
function Parent() {
  const [count, setCount] = useState(0) // 只 Child 用
  return <Child count={count} />
}

// ✅ 状态下放到子组件
function Child() {
  const [count, setCount] = useState(0)
  return <div>{count}</div>
}
```

### 5. 自定义比较函数

React.memo 第二个参数精细控制：

```tsx
const MyComp = memo(Component, (prevProps, nextProps) => {
  // 返回 true 表示相等，跳过渲染
  return prevProps.id === nextProps.id
})
```

### 6. 状态合并（useReducer）

用 useReducer 替代多个 useState，减少状态更新次数：

```tsx
const [state, dispatch] = useReducer(reducer, {
  count: 0,
  text: '',
  active: false,
})
```

## 快速开始

```bash
cd "demo/042. 避免不必要的 render 被触发"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 演示内容

- **父组件触发 re-render**：点击按钮或输入文字触发父组件 re-render
- **BadCounter（反例）**：未使用 React.memo，每次父组件 re-render 都会触发渲染
- **GoodCounter（正例）**：使用 React.memo + 父组件 useCallback/useMemo，父组件 re-render 不影响
- **渲染次数对比**：实时显示每个组件的渲染次数
- **优化原理总结**：6 种避免不必要 render 的方法

## 渲染次数对比

| 操作                | BadCounter（反例） | GoodCounter（正例） |
| ------------------- | ------------------ | ------------------- |
| 父组件点击 +1       | 渲染 +1            | 不渲染              |
| 父组件输入文字      | 渲染 +1            | 不渲染              |
| 子组件内部 +1       | 渲染 +1            | 渲染 +1             |
| 子组件 action 按钮   | 渲染 +1            | 渲染 +1             |

## 完整优化清单

### 避免父组件 re-render 传播

| 手段           | 作用                              | 适用场景                       |
| -------------- | --------------------------------- | ------------------------------ |
| React.memo     | 子组件 props 浅比较，相同则跳过   | 纯展示组件                     |
| useCallback    | 稳定函数引用                      | 传递给子组件的回调             |
| useMemo        | 稳定对象/数组引用                 | 传递给子组件的对象/数组        |
| 状态下放       | 只影响子组件的状态下放            | 子组件独立的状态               |
| 自定义比较     | 精细控制 re-render                | props 包含复杂对象             |

### 避免自身 re-render

| 手段             | 作用                              | 适用场景                       |
| ---------------- | --------------------------------- | ------------------------------ |
| useReducer       | 合并多个状态                      | 多个相关状态                   |
| 状态拆分         | 把无关状态拆分                    | 多个独立状态                   |
| useRef           | 不触发 re-render 的可变值         | 不需要触发渲染的中间值         |
| shouldComponentUpdate | 类组件优化                   | class 组件                     |

### Context 优化

| 手段              | 作用                              | 适用场景                       |
| ----------------- | --------------------------------- | ------------------------------ |
| 拆分 Context      | 不同状态用不同 Context            | 多个 Context 值                |
| useMemo 稳定 value | 避免 Context value 每次新建      | Context Provider value         |
| useContextSelector | 只订阅 Context 部分值             | 大型 Context                   |

## 目录结构

```
042. 避免不必要的 render 被触发/
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
        ├── BadCounter.tsx
        └── GoodCounter.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Vite 5.3+
