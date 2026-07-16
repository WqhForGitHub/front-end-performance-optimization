import { chunk } from 'lodash'

const app = document.getElementById('app')

const data = [1, 2, 3, 4, 5, 6, 7, 8]
const groups = chunk(data, 3)

if (app) {
  app.innerHTML = `
    <h1>Runtime Chunk 演示</h1>
    <p>分组结果：${JSON.stringify(groups)}</p>
    <p style="color:#888">
      构建后查看 dist 目录，会发现三个文件：<br>
      1. <code>runtime.*.js</code> - webpack 运行时代码（模块加载器等）<br>
      2. <code>vendors.*.js</code> - 第三方依赖（lodash）<br>
      3. <code>main.*.js</code>    - 业务代码
    </p>
    <p style="color:#888">
      好处：修改业务代码时，只有 main.*.js 的 hash 变化，<br>
      runtime 和 vendors 的 hash 不变，浏览器缓存仍然有效。
    </p>
    <p style="color:#888">
      对比：<code>npm run build</code>（分离 runtime）与
      <code>npm run build:no-runtime</code>（不分离）的产物文件数量。
    </p>
  `
}
