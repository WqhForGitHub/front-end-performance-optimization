# 023 - 在网页中有大量图片时，优化图像加载以提高页面加载速度

当网页中存在大量图片时，一次性请求所有图片会造成带宽争抢、首屏 LCP 劣化、
可见图片加载延迟等问题。本目录提供 **3 种互补的优化方案**，分别从
"加载时机"、"加载哪个版本"、"加载感知体验" 三个维度进行优化。

## 方案概览

| 方案 | 目录 | 端口 | 核心思路 | 适用场景 |
| --- | --- | --- | --- | --- |
| 1. 懒加载 | `01-lazy-loading` | 5246 | 延迟加载视口外的图片 | 长列表/图库，首屏外的图片 |
| 2. 响应式图片 | `02-responsive-images` | 5247 | 按视口/DPR 选择最合适尺寸 | 多端适配、节省移动端带宽 |
| 3. 渐进式加载 | `03-progressive-loading` | 5248 | LQIP 模糊占位 + 主图淡入 | 对感知性能要求高的场景 |

> 三种方案可组合使用：响应式图片 + 懒加载 + LQIP 是大图库的最佳实践。

---

## 方案一：图片懒加载（`01-lazy-loading`）

**端口：5246**

### 原理
- **IntersectionObserver 懒加载**：组件挂载时不设置 `img.src`，仅观察元素与视口的交叉状态。
  进入预触发范围（`rootMargin`）后，再把真实地址写入 `src` 触发请求。
- **原生 `loading="lazy"`**：浏览器原生支持的图片懒加载，零 JS 代码，浏览器自行决定加载时机。
- **立即加载（对照）**：所有图片在页面加载时立刻发起请求，可观察到明显的带宽争抢。

### 演示功能
- 24 张 picsum.photos 图片组成的图库
- 三种加载模式切换：IO 懒加载 / 原生 lazy / 立即加载（对照）
- 可调节 `rootMargin` 预加载距离（0px / 200px / 500px）
- 实时统计已请求 / 已加载 / 失败的图片数量与进度条

### 选择建议
- 首屏 LCP 图片：使用 `loading="eager"` + `fetchpriority="high"`
- 普通列表/图库：使用 `loading="lazy"` 即可，最简单
- 需要精细控制（埋点、骨架屏、动画）：使用 IntersectionObserver
- 可结合：首屏 eager + 其余 lazy，兼顾首屏与带宽

---

## 方案二：响应式图片（`02-responsive-images`）

**端口：5247**

### 原理
- **srcset + sizes**：提供同一图片的多个分辨率版本，浏览器根据视口宽度与 DPR 自动选择
  最合适的源，只下载一张图片。
- **`<picture>` + `<source media>`**：不同视口下使用完全不同的裁切/构图（艺术指导），
  例如手机端裁成正方形突出主体。
- **`<picture>` + `<source type>`**：提供不同格式降级（AVIF / WebP / JPEG）。

### 演示功能
- **srcset 模式**：4 张图片，每张提供 400/800/1200/1600/2000 五个宽度版本
- **picture 模式**：3 张图片的艺术指导演示，缩放窗口可见构图变化
- **compare 模式**：固定 2000px 大图 vs 响应式图片的对比，可见下载体积差异
- 代码示例展示（带复制按钮）

### 选择建议
- 同一图片不同分辨率：用 `srcset` + `sizes`
- 不同视口不同构图：用 `<picture>` + `<source media>`
- 不同格式降级：用 `<picture>` + `<source type>`
- 务必设置 `width` / `height` 防止 CLS（布局抖动）
- 配合 `loading="lazy"` 进一步优化非首屏图片

---

## 方案三：渐进式图片加载（`03-progressive-loading`）

**端口：5248**

### 原理
1. **LQIP（Low Quality Image Placeholder）**：先加载一张极小的低质量占位图（通常 20~40px 宽，
   体积几 KB），几乎瞬间加载完成，被放大并模糊显示。
2. **主图后台加载**：主图通过 `new Image()` 异步预加载，不阻塞渲染。
3. **blur-up 过渡**：主图加载完成后淡入覆盖，LQIP 淡出，呈现"先模糊后清晰"的过渡。

### 演示功能
- 6 张图片的渐进式加载图库（LQIP + blur-up）
- 三种加载策略对比：直接加载（白屏等待）/ 骨架屏占位 / LQIP 渐进式
- 流程图解说明 LQIP -> 主图加载 -> 淡入去模糊 的三个步骤
- 实时显示加载状态徽章（等待中 / 加载主图 / 已加载 / 失败）

### 选择建议
- 首屏 LCP 图片：可用 LQIP 提升感知速度，但注意 LCP 仍以主图加载为准
- 图库/列表：LQIP + 懒加载组合效果最佳
- 对感知性能要求高：LQIP 优于纯骨架屏
- 极小图标/装饰图：无需 LQIP，直接 inline SVG 或 base64 即可
- 类似方案：SQIP（基于 SVG 的占位）、BlurHash、dominant-color 占位

---

## 运行方式

每个子目录都是独立的 Vite + React + TypeScript 项目。

```bash
# 进入对应方案目录
cd 01-lazy-loading        # 或 02-responsive-images / 03-progressive-loading

# 安装依赖（如需）
npm install

# 开发模式启动（端口分别为 5246 / 5247 / 5248）
npm run dev

# 类型检查
npm run type-check

# 生产构建
npm run build
```

> 提示：`src/env.d.ts` 中提供了 fallback 类型声明，即使不执行 `npm install`
> （无 node_modules），`tsc --noEmit` 也能通过类型检查。

## 调试建议

- 打开浏览器开发者工具 **Network 面板**，过滤 `Img`，观察实际下载的图片
- 在 Network 面板中**限速为 Slow 3G**，可更明显观察加载策略差异
- 关注 **LCP（Largest Contentful Paint）** 指标，评估首屏体验
- 关注 **CLS（Cumulative Layout Shift）**，确保图片有预留尺寸不引起布局抖动

## 技术栈

- React 18 + TypeScript 5
- Vite 5 + `@vitejs/plugin-react`
- 图片源：[picsum.photos](https://picsum.photos/)（提供占位图，支持 seed / 尺寸 / 模糊参数）
