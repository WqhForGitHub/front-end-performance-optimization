# 解决在 React 的 pureComponent 下引用类型修改值时页面不渲染的问题

本项目通过 **React + TS + Vite** 演示 PureComponent 下引用类型修改值不渲染的问题及解决方案。

## 问题分析

### 现象

在 PureComponent 中，直接修改 state 中的引用类型（对象/数组）的内部值，页面不会更新渲染。

### 根因

PureComponent 通过 **浅比较（shallowEqual）** 判断是否需要更新：
- 浅比较只比较第一层引用
- 对引用类型只比较引用地址，不比较内部值
- 直接修改引用类型内部值，引用地址不变
- 浅比较认为相等，返回 true（跳过渲染）

```js
// shallowEqual 浅比较原理
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false
  return prevKeys.every((key) => prev[key] === next[key])
  // 对象的 prev.user === next.user 只比较引用，不比较内容
}
```

### 问题代码

```jsx
class MyComponent extends React.PureComponent {
  state = { user: { name: 'Alice', age: 28 } }

  handleClick = () => {
    // ❌ 直接修改引用类型，引用未变
    this.state.user.name = 'Bob'
    this.setState({ user: this.state.user }) // 浅比较认为相等，跳过渲染
  }
}
```

## 解决方案

### 1. 展开运算符（Spread Operator）

```jsx
this.setState((state) => ({
  user: { ...state.user, name: 'Bob' } // 新对象，引用变化
}))
```

### 2. Object.assign

```jsx
this.setState((state) => ({
  user: Object.assign({}, state.user, { name: 'Bob' }) // 新对象
}))
```

### 3. 数组的不可变更新

```jsx
// 添加
const newArr = [...arr, newItem] // 或 arr.concat(newItem)

// 修改
const newArr = arr.map((item, i) =>
  i === 0 ? { ...item, active: !item.active } : item
)

// 删除
const newArr = arr.filter((_, i) => i !== index)

// 排序（slice 先复制再排序，避免修改原数组）
const newArr = arr.slice().sort((a, b) => a - b)
```

### 4. immer（推荐）

```jsx
import produce from 'immer'

this.setState(
  produce((state) => {
    state.user.name = 'Bob' // 看似直接修改，实际产生新对象
  })
)
```

### 5. immutable.js

```jsx
import { Map } from 'immutable'

const user = Map({ name: 'Alice', age: 28 })
const newUser = user.set('name', 'Bob') // 返回新 Map
```

## 快速开始

```bash
cd "demo/045. 解决在 React 的 pureComponent 下引用类型修改值时页面不渲染的问题"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 演示内容

### 1. BadPureComponent（反例）

- 直接修改 `this.state.user.name = 'xxx'`
- setState 传入同一引用
- 页面不更新（但 React DevTools 中可看到 state 已变）
- 提供 forceUpdate 演示（不推荐）

### 2. GoodPureComponent（正例）

- 使用展开运算符 `{ ...state.user, name: 'xxx' }`
- 使用 Object.assign
- 每次创建新对象，引用变化
- PureComponent 检测到引用变化，触发渲染

### 3. ImmutableUpdate（数组不可变更新）

- 直接 push（不渲染）
- 展开运算符 [...arr, newItem]（触发渲染）
- concat 添加（触发渲染）
- map 修改某项（触发渲染）
- filter 删除（触发渲染）

### 4. 问题原因与解决方案说明

- shallowEqual 浅比较原理伪代码
- 问题代码 vs 正确代码对比
- 5 种解决方案列表

## 渲染次数对比

| 操作              | BadPureComponent | GoodPureComponent | ImmutableUpdate |
| ----------------- | ---------------- | ----------------- | --------------- |
| 直接修改          | 不渲染           | -                 | 不渲染          |
| 展开运算符        | -                | 渲染 +1           | 渲染 +1         |
| Object.assign     | -                | 渲染 +1           | -               |
| concat            | -                | -                 | 渲染 +1         |
| map 修改          | -                | -                 | 渲染 +1         |
| filter 删除       | -                | -                 | 渲染 +1         |
| forceUpdate       | 渲染 +1（不推荐）| -                 | -               |

## 完整不可变更新方案

### 对象更新

```jsx
// 修改属性
{ ...obj, key: newValue }

// 嵌套对象
{ ...obj, nested: { ...obj.nested, key: newValue } }

// 删除属性
const { key, ...rest } = obj
// rest 即为删除 key 后的对象
```

### 数组更新

```jsx
// 添加到末尾
[...arr, newItem]
arr.concat(newItem)

// 添加到开头
[newItem, ...arr]

// 修改某项
arr.map((item, i) => (i === index ? newItem : item))

// 删除某项
arr.filter((_, i) => i !== index)
[...arr.slice(0, index), ...arr.slice(index + 1)]

// 排序
[...arr].sort(compareFn)

// 反转
[...arr].reverse()
```

### 深层嵌套（推荐 immer）

```jsx
// 原生写法（繁琐）
this.setState((state) => ({
  data: {
    ...state.data,
    users: {
      ...state.data.users,
      [id]: {
        ...state.data.users[id],
        name: 'Bob',
      },
    },
  },
}))

// immer 写法（简洁）
import produce from 'immer'
this.setState(
  produce((state) => {
    state.data.users[id].name = 'Bob' // 看似直接修改
  })
)
```

## 目录结构

```
045. 解决在 React 的 pureComponent 下引用类型修改值时页面不渲染的问题/
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
        ├── BadPureComponent.tsx
        ├── GoodPureComponent.tsx
        └── ImmutableUpdate.tsx
```

## 技术栈

- React 18.3+
- TypeScript 5.5+
- Vite 5.3+
