import { add, multiply } from './utils/math'

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>Tree Shaking 演示</h1>
    <p>add(2, 3) = ${add(2, 3)}</p>
    <p>multiply(4, 5) = ${multiply(4, 5)}</p>
    <p style="color:#888">
      math.ts 中导出了 subtract / divide / power / factorial / fibonacci，
      但本文件只导入了 add 和 multiply，其余函数在产物中不会出现。<br>
      utils/unused.ts 整个文件未被引用，配合 sideEffects: false 会被完全移除。
    </p>
    <p style="color:#888">
      对比：<code>npm run build</code>（开启 Tree Shaking）与
      <code>npm run build:no-shake</code>（关闭 usedExports）的产物体积差异。
    </p>
  `
}
