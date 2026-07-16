/**
 * 入口文件：演示 DLL 预编译
 *
 * 业务代码照常 import lodash，构建时通过 DllReferencePlugin
 * 复用预编译产物，主构建不再重复打包 lodash。
 */
import { chunk, range, random } from 'lodash'

const app = document.getElementById('app')

function render(): void {
  const nums = range(1, 21)
  const groups = chunk(nums, 5)
  const lucky = random(1, 100)

  if (app) {
    const html = groups
      .map((g, i) => `<li>第 ${i + 1} 组: ${g.join(', ')}</li>`)
      .join('')
    app.innerHTML = `
      <h1>DLL 预编译示例</h1>
      <p>lodash 已通过 DLL 预编译，主构建直接复用产物。</p>
      <ul>${html}</ul>
      <p>幸运数字：${lucky}</p>
    `
  }
}

render()
