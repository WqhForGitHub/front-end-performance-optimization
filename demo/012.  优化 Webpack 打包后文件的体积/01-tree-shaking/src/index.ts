/**
 * Tree Shaking 演示入口
 *
 * 此文件导入 used 模块的 add 函数并使用，
 * 但不导入 unused 模块的任何内容。
 * 在 Tree Shaking 开启时，unused.ts 中的代码将被移除。
 */
import { add, multiply } from './utils/used'

// 使用导入的函数，确保它们不会被 tree shake 移除
const sum = add(10, 20)
const product = multiply(5, 6)

console.log('加法结果:', sum)
console.log('乘法结果:', product)

// 将结果渲染到页面
const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>Tree Shaking 深度优化演示</h1>
    <p>add(10, 20) = ${sum}</p>
    <p>multiply(5, 6) = ${product}</p>
    <p style="color: #999;">unused.ts 中的代码已被 Tree Shaking 移除</p>
  `
}
