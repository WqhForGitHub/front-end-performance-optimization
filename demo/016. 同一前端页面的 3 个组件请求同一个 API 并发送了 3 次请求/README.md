# 同一前端页面的 3 个组件请求同一个 API 并发送了 3 次请求，如何优化？

## 简介

在实际项目中，经常会遇到这样一个问题：**同一个页面的多个组件各自独立请求了同一个接口**，导致同一个请求被重复发送了 3 次（甚至更多）。这不仅浪费网络带宽、增加服务器压力，还可能引发数据不一致、loading 闪烁等问题。

本项目通过 3 个独立的子项目，演示了 3 种主流的优化方案，**最终都将“3 次请求”收敛为“1 次请求”**。

每个子项目都可以独立运行，包含完整的源代码和类型声明，无需安装 `node_modules` 即可通过 `tsc --noEmit` 类型检查。

## 问题场景

```
页面挂载时：
┌─────────────────────────────────────────┐
│  组件 A (UserProfile)   → fetchUser()  → 请求 1
│  组件 B (UserStats)     → fetchUser()  → 请求 2   ← 重复！
│  组件 C (UserActivity)  → fetchUser()  → 请求 3   ← 重复！
└─────────────────────────────────────────┘
```

3 个组件都需要同一份用户数据，却各自发起了请求。

## 方法总览

| 序号 | 目录 | 方案 | 核心思想 | 适用场景 |
|------|------|------|----------|----------|
| 01 | `01-request-promise-sharing` | Promise 共享 / 请求去重 | 缓存进行中的 Promise，相同 key 复用同一个 Promise | 组件各自独立请求、无法改动组件层级 |
| 02 | `02-context-state-lifting` | Context 状态提升 | 请求提升到 Provider 顶层只发 1 次，子组件通过 Context 共享 | 数据可由共同父级统一管理 |
| 03 | `03-swrv-data-cache` | SWR 数据缓存 | 模块级全局缓存 + in-flight 去重，stale-while-revalidate | 需要缓存复用、跨页面/跨组件共享 |

## 通用约定

### 技术栈

- **React 18** + **TypeScript 5** + **Vite 5**
- 不使用 CSS 文件，所有样式采用内联 `style` 方式
- 每个子项目独立配置，端口互不冲突

### 类型声明（env.d.ts）

每个子项目的 `src/env.d.ts` 包含本地类型声明，覆盖 `react`、`react-dom`、`vite` 等模块。**无需安装 `node_modules`** 即可通过 `tsc --noEmit` 类型检查。

安装依赖后，该文件依然有效（不会产生冲突）。如需使用第三方库的完整精确类型，可在安装依赖后删除该文件。

### 端口分配

| 子项目 | 端口 |
|--------|------|
| 01-request-promise-sharing | 5228 |
| 02-context-state-lifting | 5229 |
| 03-swrv-data-cache | 5230 |

### 模拟 API

3 个子项目都用同一个模拟接口 `fetchUser()`，内部带 800ms 延迟，并维护一个**全局请求计数器** `requestCount`。页面顶部实时显示真实发起的请求数，可直观对比“优化前 3 次 / 优化后 1 次”。

---

## 各方法详解

### 01. Promise 共享 / 请求去重（Request Promise Sharing）

**原理：** 用一个 `Map` 按 key 缓存“进行中（in-flight）的 Promise”。

- 第一个调用方执行真正的请求函数 `requestFn`，并把返回的 Promise 存入缓存；
- 后续相同 key 的调用直接复用同一个 Promise，**不再执行 `requestFn`**，因此不会发起额外网络请求；
- Promise 完成后（无论成功 / 失败）从缓存中移除，下一次调用会重新发起。

```typescript
// src/utils/requestPromise.ts
const inflightCache = new Map<string, Promise<unknown>>()

export function createRequestPromise<T>(
  key: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  // 1. 缓存命中：已有进行中的 Promise，直接复用
  const existing = inflightCache.get(key)
  if (existing) {
    return existing as Promise<T>
  }

  // 2. 缓存未命中：执行 requestFn 发起真实请求，并缓存 Promise
  const promise = requestFn().finally(() => {
    // 3. 请求结束后移除缓存：下次调用会重新发起请求
    inflightCache.delete(key)
  })

  inflightCache.set(key, promise)
  return promise
}
```

每个组件通过 `useSharedRequest` Hook 调用：

```typescript
// src/hooks/useSharedRequest.ts
export function useSharedRequest<T>(key: string, requestFn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // 关键：通过 createRequestPromise 复用进行中的 Promise
    createRequestPromise<T>(key, requestFn).then((result) => {
      if (!cancelled) { setData(result); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [key])

  return { data, loading }
}
```

**特点：**
- 改造成本低，组件仍各自独立请求，只需把 `requestFn()` 换成 `createRequestPromise(key, requestFn)`；
- 只去重“同时进行中”的请求，不缓存已完成的结果，因此每次重新挂载仍会重新请求；
- 不需要改动组件层级结构。

**优化效果：** 3 次请求 → 1 次请求。

---

### 02. Context 状态提升（Lifting State Up via Context）

**原理：** 把“请求 + 数据状态”提升到共同的 `DataProvider` 顶层，在 Provider 内部只发起一次请求，再通过 Context 向下分发给所有子组件。

```typescript
// src/context/DataContext.tsx
const DataContext = createContext<DataContextValue | undefined>(undefined)

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<UserData | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // 请求只在 Provider 这一层发起一次
    fetchUser().then((result) => {
      if (!cancelled) { setData(result); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  return <DataContext.Provider value={{ data, loading, error, refresh }}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (ctx === undefined) throw new Error('useData 必须在 <DataProvider> 内部使用')
  return ctx
}
```

