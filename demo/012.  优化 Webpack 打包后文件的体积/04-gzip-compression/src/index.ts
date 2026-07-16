/**
 * gzip 预压缩演示入口
 *
 * 此文件导入了较大的数据模块，
 * 使打包后的 JS 文件超过 10KB 阈值，
 * 从而触发 compression-webpack-plugin 生成 .gz 预压缩文件。
 */
import { productList, filterByCategory, sortByPrice, getTotalCount } from './utils/data'

// 使用导入的数据
const electronics = filterByCategory('电子产品')
const sortedElectronics = sortByPrice(electronics)
const totalCount = getTotalCount()

console.log('商品总数:', totalCount)
console.log('电子产品数量:', electronics.length)

// 渲染到页面
const app = document.getElementById('app')
if (app) {
  const electronicsList = sortedElectronics
    .slice(0, 10)
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>¥${item.price.toFixed(2)}</td>
        <td>${item.stock}</td>
      </tr>
    `,
    )
    .join('')

  app.innerHTML = `
    <h1>gzip 预压缩演示</h1>
    <p>商品总数: ${totalCount}</p>
    <p>电子产品数量: ${electronics.length}</p>
    <table border="1" cellpadding="8" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>名称</th>
          <th>分类</th>
          <th>价格</th>
          <th>库存</th>
        </tr>
      </thead>
      <tbody>
        ${electronicsList}
      </tbody>
    </table>
    <p style="color: #999; margin-top: 16px;">
      打包后会生成 .gz 预压缩文件，可显著减少传输体积
    </p>
  `
}
