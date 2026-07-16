/**
 * externals + CDN 演示入口
 *
 * 此文件导入 lodash 并使用其功能，
 * 在 externals 配置下，lodash 不会被打包进产物，
 * 而是通过 CDN <script> 标签加载。
 */
import { chunkArray, flattenArray, getRandomNumbers, summarizeArray } from './utils/array-utils'

// 使用 lodash 封装的数组工具函数
const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const chunked = chunkArray(originalArray, 3)
const nested = [[1, 2], [3, 4], [5, 6]]
const flattened = flattenArray(nested)
const randomNums = getRandomNumbers(1, 100, 10)
const summary = summarizeArray(randomNums)

console.log('原始数组:', originalArray)
console.log('分块结果:', chunked)
console.log('展平结果:', flattened)
console.log('随机数字:', randomNums)
console.log('统计信息:', summary)

// 渲染到页面
const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>externals + CDN 优化演示</h1>
    <p>lodash 通过 CDN 加载，不打包进产物</p>
    <h2>数组分块（每3个一组）</h2>
    <pre>${JSON.stringify(chunked, null, 2)}</pre>
    <h2>数组展平</h2>
    <pre>${JSON.stringify(flattened, null, 2)}</pre>
    <h2>随机数字</h2>
    <pre>${JSON.stringify(randomNums, null, 2)}</pre>
    <h2>统计信息</h2>
    <pre>${JSON.stringify(summary, null, 2)}</pre>
    <p style="color: #999;">
      对比 build（CDN）和 build:bundle（打包）的产物体积差异
    </p>
  `
}
