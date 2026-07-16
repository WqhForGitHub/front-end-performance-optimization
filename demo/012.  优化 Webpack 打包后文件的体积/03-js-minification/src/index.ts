/**
 * JS 压缩优化演示入口
 *
 * 此文件包含 console.log、注释等内容，
 * 在开启 terser 压缩后这些内容会被移除，从而减小产物体积。
 */
import { Calculator, formatNumber } from './utils/calculator'

// 这些 console.log 在压缩后会被移除
console.log('应用启动')
console.debug('调试信息')
console.info('信息日志')

// 创建计算器实例
const calculator = new Calculator('高级计算器')

// 执行一些计算
const addResult = calculator.add(100, 200)
const subtractResult = calculator.subtract(500, 300)
const multiplyResult = calculator.multiply(25, 4)
const divideResult = calculator.divide(1000, 8)

console.log('加法结果:', addResult)
console.log('减法结果:', subtractResult)
console.log('乘法结果:', multiplyResult)
console.log('除法结果:', divideResult)

// 使用格式化函数
const formattedNumber = formatNumber(1234567.891)
console.log('格式化数字:', formattedNumber)

// 渲染到页面
const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>JS 压缩优化演示</h1>
    <p>计算器名称: ${calculator.getName()}</p>
    <p>加法: 100 + 200 = ${addResult}</p>
    <p>减法: 500 - 300 = ${subtractResult}</p>
    <p>乘法: 25 × 4 = ${multiplyResult}</p>
    <p>除法: 1000 ÷ 8 = ${divideResult}</p>
    <p>格式化数字: ${formattedNumber}</p>
    <p style="color: #999;">console.log 和注释在压缩后会被移除</p>
  `
}
