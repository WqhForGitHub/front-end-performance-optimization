# 使用 Webpack 和 LocalStorage 实现静态资源的离线缓存

本目录用 **Webpack 5 + TypeScript** 演示了 4 种基于 LocalStorage 的静态资源离线缓存方案。每个子目录都是一个独立、可运行的最小项目，演示一种缓存策略。

除了浏览器自带的 HTTP 缓存外，**把 JS / CSS 文本内容直接缓存到 LocalStorage** 可以让应用在「断网 / 弱网」「服务器返回 5xx」「CDN 抖动」等场景下仍能加载，是 SPA 提升可用性、降低首屏时间的常见手段。但 LocalStorage 容量有限（约 5MB），需要正确的版本管理、容量管理与降级策略，否则很容易出现「缓存了旧版本」「配额超限写入失败」等问题。

所有项目的 `webpack.config.ts` 与 `src` 均可通过 `tsc --noEmit` 类型检查（无 TS 报错），且**无需安装依赖**即可运行（见下方「无需安装即可类型检查」说明）。

## 优化方法总览

| 序号 | 目录                  | 优化点                       | 作用                                                       |
| ---- | --------------------- | ---------------------------- | ---------------------------------------------------------- |
| 01   | `01-manifest-cache`   | 自定义 ManifestPlugin        | 构建期生成资源清单 manifest.json，运行时按清单逐个校验缓存 |
| 02   | `02-content-hash`     | contenthash 版本化缓存       | 以「逻辑名 + hash」为 key，hash 变化才重新拉取             |
| 03   | `03-version-control`  | 应用版本号失效策略           | 部署版本变化时整体清空再重拉，保证「一次部署一套版本」     |
| 04   | `04-cache-fallback`   | Cache-First + Network 降级   | 缓存 -> 网络 -> 错误；含 LRU 容量管理与配额溢出处理        |

## 通用约定

- **构建工具**：webpack 5 + webpack-cli + ts-node（用于加载 `webpack.config.ts`）
- **TS 配置**：`module: ESNext` + `moduleResolution: bundler`；`ts-node.compilerOptions` 中覆盖为 `module: CommonJS` + `moduleResolution: node`，让配置文件可被 Node 直接加载
- **类型检查**：每个项目都有 `type-check` 脚本（`tsc --noEmit`），与转译解耦
- **无需安装即可类型检查**：每个项目的 `src/env.d.ts` 提供了 webpack / 各插件 / lodash / Node 内置（path、`__dirname`、`process`）以及 DefinePlugin 注入常量等本地类型声明。因此即使不执行 `npm install`（无 node_modules），`npm run type-check` 也能零报错通过。安装依赖后该文件仍兼容（不会产生重复声明冲突）；若想使用第三方库的完整精确类型，可在安装依赖后删除 `src/env.d.ts`
- **HTML 入口**：统一使用 `html-webpack-plugin` 生成 `index.html`
- **产物文件名**：统一使用 `[contenthash:8]`，资源内容变化时 hash 自动变化，天然支持缓存版本区分

## 各方法详解

### 01. 基于资源清单的 LocalStorage 缓存

`ManifestPlugin` 在构建完成时遍历 `compilation.assets`，把每个产物的「文件名 + contenthash + 大小」写入 `manifest.json`：

```ts
// src/manifest-plugin.ts（节选）
compiler.hooks.emit.tapAsync('ManifestPlugin', (compilation, callback) => {
  const entries = Object.keys(compilation.assets).map((name) => {
    const match = name.match(/\.([a-f0-9]{8})\.(js|css)$/i)
    return { name, hash: match ? match[1] : '', size: compilation.assets[name].size() }
  })
  compilation.assets['manifest.json'] = {
    source: () => JSON.stringify({ buildAt: Date.now(), assets: entries }, null, 2),
    size: () => 0,
  }
  callback()
})
```

运行时 `CacheManager` 拉取 `manifest.json`，对每个资源：

- LocalStorage 中存在同名 + 同 hash -> **HIT**，直接复用
- 同名但 hash 变化 -> **UPDATE**，重新拉取并覆盖
- 未命中 -> **MISS**，拉取并写入

```ts
// src/cache-manager.ts（节选）
if (record && record.hash === entry.hash && record.content.length > 0) {
  stats.hit++
  continue // 命中
}
const content = await fetchText(`${baseUrl}/${entry.name}`)
localStorage.setItem(`mc:${entry.name}`, JSON.stringify({ ... }))
```

- **构建**：`npm run build`
- **观察**：`dist/` 下生成 `manifest.json`；首次访问全部 MISS，刷新后全部 HIT

### 02. 基于 contenthash 的版本化缓存

webpack 输出文件名带 `[contenthash:8]`，资源内容变化时 hash 自动变化。运行时 `ResourceCache` 直接从 URL 中解析出 hash 作为缓存 key：

```ts
// src/resource-cache.ts（节选）
const HASH_REGEX = /^(.*?)(?:\.([a-f0-9]{8}))?\.(js|css)$/i
const key = `ch:${logicalName}@${hash}`

if (cached && cached.hash === parsed.hash) {
  return { source: 'cache', ... } // 命中
}
// 否则拉取 -> 写入 -> 清理同逻辑名下其它 hash 的旧缓存
const evicted = evictOldHashes(parsed.logicalName, parsed.hash)
```

只有「hash 真正变了」的资源才重新拉取，其余资源（如未改动的 vendor chunk）始终走缓存。同时清理同逻辑名下「过期 hash」的旧缓存，避免 LocalStorage 无限增长。

