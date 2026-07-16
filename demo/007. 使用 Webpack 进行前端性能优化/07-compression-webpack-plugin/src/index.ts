import { range, flatten, chunk, map, filter } from 'lodash'

/**
 * 生成较大体积的产物，便于超过 gzip threshold（10KB），
 * 从而在 dist 中看到 .gz 压缩文件。
 */
const bigArray = range(1, 2000)
const grouped = chunk(bigArray, 100)
const doubled = map(flatten(grouped), (n) => n * 2)
const evens = filter(doubled, (n) => n % 2 === 0)

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>compression-webpack-plugin 演示</h1>
    <p>生成数据量：${evens.length} 条</p>
    <p>前 10 项：${JSON.stringify(evens.slice(0, 10))}</p>
    <p style="color:#888">
      打开 dist 目录，可以看到 bundle.js 旁边多出 bundle.js.gz 压缩文件，
      体积远小于原文件。
    </p>
  `
}
