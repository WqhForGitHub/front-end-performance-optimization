/**
 * 入口文件：演示 NormalModuleReplacementPlugin
 *
 * 这里 `import config from './config'` 看起来导入的是 config/index.ts，
 * 但在 webpack 构建时，NormalModuleReplacementPlugin 会根据 NODE_ENV
 * 把请求重定向到 config.dev.ts 或 config.prod.ts。
 *
 * 好处：
 *   - 业务代码只依赖 './config' 这一个"抽象入口"，不关心具体环境。
 *   - 切换环境只需改构建参数，不需要改业务代码。
 *   - dev/prod 配置可以共享类型，避免结构不一致。
 */
import config from './config'
import { trackPageView } from './services/analytics'

const app = document.getElementById('app')
if (!app) {
  throw new Error('找不到 #app 容器')
}

// 触发一次埋点
trackPageView('/home')

app.innerHTML = `
  <div style="font-family: sans-serif; padding: 24px;">
    <h1>NormalModuleReplacementPlugin 演示</h1>
    <p>当前实际加载的配置：</p>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(config, null, 2)}</pre>
    <p style="color:#666;">
      说明：源码里写的是 <code>import config from './config'</code>，
      但 webpack 构建时已根据 NODE_ENV 把它替换为
      <code>./config.dev</code> 或 <code>./config.prod</code>。
    </p>
    <p style="color:#666;">
      修改环境变量后重新 build，可以看到上面的 env 字段在 dev / prod 之间切换。
    </p>
  </div>
`
