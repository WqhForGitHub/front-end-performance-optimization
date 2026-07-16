/**
 * 入口文件：演示 resolve 解析优化
 *
 * 说明：webpack.config.ts 中配置了 alias（@utils、@src）、精简的 extensions
 * 以及限定 modules。业务代码这里仍使用相对路径以保证 TypeScript 在无
 * node_modules 时也能通过 tsc 类型检查；实际工程中可改用 `@utils/...`
 * 别名，Webpack 会按 alias 映射到 src/utils，从而缩短解析路径。
 */
import { buildGreeting } from './utils/helper'
import { APP_NAME, MAX_ITEMS } from './utils/constants'

const app = document.getElementById('app')

function render(): void {
  const greeting = buildGreeting('Webpack')
  const items = Array.from({ length: MAX_ITEMS }, (_, i) => i + 1)

  if (app) {
    const html = items.map((i) => `<li>${APP_NAME} - 条目 ${i}</li>`).join('')
    app.innerHTML = `
      <h1>${greeting}</h1>
      <p>resolve 配置已优化：alias 缩短路径、extensions 精简、modules 限定。</p>
      <ul>${html}</ul>
    `
  }
}

render()
