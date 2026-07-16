/**
 * 入口文件：演示多环境构建
 *
 * 根据 webpack 注入的 process.env.INCLUDE_* 开关，决定加载哪些模块。
 * 由于这些开关在编译期被替换为字面量 true/false，
 * 配合 Terser 死代码消除，未开启的模块不会进入最终产物。
 *
 * 对比三种构建产物体积：
 *   npm run build:basic   -> bundle.basic.js   （最小）
 *   npm run build:full    -> bundle.full.js    （中等）
 *   npm run build:premium -> bundle.premium.js （最大）
 */
import { renderBasic } from './modules/basic'

const app = document.getElementById('app')
if (!app) {
  throw new Error('找不到 #app 容器')
}

const messages: string[] = []
const edition: string = process.env.EDITION || 'basic'

messages.push(`当前版本：${edition}`)
messages.push(renderBasic())

// 高级模块：full / premium 版本包含
if (process.env.INCLUDE_ADVANCED === 'true') {
  const { renderAdvanced, buildAdvancedDashboard } = require('./modules/advanced')
  messages.push(renderAdvanced())
  messages.push(buildAdvancedDashboard())
}

// 旗舰模块：仅 premium 版本包含
if (process.env.INCLUDE_PREMIUM === 'true') {
  const { renderPremium, runAiAssistant } = require('./modules/premium')
  messages.push(renderPremium())
  messages.push(runAiAssistant('帮我分析本月销售数据'))
}

app.innerHTML = `
  <div style="font-family: sans-serif; padding: 24px;">
    <h1>多环境构建演示</h1>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${messages.join('\n\n')}</pre>
    <p style="color:#666;">
      提示：分别执行 <code>npm run build:basic</code> /
      <code>npm run build:full</code> /
      <code>npm run build:premium</code>，
      对比 dist/bundle.basic.js、bundle.full.js、bundle.premium.js 的体积。
    </p>
  </div>
`