子组件只需 `useContext` 读取，自身不发请求：

```typescript
// src/components/UserProfile.tsx
export default function UserProfile() {
  const { data, loading, error } = useData() // 直接读取共享数据
  return <div>...</div>
}
```

**特点：**
- 数据来源单一，天然去重，无重复请求；
- 集中处理 loading / error / refresh，子组件逻辑更简单；
- 需要合理规划 Provider 的层级（放在 3 个组件的共同祖先上）。

**优化效果：** 3 次请求 → 1 次请求。

---

### 03. SWR 数据缓存（Stale-While-Revalidate）

**原理：** 用模块级全局 `cache` 按 key 缓存数据 + in-flight Promise，实现：

1. **in-flight 去重**：相同 key 的并发调用复用同一个 Promise，首屏只发 1 次请求；
2. **stale-while-revalidate**：已有缓存时先立即返回旧数据（stale），同时后台发起新请求（revalidate），拿到新数据后静默更新，界面不会闪空；
3. **dedupingInterval**：在去重时间窗口内的重复调用直接复用 Promise，避免短时间重复请求。

```typescript
// src/hooks/useSWR.ts
const cache = new Map<string, CacheEntry<any>>()
const listeners = new Map<string, Set<() => void>>()

export function useSWR<T>(key: string, fetcher: () => Promise<T>, options?: SWROptions) {
  const [, setVersion] = useState(0)

  useEffect(() => {
    let entry = cache.get(key)
    const now = Date.now()

    // 需要重新验证：无缓存，或缓存过期且无 in-flight Promise
    const needsRevalidate =
      !entry || (!entry.promise && now - entry.timestamp > dedupingInterval)

    if (needsRevalidate && entry && !entry.promise) {
      // 关键：复用 in-flight Promise，相同 key 并发只发 1 次请求
      const promise = fetcher().then((data) => {
        entry.data = data
        entry.promise = undefined
        entry.timestamp = Date.now()
        emit(key) // 通知所有订阅者重新渲染
      })
      entry.promise = promise
      entry.isValidating = true
    }
  }, [key])

  const entry = cache.get(key)
  return {
    data: entry?.data,         // 有缓存立即返回旧数据（stale）
    loading: !entry?.data && !entry?.error,
    isValidating: !!entry?.isValidating, // 后台正在重新验证
  }
}
```

**特点：**
- 既能去重并发请求，又能缓存复用（跨组件、跨页面共享）；
- stale-while-revalidate 让界面“先有数据、后台更新”，体验更流畅；
- 思路与 [SWR](https://swr.vercel.app/) / [React Query](https://tanstack.com/query) 等库一致，本项目用最小实现演示原理。

**优化效果：** 3 次请求 → 1 次请求；后续命中缓存时 0 次请求（仅后台静默刷新）。

---

## 三种方案对比

| 维度 | 01 Promise 共享 | 02 Context 提升 | 03 SWR 缓存 |
|------|----------------|-----------------|-------------|
| 去重范围 | 同时进行的请求 | Provider 子树 | 全局（模块级缓存） |
| 是否缓存结果 | 否（完成即清除） | 是（保存在 state） | 是（保存在全局 cache） |
| 改造成本 | 低（替换请求函数） | 中（需加 Provider） | 中（接入 Hook） |
| 跨页面共享 | 否 | 否 | 是 |
| 后台刷新 | 否 | 需手动 refresh | 内置 revalidate |
| 第三方库 | 无 | 无 | SWR / React Query |
| 适用场景 | 组件无法改层级 | 数据由父级统一管理 | 需要缓存复用、跨组件共享 |

## 目录结构

```
016. 同一前端页面的 3 个组件请求同一个 API 并发送了 3 次请求/
├── README.md
├── 01-request-promise-sharing/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── mockApi.ts
│       ├── utils/
│       │   └── requestPromise.ts
│       ├── hooks/
│       │   └── useSharedRequest.ts
│       └── components/
│           ├── UserProfile.tsx
│           ├── UserStats.tsx
│           └── UserActivity.tsx
├── 02-context-state-lifting/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── mockApi.ts
│       ├── context/
│       │   └── DataContext.tsx
│       └── components/
│           ├── UserProfile.tsx
│           ├── UserStats.tsx
│           └── UserActivity.tsx
└── 03-swrv-data-cache/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   └── mockApi.ts
        ├── hooks/
        │   └── useSWR.ts
        └── components/
            ├── UserProfile.tsx
            ├── UserStats.tsx
            └── UserActivity.tsx
```

## 启动方式

### 类型检查（无需安装依赖）

```bash
# 在任意子项目目录下执行
cd 01-request-promise-sharing
tsc --noEmit
```

### 开发模式运行

```bash
# 1. 进入子项目目录
cd 01-request-promise-sharing

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器访问
# http://localhost:5228 (01-request-promise-sharing)
# http://localhost:5229 (02-context-state-lifting)
# http://localhost:5230 (03-swrv-data-cache)
```

### 构建生产版本

```bash
cd 01-request-promise-sharing
npm run build
npm run preview
```

## 选型建议

- **如果组件层级无法调整、只是想快速消除重复请求** → 选 **01 Promise 共享**，改动最小；
- **如果数据天然属于某个父级、希望集中管理** → 选 **02 Context 提升**，结构清晰；
- **如果需要缓存复用、跨页面共享、自动后台刷新** → 选 **03 SWR 缓存**，或直接使用 SWR / React Query 等成熟库。
