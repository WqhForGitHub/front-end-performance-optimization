/**
 * 入口文件：演示 babel-loader 缓存
 *
 * 类型检查由独立的 `npm run type-check`（tsc --noEmit）负责，
 * 转译由 babel-loader 完成，二者解耦，构建更快。
 */
import { validateEmail, validateAge } from './utils/validator'

const app = document.getElementById('app')

function render(): void {
  const emailOk = validateEmail('test@example.com')
  const ageOk = validateAge(18)

  if (app) {
    app.innerHTML = `
      <h1>babel-loader 缓存示例</h1>
      <p>babel-loader 开启 cacheDirectory，二次构建复用转译结果。</p>
      <ul>
        <li>邮箱校验：${emailOk ? '通过' : '不通过'}</li>
        <li>年龄校验：${ageOk ? '通过' : '不通过'}</li>
      </ul>
    `
  }
}

render()
