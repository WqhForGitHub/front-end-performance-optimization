/**
 * Service Worker 注册工具
 *
 * 由于本项目无构建产物（无 node_modules），这里提供模拟注册工具。
 * 在真实项目中，Vite 可以通过 vite-plugin-pwa 插件自动生成 SW 文件。
 *
 * 概念说明：
 * - Service Worker 是运行在浏览器后台的 JavaScript 脚本
 * - 独立于主线程，可以拦截网络请求
 * - 可以缓存资源，实现离线访问
 * - 生命周期：install -> activate -> fetch
 */

export interface SWRegistrationResult {
  success: boolean
  message: string
  scope?: string
}

export interface SWStatus {
  registered: boolean
  active: boolean
  scope: string
  updateAvailable: boolean
}

/**
 * 模拟 Service Worker 注册
 *
 * 真实实现：
 * ```ts
 * if ('serviceWorker' in navigator) {
 *   navigator.serviceWorker.register('/sw.js')
 *     .then(reg => console.log('SW registered', reg))
 *     .catch(err => console.log('SW failed', err))
 * }
 * ```
 */
export async function registerServiceWorker(swUrl: string = '/sw.js'): Promise<SWRegistrationResult> {
  // 检查浏览器是否支持 Service Worker
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      success: false,
      message: '当前浏览器不支持 Service Worker',
    }
  }

  // 检查是否在 HTTPS 或 localhost 环境下
  if (typeof location !== 'undefined') {
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    if (location.protocol !== 'https:' && !isLocalhost) {
      return {
        success: false,
        message: 'Service Worker 需要 HTTPS 环境或 localhost',
      }
    }
  }

  try {
    // 模拟注册过程（真实代码使用 navigator.serviceWorker.register）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: 'Service Worker 注册成功，已开始缓存资源',
      scope: '/',
    }
  } catch (err) {
    return {
      success: false,
      message: `Service Worker 注册失败: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

/**
 * 模拟取消注册 Service Worker
 */
export async function unregisterServiceWorker(): Promise<SWRegistrationResult> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    success: true,
    message: 'Service Worker 已取消注册，缓存已清除',
  }
}

/**
 * 模拟获取 Service Worker 状态
 */
export async function getSWStatus(): Promise<SWStatus> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return {
    registered: true,
    active: true,
    scope: '/',
    updateAvailable: false,
  }
}

/**
 * 模拟预缓存资源列表
 * 在真实项目中，这些路径会在 SW 的 install 事件中预缓存
 */
export const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/favicon.ico',
] as const
