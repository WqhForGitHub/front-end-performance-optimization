/**
 * Largest Contentful Paint (LCP) 观察者
 *
 * LCP 会随着页面渲染不断更新：每当出现更大的内容元素时，浏览器都会派发一条新的
 * largest-contentful-paint 条目。最终的"真实 LCP"通常是用户首次交互前
 * 最后一条条目的 startTime。
 *
 * 该模块持续接收所有 LCP 条目并回调，由调用方决定何时取"最终值"。
 */

export interface LCPEntry {
  /** 渲染时间（与 startTime 接近，优先用 renderTime） */
  renderTime: number
  /** 加载时间 */
  loadTime: number
  startTime: number
  /** 元素的可视面积（平方像素） */
  size: number
  /** 元素描述（tag + id + class） */
  element: string
  /** 如果是图片/视频，对应资源 URL */
  url: string
  /** 条目编号（第几次 LCP 更新） */
  index: number
}

export type LCPCallback = (entry: LCPEntry) => void

function describeElement(el: Element | null): string {
  if (!el) return 'unknown'
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  let cls = ''
  if (typeof el.className === 'string' && el.className) {
    cls = '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
  }
  return `${tag}${id}${cls}`
}

export function observeLCP(callback: LCPCallback): PerformanceObserver | null {
  let observer: PerformanceObserver | null = null
  let count = 0

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // LargestContentfulPaint 在 DOM lib 中已有类型定义
        const lcp = entry as LargestContentfulPaint
        count += 1
        callback({
          renderTime: lcp.renderTime,
          loadTime: lcp.loadTime,
          startTime: lcp.startTime,
          size: lcp.size,
          element: describeElement(lcp.element),
          url: lcp.url || '',
          index: count,
        })
      }
    })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    return observer
  } catch (err) {
    console.warn('[LCP] PerformanceObserver 不支持 largest-contentful-paint', err)
    return null
  }
}

/**
 * 当用户发生首次交互（点击 / 按键 / 滚动）后，LCP 不再更新。
 * 调用此函数注册"冻结"逻辑：交互发生后调用 onFinal 回调返回最终值。
 */
export function freezeLCPOnInteraction(
  getLastLCP: () => LCPEntry | null,
  onFinal: (entry: LCPEntry | null) => void,
): () => void {
  let frozen = false

  const handler = (): void => {
    if (frozen) return
    frozen = true
    onFinal(getLastLCP())
    ;['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
      window.removeEventListener(evt, handler),
    )
  }

  ;['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
    window.addEventListener(evt, handler, { passive: true, once: false }),
  )

  return () => {
    ;['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
      window.removeEventListener(evt, handler),
    )
  }
}
