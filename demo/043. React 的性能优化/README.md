# React 的性能优化

本项目通过 **React + TS + Vite** 演示 React 性能优化主要集中的生命周期（shouldComponentUpdate）及其优化原理。

## 核心知识点

### React 性能优化主要集中在哪个生命周期？

**答：`shouldComponentUpdate`（class 组件）/ `React.memo`（函数组件）**

### 优化原理

React 默认情况下，父组件 re-render 会触发所有子组件 re-render，即使子组件的 props 没有变化。`shouldComponentUpdate` 让开发者可以控制何时跳过 re-render：

```jsx
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 返回 false 则跳过本次 re-render
    return nextProps.id !== this.props.id
  }
}
```

### 默认行为

| 组件类型            | 默认 shouldComponentUpdate | 行为                              |
| ------------------- | -------------------------- | --------------------------------- |
| React.Component     | 总是返回 true              | 父组件 re-render 必定触发子组件   |
| React.PureComponent | 浅比较 props 和 state      | props/state 浅相等则跳过          |
| 函数组件            | 无（总是 re-render）       | 需要 React.memo 包裹              |
| React.memo 包裹     | 浅比较 props               | props 浅相等则跳过                |

## 优化方案

### 1. shouldComponentUpdate（Class 组件）

```jsx
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 仅当 id 变化时才更新
    return nextProps.id !== this.props.id
  }
}
```

### 2. PureComponent（Class 组件）

```jsx
class MyComponent extends React.PureComponent {
  // 自动浅比较 props 和 state，无需手写 shouldComponentUpdate
}
```

### 3. React.memo（函数组件）

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.id}</div>
})

// 自定义比较函数
const MyComponent = React.memo(
  (props) => <div>{props.id}</div>,
  (prev, next) => prev.id === next.id // 返回 true 表示跳过
)
```

### 4. 浅比较的局限

PureComponent 和 React.memo 都是**浅比较**：

```jsx
// ❌ 浅比较无法检测内容变化
const items = [{ id: 1, name: 'Apple' }]
// 父组件重新创建数组，即使内容相同，引用不同也会触发渲染
<OptimizedList items={items} />

// ✅ 配合 useState 暴力更新
// 使用 immutable 更新策略：每次更新都创建新引用
```

## 快速开始

```bash
cd "demo/043. React 的性能优化"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 演示内容

### 1. UnoptimizedList（反例）

- 继承 `React.Component`
- 默认 `shouldComponentUpdate` 返回 true
- 父组件每次 re-render 都会触发本组件渲染
- 渲染次数持续增加

### 2. OptimizedList（正例 - PureComponent）

- 继承 `React.PureComponent`
- 自动浅比较 props 和 state
- 当 props.items 引用未变时跳过 re-render
- 渲染次数远少于反例

### 3. ShouldComponentUpdateDemo（手写 SCU）

- 手写 `shouldComponentUpdate` 精细控制
- 三个按钮：
  - 修改 id（会渲染）：state.id 变化触发更新
  - 仅修改 renderCount（会渲染）：state.renderCount 变化触发更新
  - setState 相同值（不渲染）：值未变，SCU 返回 false 跳过

### 4. 优化原理说明

- shouldComponentUpdate 工作流程图
- PureComponent vs Component 对比
- React.memo 等价写法

## 渲染次数对比

| 父组件操作      | UnoptimizedList | OptimizedList |
| --------------- | ---------------- | ------------- |
| 父组件 tick +1  | 渲染 +1          | 不渲染        |
| 父组件输入文字  | 渲染 +1          | 不渲染        |
| 修改 items      | 渲染 +1          | 渲染 +1       |

## React 性能优化完整生命周期图

```
组件更新流程：
┌─────────────────────────────────────────────────────────────┐
│  父组件 re-render                                            │
│      │                                                       │
│      ▼                                                       │
│  子组件接收到新 props                                         │
│      │                                                       │
│      ▼                                                       │
│  static getDerivedStateFromProps                            │
│      │                                                       │
│      ▼                                                       │
│  shouldComponentUpdate ──── 返回 false ──→ 跳过渲染          │
│      │                                                       │
│      │ 返回 true                                             │
│      ▼                                                       │
│  render                                                      │
│      │                                                       │
│      ▼                                                       │
│  getSnapshotBeforeUpdate                                    │
│      │                                                       │
│      ▼                                                       │
│  React DOM 更新                                              │
│      │                                                       │
│      ▼                                                       │
│  componentDidUpdate                                         │
└─────────────────────────────────────────────────────────────┘
```

## 函数组件的等价优化

| Class 组件                      | 函数组件等价                              |
| ------------------------------- | ----------------------------------------- |
| shouldComponentUpdate           | React.memo 第二个参数                     |
| PureComponent                   | React.memo                                |
| componentDidUpdate              | useEffect                                 |
| componentDidMount               | useEffect(() => {}, [])                   |
| componentWillUnmount            | useEffect return () => {}                 |

## 目录结构

```
043. React 的性能优化/
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
        ├── UnoptimizedList.tsx
        ├── OptimizedList.tsx
        └── ShouldComponentUpdateDemo.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Vite 5.3+
