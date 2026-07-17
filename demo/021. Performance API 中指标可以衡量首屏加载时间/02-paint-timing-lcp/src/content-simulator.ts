/**
 * 内容加载模拟器
 *
 * 为了在演示中能看到 LCP 多次更新（标题 -> 段落 -> 主图 -> 延迟卡片），
 * 我们按时间分阶段地把内容元素插入到 DOM 中。
 *
 * 浏览器会在每次出现更大的可视内容时派发新的 largest-contentful-paint 条目，
 * PerformanceObserver 实时捕获并更新仪表盘。
 */

import { appendLog } from './dashboard'

export function simulateContentLoad(): void {
  appendLog('页面开始加载，准备模拟内容渐进式出现...', 'info')

  // 阶段 1：标题立即出现（FCP 通常在这里发生）
  window.requestAnimationFrame(() => {
    const stage1 = document.getElementById('stage-1')
    stage1?.classList.add('visible')
    appendLog('阶段 1：标题与正文文本出现（通常触发 FP / FCP）', 'metric')
  })

  // 阶段 2：副标题与说明
  window.setTimeout(() => {
    const stage2 = document.getElementById('stage-2')
    stage2?.classList.add('visible')
    appendLog('阶段 2：副标题段落出现（可能更新 LCP）', 'metric')
  }, 500)

  // 阶段 3：主图加载（最有可能成为 LCP 的元素）
  window.setTimeout(() => {
    const stage3 = document.getElementById('stage-3')
    stage3?.classList.add('visible')
    const hero = document.getElementById('hero-image') as HTMLImageElement | null
    if (hero) {
      // 用一个 data URI 的渐变占位图，避免外网请求失败
      hero.src =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#667eea"/>
                <stop offset="100%" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
            <rect width="800" height="400" fill="url(#g)"/>
            <text x="400" y="210" font-size="48" fill="#fff" text-anchor="middle" font-family="sans-serif">Hero Image 800x400</text>
          </svg>`,
        )
      hero.onload = () => {
        appendLog('阶段 3：主图（800x400）加载完成，最可能成为 LCP', 'metric')
      }
    }
  }, 1100)

  // 阶段 4：延迟加载的大卡片（可能再次更新 LCP）
  window.setTimeout(() => {
    const stage4 = document.getElementById('stage-4')
    if (stage4) {
      stage4.classList.add('visible')
      appendLog('阶段 4：延迟渲染的大卡片出现（可能再次更新 LCP）', 'metric')
    }
  }, 2000)

  // 阶段 5：提示用户进行交互以冻结 LCP
  window.setTimeout(() => {
    appendLog('提示：点击页面或滚动可"冻结" LCP（模拟用户首次交互）', 'info')
    const tip = document.getElementById('interaction-tip')
    if (tip) tip.classList.add('visible')
  }, 2600)
}
