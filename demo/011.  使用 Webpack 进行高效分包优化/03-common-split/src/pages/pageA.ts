/**
 * 页面 A 入口
 *
 * 引入 shared/config 和 shared/logger，
 * 这些共享模块同时被 pageB 引用，
 * 因此会被提取到 common chunk 中，不会重复打包。
 */
import { APP_CONFIG, getPageMeta } from '../shared/config'
import { logInfo } from '../shared/logger'

const meta = getPageMeta('pageA')
logInfo(`正在加载页面：${meta.title}`)

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>${meta.title}</h1>
    <p>${meta.description}</p>
    <p>应用名称：${APP_CONFIG.name}</p>
    <p>应用版本：${APP_CONFIG.version}</p>
    <hr />
    <p>本页面与页面 B 共享 config 和 logger 模块，它们被提取到 <code>common.[hash].js</code> 中。</p>
  `
}

logInfo('页面 A 渲染完成')
