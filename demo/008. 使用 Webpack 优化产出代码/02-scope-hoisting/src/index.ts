import { greet, formatNumber } from './utils/format'
import { createGreeting } from './utils/calculator'

const app = document.getElementById('app')

if (app) {
  const message = createGreeting('Webpack', 12345)
  app.innerHTML = `
    <h1>Scope Hoisting 演示</h1>
    <p>${greet('Scope Hoisting')}</p>
    <p>${message}</p>
    <p>格式化数字：${formatNumber(9876543)}</p>
    <p style="color:#888">
      index.ts -> calculator.ts -> format.ts 三个模块在开启 Scope Hoisting 后<br>
      会被合并到同一个函数作用域，消除模块包装函数和 __webpack_require__ 调用。
    </p>
    <p style="color:#888">
      对比：<code>npm run build</code>（开启）与
      <code>npm run build:no-hoist</code>（关闭）的产物结构和体积。
    </p>
  `
}
