# 在浏览器中执行 100 万个任务，并保证页面不卡顿

## 问题本质

JavaScript 是单线程的，100 万个计算任务如果同步执行，主线程会被完全阻塞数秒，期间页面无法响应用户交互、动画停顿、甚至浏览器假死。

关键矛盾：**大量计算任务**与**保持主线程响应**之间的冲突。

## 四种方法核心原理对比

### 方法一：直接执行（baseline）

同步 `for` 循环执行 100 万个任务，主线程完全阻塞。页面卡死直到所有任务执行完毕，仅用于对比感受。

### 方法二：setTimeout 分片

核心原理：**把大任务拆成小块，每块之间让出主线程**。

1. 将 100 万个任务分成每批 5000 个
2. 每批用 `for` 循环同步执行
3. 每批之间用 `setTimeout(fn, 0)` 让出主线程
4. 浏览器有机会处理 UI 事件、渲染动画后，继续下一批

优点：实现简单，页面保持响应
缺点：`setTimeout(fn, 0)` 实际延迟约 4ms（浏览器最小延迟），累积起来有一定开销

### 方法三：requestIdleCallback

核心原理：**利用浏览器空闲时间执行**。

1. 注册 `requestIdleCallback` 回调
2. 浏览器在每帧的空闲时间调用回调
3. 通过 `deadline.timeRemaining()` 判断剩余空闲时间
4. 空闲时间用完就交还控制权，下一帧空闲时继续

优点：不与高优先级任务（动画、交互）争抢 CPU
缺点：执行速度取决于浏览器空闲程度，可能较慢；浏览器兼容性不如 setTimeout

### 方法四：Web Worker（推荐）

核心原理：**在独立线程中执行**。

1. 创建 Web Worker（独立线程）
2. 主线程通过 `postMessage` 发送任务参数
3. Worker 线程执行计算，通过 `postMessage` 回传进度和结果
4. 主线程接收消息更新 UI，完全不受影响

优点：

- 真正的并行执行，不阻塞主线程
- 可利用多核 CPU
- 主线程 60fps 流畅运行

缺点：

- Worker 中不能操作 DOM
- 通信有序列化开销（`postMessage`）
- 需要额外创建线程

## 方法选型建议

| 场景                      | 推荐方法                | 理由                   |
| ------------------------- | ----------------------- | ---------------------- |
| 纯计算任务（无 DOM 操作） | **Web Worker**          | 真正并行，主线程零阻塞 |
| 需要操作 DOM 的分批任务   | **setTimeout 分片**     | 实现简单，兼顾响应     |
| 低优先级后台任务          | **requestIdleCallback** | 不影响动画和交互       |
| 少量任务（<1万）          | **直接执行**            | 开销可忽略，无需优化   |

## 目录结构

```
004. 执行 100 万个任务/
├── react-ts-vite/               # React + TS + Vite (端口 5200)
│   └── src/
│       ├── components/
│       │   ├── DirectTask.tsx       # 方法一: 直接同步执行
│       │   ├── SetTimeoutTask.tsx   # 方法二: setTimeout 分片
│       │   ├── IdleCallbackTask.tsx # 方法三: requestIdleCallback
│       │   ├── WorkerTask.tsx       # 方法四: Web Worker
│       │   └── worker.ts            # Worker 脚本
│       ├── utils/task.ts            # 任务函数和工具
│       ├── App.tsx
│       └── main.tsx
├── vue2/                         # Vue2 (端口 5201)
│   └── src/
│       ├── components/
│       │   ├── DirectTask.vue       # 方法一: 直接同步执行
│       │   ├── SetTimeoutTask.vue   # 方法二: setTimeout 分片
│       │   ├── IdleCallbackTask.vue # 方法三: requestIdleCallback
│       │   └── WorkerTask.vue       # 方法四: Web Worker (Blob URL)
│       ├── utils/task.js
│       ├── App.vue
│       └── main.js
└── vue3-ts-vite/                 # Vue3 + TS + Vite (端口 5202)
    └── src/
        ├── components/
        │   ├── DirectTask.vue       # 方法一: 直接同步执行
        │   ├── SetTimeoutTask.vue   # 方法二: setTimeout 分片
        │   ├── IdleCallbackTask.vue # 方法三: requestIdleCallback
        │   ├── WorkerTask.vue       # 方法四: Web Worker
        │   └── worker.ts            # Worker 脚本
        ├── utils/task.ts
        ├── App.vue
        └── main.ts
```

## 启动方式

```bash
# React
cd "004. 执行 100 万个任务/react-ts-vite" && npm run dev

# Vue2
cd "004. 执行 100 万个任务/vue2" && npm run dev

# Vue3
cd "004. 执行 100 万个任务/vue3-ts-vite" && npm run dev
```

每个项目都实现了 4 种方法，可通过 Tab 切换对比。建议先切到「方法一：直接执行」感受页面卡死，再切到「方法四：Web Worker」体验丝滑流畅，直观感受性能差异。每种方法都包含一个输入框，可在执行期间测试页面是否响应。
