/**
 * 页面 C 入口
 *
 * 引入共享工具函数，渲染页面 C 的内容。
 * Webpack 会为该入口生成独立的 pageC bundle。
 */
import { formatDate, formatNumber, greet, generateId } from '../shared/utils'

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>页面 C</h1>
    <p>${greet('访客 C')}</p>
    <p>今天日期：${formatDate(new Date())}</p>
    <p>格式化数字：${formatNumber(987654321)}</p>
    <p>页面 ID：${generateId('pageC')}</p>
    <p>该页面只加载 pageC 的 bundle，不包含 pageA / pageB 的代码。</p>
  `
}

console.log('页面 C 已加载')
