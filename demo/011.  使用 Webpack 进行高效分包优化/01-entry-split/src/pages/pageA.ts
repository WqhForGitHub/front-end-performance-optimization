/**
 * 页面 A 入口
 *
 * 引入共享工具函数，渲染页面 A 的内容。
 * Webpack 会为该入口生成独立的 pageA bundle。
 */
import { formatDate, greet, generateId } from '../shared/utils'

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>页面 A</h1>
    <p>${greet('访客 A')}</p>
    <p>今天日期：${formatDate(new Date())}</p>
    <p>页面 ID：${generateId('pageA')}</p>
    <p>该页面只加载 pageA 的 bundle，不包含 pageB / pageC 的代码。</p>
  `
}

console.log('页面 A 已加载')
