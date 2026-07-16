/**
 * 页面 B 入口
 *
 * 引入共享工具函数，渲染页面 B 的内容。
 * Webpack 会为该入口生成独立的 pageB bundle。
 */
import { formatNumber, greet, generateId } from '../shared/utils'

const app = document.getElementById('app')
if (app) {
  const bigNumber = 123456789
  app.innerHTML = `
    <h1>页面 B</h1>
    <p>${greet('访客 B')}</p>
    <p>格式化数字：${formatNumber(bigNumber)}</p>
    <p>页面 ID：${generateId('pageB')}</p>
    <p>该页面只加载 pageB 的 bundle，不包含 pageA / pageC 的代码。</p>
  `
}

console.log('页面 B 已加载')
