import { chunk, flatten, random } from 'lodash'

const app = document.getElementById('app')

const numbers = Array.from({ length: 12 }, (_, i) => i + 1)
const grouped = chunk(numbers, 4)
const flat = flatten(grouped)

if (app) {
  app.innerHTML = `
    <h1>DLLPlugin 演示</h1>
    <p>lodash 已被预打包进 vendor.dll.js，不会出现在 bundle 中。</p>
    <p>分组结果：${JSON.stringify(grouped)}</p>
    <p>展开结果：${JSON.stringify(flat)}</p>
    <p>随机数：${random(1, 100)}</p>
    <p style="color:#888">
      打开 dist 目录，可以看到 vendor.dll.js 与 bundle.js 分离；
      bundle 中不再包含 lodash 代码。
    </p>
  `
}
