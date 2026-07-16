# 优化网络请求和资源加载

## 简介

前端性能优化的关键环节之一是**网络请求和资源加载**。在 modern Web 应用中，页面加载时间和交互流畅度很大程度上取决于网络请求的效率和资源加载策略。本项目通过 5 个独立的子项目，演示了前端开发中常用的网络请求和资源加载优化方法。

每个子项目都可以独立运行，包含完整的源代码和类型声明，无需安装 `node_modules` 即可通过 `tsc --noEmit` 类型检查。

## 方法总览

| 序号 | 目录 | 优化点 | 作用 |
|------|------|--------|------|
| 01 | `01-lazy-loading` | 资源懒加载 | 使用 IntersectionObserver 和 React.lazy 延迟加载图片和组件，减少首屏请求量 |
| 02 | `02-request-cancellation` | 请求取消 | 使用 AbortController 取消未完成的请求，避免竞态条件和资源浪费 |
| 03 | `03-request-batching` | 请求合并与并发限制 | 使用 Promise.all 批量请求，并发池限制最大并发数 |
| 04 | `04-debounce-throttle` | 防抖节流优化 | 防抖延迟搜索请求，节流限制滚动/resize 事件频率 |
| 05 | `05-service-worker` | Service Worker 缓存 | SW 拦截请求，Cache First / Network First 等缓存策略 |

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
| 01-lazy-loading | 5220 |
| 02-request-cancellation | 5221 |
| 03-request-batching | 5222 |
| 04-debounce-throttle | 5223 |
| 05-service-worker | 5224 |

## 各方法详解

### 01. 资源懒加载（Lazy Loading）

**原理：** 只在资源进入视口或被需要时才加载，减少初始页面加载的请求数和数据量。

**两种方式：**

1. **图片懒加载** - 使用 `IntersectionObserver` API 检测元素是否进入视口

```typescript
// src/hooks/useLazyLoad.ts
export function useLazyLoad<T extends HTMLElement>(options?: UseLazyLoadOptions) {
  const targetRef = useRef<T>()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect() // 只触发一次
          }
        })
      },
      { rootMargin: '100px' } // 提前 100px 预加载
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { targetRef, isVisible }
}
```

2. **组件懒加载** - 使用 `React.lazy` + `Suspense` 按需加载组件代码

```typescript
// src/App.tsx
import { Suspense, lazy } from 'react'

// 只有渲染时才会动态 import 对应的 chunk
const LazyComponent = lazy(() => import('./components/LazyComponent'))

function App() {
  return (
    <Suspense fallback={<div>正在加载组件...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
```

**优化效果：**
- 减少首屏网络请求数量
- 减小初始 JavaScript 包体积
- 提升首屏加载速度（FCP / LCP）

---

### 02. 请求取消（Request Cancellation）

**原理：** 使用 `AbortController` 取消不再需要的进行中请求，避免竞态条件和资源浪费。

**核心场景：**

1. **组件卸载时取消请求** - 防止卸载后更新状态导致内存泄漏

```typescript
// src/hooks/useFetch.ts
useEffect(() => {
  const controller = new AbortController()

  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => {
      if (!controller.signal.aborted) {
        setData(data)
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err)
    })

  // 组件卸载时自动取消
  return () => controller.abort()
}, [url])
```

2. **新请求取消旧请求** - 搜索框快速输入时取消上一个未完成请求

```typescript
// src/hooks/useDebouncedFetch.ts
useEffect(() => {
  // 取消上一个进行中的请求
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }

  const controller = new AbortController()
  abortControllerRef.current = controller

  const timer = setTimeout(() => {
    fetch(searchUrl, { signal: controller.signal })
      .then(...)
  }, delay)

  return () => {
    clearTimeout(timer)
    controller.abort()
  }
}, [query, delay])
```

**优化效果：**
- 避免竞态条件（旧请求响应覆盖新请求结果）
- 减少不必要的网络流量
- 防止组件卸载后的状态更新

---

### 03. 请求合并与并发限制（Request Batching & Concurrency Limit）

**原理：** 将多个请求合并批量发送，或限制并发数量，在速度和服务器压力之间取得平衡。

**三种策略对比：**

```typescript
// 1. 顺序请求 - 总时间 = 所有请求时间之和
for (const id of ids) {
  const user = await fetchUser(id)
  users.push(user)
}

// 2. 批量请求 - Promise.all 同时发起，最快但可能超并发限制
const users = await Promise.all(ids.map((id) => fetchUser(id)))

// 3. 并发限制 - 限制最大并发数，兼顾速度和稳定性
const users = await asyncPoolSimple(3, ids, (id) => fetchUser(id))
```

**并发池实现：**

```typescript
// src/utils/concurrency.ts
export async function asyncPoolSimple<T, R>(
  limit: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  const executing: Set<Promise<void>> = new Set()

  for (let i = 0; i < items.length; i++) {
    const promise = iteratorFn(items[i], i).then((result) => {
      results[i] = result
    })
    executing.add(promise)
    promise.finally(() => executing.delete(promise))

    // 达到并发上限时，等待任意一个完成
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}
```

**优化效果：**
- 批量请求：总耗时从 N * avg 降为 max(single)
- 并发限制：避免浏览器连接数耗尽（Chrome 同域最多 6 个并发）
- 适合大量数据请求场景（如批量获取用户信息）

---

### 04. 防抖节流优化（Debounce & Throttle）

**原理：** 控制高频事件的触发频率，减少不必要的网络请求和计算。

