/**
 * 入口文件：演示 loader 缓存优化
 */
import { processItems } from './utils/processor'

const app = document.getElementById('app')

function render(): void {
  const items = Array.from({ length: 10 }, (_, i) => i + 1)
  const result = processItems(items)

  if (app) {
    const html = result.map((r) => `<li>${r}</li>`).join('')
    app.innerHTML = `
      <h1>loader 缓存优化示例</h1>
      <p>ts-loader 开启 transpileOnly / 文件缓存，并排除 node_modules。</p>
      <ul>${html}</ul>
    `
  }
}

render()