- **构建**：`npm run build`
- **观察**：修改 `src/index.ts` 后重新构建，对应 chunk hash 变化 -> 走网络；其它 chunk hash 不变 -> 走缓存

### 03. 带版本管理的缓存管理

通过 `DefinePlugin` 注入 `__APP_VERSION__`，每次部署得到一个新版本号。运行时 `VersionedCache` 启动时先对比 LocalStorage 中保存的版本号：

```ts
// webpack.config.ts（节选）
new DefinePlugin({
  __APP_VERSION__: JSON.stringify(`v${Date.now().toString(36)}`),
})
```

```ts
// src/version-cache.ts（节选）
const prev = localStorage.getItem('vc:__version__')
if (prev !== currentVersion) {
  const cleared = clearCache()            // 清空本 demo 写入的全部缓存
  localStorage.setItem('vc:__version__', currentVersion)
  appendHistory({ version: currentVersion, action: 'upgrade', clearedCount: cleared, ... })
}
```

- **版本一致** -> 复用现有缓存
- **版本变化** -> 全部清空，再以新版本号重新拉取

这样可以保证「一次部署后所有缓存都属于同一版本」，避免「新老版本混合」的脏状态。同时记录版本变更历史，便于排查。

- **构建**：`npm run build`
- **观察**：第一次访问全部 MISS；刷新全部 HIT；修改 `__APP_VERSION__` 重新构建后版本变化，自动清空再重新拉取

### 04. 带降级策略的缓存

采用 **Cache-First + Network Fallback** 策略：

1. 先查 LocalStorage -> 命中直接返回
2. 未命中 -> 网络 -> 成功后写入 LocalStorage
3. 网络也失败 -> 返回 error，调用方降级展示「离线」

```ts
// src/cache-strategy.ts（节选）
const cached = readRaw(assetPath)
if (cached) {
  cached.lastAccessAt = Date.now()
  return { source: 'cache', content: cached.content, ... }
}
try {
  const content = await fetchText(`${baseUrl}/${assetPath}`)
  writeRaw({ ... }, maxEntries) // 失败时触发 LRU 淘汰
  return { source: 'network', content, ... }
} catch (e) {
  return { source: 'error', content: '', message: String(e) }
}
```

**容量管理**：

- 写入失败时（通常为 `QuotaExceededError`）触发 LRU 淘汰，按 `lastAccessAt` 升序删除最旧条目
- 维护最大条目数（默认 50），超出时主动淘汰

```ts
function evictLRU(count: number): number {
  const all = listAll().sort((a, b) => a.lastAccessAt - b.lastAccessAt)
  let evicted = 0
  for (let i = 0; i < Math.min(count, all.length); i++) {
    localStorage.removeItem(`cf:${all[i].name}`)
    evicted++
  }
  return evicted
}
```

- **构建**：`npm run build`
- **观察**：
  - 首次访问全部 NETWORK
  - 刷新全部 CACHE
  - 离线（断网）+ 已有缓存 -> 仍可正常加载（CACHE）
  - 离线 + 无缓存 -> 进入 error 分支
  - 连续加载多个资源超过 maxEntries 时会触发 LRU 淘汰

## 目录结构

```
009. 使用 Webpack 和 LocalStorage 实现静态资源的离线缓存/
├── 01-manifest-cache/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       ├── cache-manager.ts
│       └── manifest-plugin.ts        # 自定义 webpack 插件
├── 02-content-hash/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── resource-cache.ts
├── 03-version-control/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts                  # 额外声明 __APP_VERSION__
│       ├── index.ts
│       └── version-cache.ts
├── 04-cache-fallback/
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── index.ts
│       └── cache-strategy.ts
└── README.md
```

> 每个项目的 `src/` 下都包含 `env.d.ts`（本地类型声明，用于无 node_modules 时通过类型检查），上表已显式列出。

## 启动方式

每个项目都是独立项目。**类型检查无需安装依赖**，构建/开发需要先安装依赖：

```bash
# 进入任一项目目录，例如
cd "009. 使用 Webpack 和 LocalStorage 实现静态资源的离线缓存/01-manifest-cache"

# 安装依赖（构建/开发需要；类型检查不需要）
npm install

# 生产构建（产物在 dist/）
npm run build

# 仅做类型检查（无需安装依赖即可运行）
npm run type-check
```

构建后，由于本 demo 的核心是「运行时通过 fetch + LocalStorage 加载资源」，需要通过**静态文件服务器**访问 `dist/index.html`（直接双击打开会因 `file://` 协议导致 fetch 失败）：

```bash
# 任选一种静态服务器
npx serve -s dist
# 或
npx http-server dist -p 8080
```

然后浏览器打开 `http://localhost:3000`（或对应端口），点击页面上的「加载」按钮即可观察缓存命中/未命中状态。再次刷新页面，应能看到全部 HIT。

## 方法分类

| 类别         | 方法                                       | 说明                                                  |
| ------------ | ------------------------------------------ | ----------------------------------------------------- |
| 资源清单驱动 | 01-manifest-cache                          | 构建期产物 manifest.json，运行时按清单校验缓存        |
| 哈希驱动     | 02-content-hash                            | 以 URL 中 contenthash 为缓存 key，hash 变化才重新拉取 |
| 版本驱动     | 03-version-control                         | 部署版本号变化时整体清空再重拉，保证版本一致          |
| 容错驱动     | 04-cache-fallback                          | Cache-First + Network 降级 + LRU 容量管理             |
