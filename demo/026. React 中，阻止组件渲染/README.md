# React 中，阻止组件渲染

> 演示 React + Vite + TypeScript 环境下三种阻止组件渲染的方案，以及它们的适用场景、对比与注意事项。

## 为什么要阻止组件渲染？

在 React 中，"阻止渲染"指的是组件本身存在、被引用，但在某些条件下不向 DOM 输出任何内容（或不出错、不渲染失败态）。常见的动机包括：

- **权限/状态门控**：未登录、无权限时不应显示敏感 UI。
- **空状态优化**：列表为空时不必渲染列表骨架，避免无意义的 DOM 节点。
- **条件展示**：弹窗、抽屉、Toast 默认隐藏，避免占用布局。
- **错误隔离**：子组件抛错时不要让整棵树白屏，渲染一个降级 UI 而非崩溃页。
- **避免无意义更新**：通过 `PureComponent`/`memo`/`shouldComponentUpdate` 在 props 未变时跳过渲染（本 demo 不展开此性能场景，聚焦"是否输出 DOM"）。

阻止渲染与"性能优化中的跳过渲染（skip re-render）"是两个不同的概念：

| 维度 | 阻止渲染                                 | 跳过重渲染                       |
| ---- | ---------------------------------------- | -------------------------------- |
| 目的 | 不输出任何/部分 DOM                      | 性能优化，避免无意义计算         |
| 触发 | 业务条件（数据、权限、状态）             | props/state 引用相等             |
| 机制 | `return null` / 条件渲染 / ErrorBoundary | `memo` / `shouldComponentUpdate` |
| 结果 | DOM 中无该节点                           | DOM 保持上一次结果               |

本 demo 聚焦"阻止渲染"。

## 三种方案对比

| 方案                 | 适用场景                         | 实现方式                                                    | 是否产生 DOM   |
| -------------------- | -------------------------------- | ----------------------------------------------------------- | -------------- |
| **01 return null**   | 组件本身决定不渲染               | 组件函数体 `return null`                                    | 否             |
| **02 条件渲染**      | 父组件根据条件决定是否挂载子组件 | `&&` / 三目 / IIFE / switch / enum map                      | 否（不挂载时） |
| **03 ErrorBoundary** | 子组件抛错时阻止崩溃渲染         | class 组件 `getDerivedStateFromError` + `componentDidCatch` | 渲染 fallback  |

> 三者并不互斥：ErrorBoundary 内部可以使用 `return null` 的子组件；条件渲染的分支里也可以包一层 ErrorBoundary。

## 目录结构

```
026. React 中，阻止组件渲染/
├── README.md
├── 01-return-null/             # 组件内部 return null 阻止渲染 (端口 5255)
├── 02-conditional-rendering/   # 父组件条件渲染模式 (端口 5256)
└── 03-error-boundary/          # 错误边界阻止崩溃渲染 (端口 5257)
```

## 运行方式

每个子目录都是独立项目，进入对应目录后执行：

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建产物
npm run preview      # 预览构建产物
npm run type-check   # 类型检查
```

各 demo 端口：

- 01-return-null: http://localhost:5255
- 02-conditional-rendering: http://localhost:5256
- 03-error-boundary: http://localhost:5257

## 关键学习点

### 01 return null

- 在组件函数体中根据条件 `return null`，React 不会为该组件渲染任何 DOM 节点。
- `return null` 与 `return undefined` 在 React 中行为一致（都不输出 DOM），但 `null` 语义更清晰。
- `return null` 仍然会触发组件函数的执行和 hooks 调用，**不能**用它跳过 hooks 计算。
- 适合"组件自己最清楚该不该出现"的场景：隐藏的 Modal、空列表项、权限受控组件。

### 02 条件渲染

- `&&` 短路：`{cond && <Comp/>}`，注意左侧为 `0`/`''`/`false` 时的渲染陷阱（如 `count && <Comp/>` 当 count 为 0 时会渲染出 `0`）。
- 三目运算符：`{cond ? <A/> : <B/>}`，适合二选一。
- IIFE：`{(() => { switch(...) { ... } })()}`，适合复杂分支但要小心可读性。
- switch / enum map：状态多分支时比多层三目更清晰，enum map 还能把"状态 -> UI"抽成数据。
- 与 `return null` 的区别：条件渲染由父组件决定；`return null` 由组件自己决定。

### 03 ErrorBoundary

- React 类组件实现 `static getDerivedStateFromError(error)` 和 `componentDidCatch(error, info)` 即成为错误边界。
- 错误边界**只能捕获子树**渲染期间抛出的同步错误，不能捕获事件回调、setTimeout、异步错误。
- `getDerivedStateFromError`：渲染阶段调用，返回新 state（用于切换到 fallback UI）。
- `componentDidCatch`：提交阶段调用，可上报日志，不能再 setState 触发重渲染。
- 错误边界阻止的是"整个应用白屏崩溃"，转而渲染一个降级 UI，属于"阻止崩溃渲染"。
- 生产环境必须配合错误上报（Sentry、自建日志）。

## 注意事项

- **`return null` 不是性能银弹**：组件函数和其中的 hooks 仍会执行。要真正跳过计算需配合 `memo` / `useMemo` / 早返回。
- **`&&` 的 falsy 陷阱**：`{count && <List/>}` 当 `count === 0` 时会渲染出字符 `0`，应改为 `{count > 0 && <List/>}` 或 `{Boolean(count) && <List/>}`。
- **ErrorBoundary 不能拦截事件回调错误**：onClick 里的 throw 不会被捕获，需 try/catch 自行处理。
- **ErrorBoundary 不能拦截异步错误**：Promise rejection、setTimeout 回调中的错误也不会冒泡到 ErrorBoundary。
- **不要在条件渲染中破坏 hooks 规则**：把 `if (cond) return null` 写在所有 hooks 之后，否则会破坏 hooks 调用顺序。
- **服务端渲染时 `return null` 也不会输出任何 HTML**，可作为 SSR 中隐藏组件的标准做法。
