/**
 * 埋点服务
 *
 * 演示：根据 config.analytics 决定是否真正上报。
 * 配合 NormalModuleReplacementPlugin，dev 配置里 analytics=false，
 * 因此开发构建中虽然引入了这个模块，但调用 trackEvent 不会真正发送。
 */
import config from '../config'

export interface TrackEvent {
  name: string
  payload?: Record<string, unknown>
}

export function trackEvent(event: TrackEvent): void {
  if (!config.analytics) {
    // 开发环境或关闭埋点时，仅打印
    console.debug('[analytics] (skip) ', event.name, event.payload)
    return
  }
  // 生产环境真正上报（模拟）
  console.log('[analytics] report =>', event.name, event.payload)
}

export function trackPageView(url: string): void {
  trackEvent({ name: 'page_view', payload: { url } })
}