**防抖（Debounce）：** 事件停止触发 N 毫秒后才执行

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timer) // 每次 value 变化都清除上一个定时器
  }, [value, delay])

  return debouncedValue
}

// 使用：搜索输入框
const [input, setInput] = useState('')
const debouncedInput = useDebounce(input, 500)
useEffect(() => {
  if (debouncedInput) searchAPI(debouncedInput)
}, [debouncedInput])
```

**节流（Throttle）：** 每 N 毫秒最多执行一次

```typescript
// src/hooks/useThrottle.ts
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  limit: number = 200
): T {
  const lastExecutedRef = useRef(0)

  return useCallback((...args: any[]) => {
    const now = Date.now()
    const elapsed = now - lastExecutedRef.current

    if (elapsed >= limit) {
      lastExecutedRef.current = now
      callback(...args)
    }
  }, [limit]) as T
}

// 使用：滚动事件
const handleScroll = useThrottledCallback((scrollTop: number) => {
  updatePosition(scrollTop)
}, 200)
```

**对比：**

| 特性 | 防抖 (Debounce) | 节流 (Throttle) |
|------|-----------------|-----------------|
| 触发时机 | 停止输入后 | 每隔固定间隔 |
| 适用场景 | 搜索输入、表单验证 | 滚动、resize、鼠标移动 |
| 请求次数 | 1 次（最后一次） | N 次（按间隔） |
| 响应速度 | 延迟响应 | 周期性响应 |

---

### 05. Service Worker 缓存

**原理：** Service Worker 运行在浏览器后台，可以拦截网络请求并从缓存返回响应，实现离线访问和加载加速。

**三种缓存策略：**

```typescript
// src/utils/cache-strategy.ts

// 1. Cache First - 优先缓存，适合静态资源
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached           // 缓存命中，直接返回
  const response = await fetch(request)
  cache.put(request, response.clone()) // 更新缓存
  return response
}

// 2. Network First - 优先网络，适合 API 请求
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached          // 网络失败，回退缓存
    throw new Error('离线且无缓存')
  }
}

// 3. Stale While Revalidate - 先返回缓存后更新
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone())
    return response
  })
  return cached || fetchPromise        // 有缓存先返回，后台同时更新
}
```

**Service Worker 注册：**

```typescript
// src/utils/sw-register.ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => console.log('SW registered:', reg.scope))
    .catch((err) => console.log('SW failed:', err))
}
```

**优化效果：**
- 离线访问：无网络时仍可使用已缓存资源
- 加载加速：静态资源从缓存秒加载
- 节省流量：减少重复资源请求
- PWA 基础：Service Worker 是 PWA 的核心技术

> **注意：** 本项目无构建产物，SW 功能为模拟演示。真实项目推荐使用 `vite-plugin-pwa` 插件自动生成 SW 文件。

## 目录结构

```
014. 优化网络请求和资源加载/
├── README.md
├── 01-lazy-loading/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── hooks/
│       │   └── useLazyLoad.ts
│       └── components/
│           ├── LazyImage.tsx
│           └── LazyComponent.tsx
├── 02-request-cancellation/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── hooks/
│       │   ├── useFetch.ts
│       │   └── useDebouncedFetch.ts
│       └── components/
│           └── SearchBox.tsx
├── 03-request-batching/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── utils/
│       │   ├── concurrency.ts
│       │   └── api.ts
│       └── components/
│           └── DataGrid.tsx
├── 04-debounce-throttle/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.tsx
│       ├── App.tsx
│       ├── hooks/
│       │   ├── useDebounce.ts
│       │   └── useThrottle.ts
│       └── components/
│           ├── SearchDemo.tsx
│           └── ScrollDemo.tsx
└── 05-service-worker/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── env.d.ts
        ├── main.tsx
        ├── App.tsx
        ├── utils/
        │   ├── sw-register.ts
        │   └── cache-strategy.ts
        └── components/
            └── CacheStatus.tsx
```

## 启动方式

### 类型检查（无需安装依赖）

```bash
# 在任意子项目目录下执行
cd 01-lazy-loading
tsc --noEmit
```

### 开发模式运行

```bash
# 1. 进入子项目目录
cd 01-lazy-loading

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 浏览器访问
# http://localhost:5220 (01-lazy-loading)
# http://localhost:5221 (02-request-cancellation)
# http://localhost:5222 (03-request-batching)
# http://localhost:5223 (04-debounce-throttle)
# http://localhost:5224 (05-service-worker)
```

### 构建生产版本

```bash
cd 01-lazy-loading
npm run build
npm run preview
```

## 方法分类

| 分类 | 方法 | 解决的问题 | 适用场景 |
|------|------|-----------|----------|
| 资源加载优化 | 懒加载 | 首屏请求过多 | 图片列表、重型组件 |
| 请求生命周期 | 请求取消 | 竞态条件、资源浪费 | 搜索框、页面切换 |
| 请求效率 | 批量请求 | 请求过多、总耗时长 | 列表数据、批量操作 |
| 请求效率 | 并发限制 | 浏览器并发上限 | 大量请求、数据同步 |
| 事件频率控制 | 防抖 | 高频输入触发过多 | 搜索输入、表单验证 |
| 事件频率控制 | 节流 | 高频事件执行过多 | 滚动、resize、拖拽 |
| 离线缓存 | Service Worker | 重复请求、离线不可用 | PWA、静态资源缓存 |
| 离线缓存 | Cache First | 静态资源加载慢 | JS/CSS/图片/字体 |
| 离线缓存 | Network First | 数据不够新 | API 请求、动态内容 |
| 离线缓存 | SWR | 需要快速+更新 | 非关键动态资源 |
