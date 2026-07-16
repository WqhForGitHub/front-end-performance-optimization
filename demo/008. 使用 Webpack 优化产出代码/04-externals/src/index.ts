import { chunk, flatten, random } from 'lodash'

const app = document.getElementById('app')

const numbers = Array.from({ length: 10 }, (_, i) => i + 1)
const grouped = chunk(numbers, 3)
const flat = flatten(grouped)

if (app) {
  app.innerHTML = `
    <h1>Externals 演示</h1>
    <p>分组结果：${JSON.stringify(grouped)}</p>
    <p>展开结果：${JSON.stringify(flat)}</p>
    <p>随机数：${random(1, 100)}</p>
    <p style="color:#888">
      lodash 未被打包进 bundle，而是通过 CDN 的 &lt;script&gt; 标签加载。<br>
      webpack 配置了 <code>externals: { lodash: '_' }</code>，
      运行时从全局变量 <code>_</code> 获取 lodash。
    </p>
    <p style="color:#888">
      对比：<code>npm run build</code>（外部 CDN）与
      <code>npm run build:bundle</code>（打包进 bundle）的产物体积差异。
    </p>
  `
}
