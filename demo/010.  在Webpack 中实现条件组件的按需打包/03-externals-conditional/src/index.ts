/**
 * 入口文件：演示条件 externals
 *
 * 业务代码正常 import lodash 的方法，不需要关心 lodash 是被打包还是走 CDN。
 * 区别体现在构建产物：
 *   - npm run dev   (NODE_ENV=development): lodash 被打包进 bundle.js
 *   - npm run build (NODE_ENV=production):   lodash 不在 bundle.js，运行时从 CDN 获取
 */
import { generateRandomData, chunkAndFlatten, paginate } from './utils/data'

const app = document.getElementById('app')
if (!app) {
  throw new Error('找不到 #app 容器')
}

const data = generateRandomData(12)
const pages = paginate(data, 4)
const flat = chunkAndFlatten(data, 3)

app.innerHTML = `
  <div style="font-family: sans-serif; padding: 24px;">
    <h1>条件 externals 演示</h1>
    <p>原始数据（12 个 1~100 的随机数）：</p>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(data)}</pre>

    <p>分页（每页 4 个）：</p>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(pages)}</pre>

    <p>chunk(3) 后再 flatten：</p>
    <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${JSON.stringify(flat)}</pre>

    <p style="color:#666;">
      说明：以上功能依赖 lodash。
      开发构建里 lodash 被打包进 bundle；生产构建里 lodash 走 CDN，
      因此生产构建的 bundle.js 体积会明显更小。
    </p>
  </div>
`
