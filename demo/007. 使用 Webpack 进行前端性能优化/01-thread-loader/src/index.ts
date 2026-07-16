import { sum, formatResult } from './utils/math'
import { greet } from './utils/string'

const app = document.getElementById('app')

if (app) {
  const total = sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  app.innerHTML = `
    <h1>thread-loader 演示</h1>
    <p>${greet('Webpack')}</p>
    <p>1 到 10 的和：${formatResult(total)}</p>
    <p style="color:#888">本 demo 展示 thread-loader 多进程打包，构建时观察编译速度变化。</p>
  `
}
