/**
 * 页面 B 入口
 *
 * 引入 shared/config 和 shared/logger，
 * 这些共享模块同时被 pageA 引用，
 * 因此会被提取到 common chunk 中，不会重复打包。
 */
import { APP_CONFIG, getPageMeta } from '../shared/config'
import { logInfo, logWarn } from '../shared/logger'

const meta = getPageMeta('pageB')
logInfo(`正在加载页面：${meta.title}`)

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>${meta.title}</h1>
    <p>${meta.description}</p>
    <p>应用名称：${APP_CONFIG.name}</p>
    <p>API 地址：${APP_CONFIG.apiUrl}</p>
    <hr />
    <p>本页面与页面 A 共享 config 和 logger 模块，它们被提取到 <code>common.[hash].js</code> 中。</p>
  `
}

logWarn('页面 B 使用了 WARN 级别日志')
logInfo('页面 B 渲染完成')
