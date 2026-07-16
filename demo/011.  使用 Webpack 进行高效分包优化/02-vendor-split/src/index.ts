/**
 * 应用入口
 *
 * 引入数据处理工具（内部使用 lodash）。
 * 构建后产出两个 chunk：
 * - vendors.[hash].js：包含 lodash 第三方库代码
 * - main.[hash].js：包含业务代码（index.ts + data-processor.ts）
 */
import { generateData, paginateData, mergePages, sumValues } from './utils/data-processor'
import { random } from 'lodash'

const app = document.getElementById('app')
if (app) {
  // 生成 25 条数据
  const data = generateData(25)
  // 每页 10 条进行分页
  const pages = paginateData(data, 10)
  // 合并回来
  const merged = mergePages(pages)
  // 计算总和
  const total = sumValues(merged)

  app.innerHTML = `
    <h1>第三方依赖分离示例</h1>
    <p>生成数据：${data.length} 条</p>
    <p>分页数量：${pages.length} 页（每页 10 条）</p>
    <p>合并后：${merged.length} 条</p>
    <p>数值总和：${total}</p>
    <p>随机数（来自 lodash）：${random(1, 100)}</p>
    <hr />
    <p>构建产物中 lodash 被分离到独立的 <code>vendors.[hash].js</code> 中。</p>
  `
}

console.log('第三方依赖分离示例已加载')
