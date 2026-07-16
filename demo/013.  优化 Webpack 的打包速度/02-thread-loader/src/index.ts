/**
 * 入口文件：演示 thread-loader 多进程打包
 *
 * 引入多个工具模块，让 ts-loader 在多个 worker 中并行处理。
 */
import { sum, factorial } from './utils/math'
import { reverse, capitalize } from './utils/string'

const app = document.getElementById('app')

function render(): void {
  const numbers = [1, 2, 3, 4, 5]
  const total = sum(numbers)
  const fact5 = factorial(5)
  const word = capitalize(reverse('webpack'))

  if (app) {
    app.innerHTML = `
      <h1>多进程并行打包示例</h1>
      <p>ts-loader 在 worker 池中并行执行，充分利用多核 CPU。</p>
      <ul>
        <li>sum([1..5]) = ${total}</li>
        <li>5! = ${fact5}</li>
        <li>reverse + capitalize('webpack') = ${word}</li>
      </ul>
    `
  }
}

render()
