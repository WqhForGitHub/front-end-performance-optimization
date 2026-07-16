/**
 * 入口文件：演示持久化缓存的效果
 *
 * 引入多个工具模块，模拟一个具有一定规模的业务工程，
 * 这样首次与二次构建的耗时差异会更明显。
 */
import { fetchData } from './utils/data'
import { formatList } from './utils/format'

const app = document.getElementById('app')

function render(): void {
  const list = fetchData()
  const html = formatList(list)
    .map((item) => `<li>${item}</li>`)
    .join('')

  if (app) {
    app.innerHTML = `
      <h1>持久化缓存示例</h1>
      <p>第二次构建会显著快于第一次，因为命中了文件系统缓存。</p>
      <ul>${html}</ul>
    `
  }
}

render()
