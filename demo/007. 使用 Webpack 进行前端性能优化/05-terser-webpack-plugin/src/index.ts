import { chunk } from 'lodash'

/**
 * 计算器：演示会被 terser 压缩的代码
 * 压缩后变量名会被缩短，console.log 会被移除
 */
class Calculator {
  private readonly defaultValue: number

  constructor(defaultValue: number = 0) {
    this.defaultValue = defaultValue
  }

  add(a: number, b: number): number {
    console.log('add called', a, b)
    return a + b + this.defaultValue
  }

  multiply(a: number, b: number): number {
    console.log('multiply called', a, b)
    return a * b
  }
}

const calc = new Calculator(10)
const groups = chunk([1, 2, 3, 4, 5, 6], 2)
const sumOfGroups = groups
  .map((g) => calc.add(g[0] ?? 0, g[1] ?? 0))
  .reduce((acc, n) => acc + n, 0)

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>terser-webpack-plugin 演示</h1>
    <p>分组：${JSON.stringify(groups)}</p>
    <p>每组和：${sumOfGroups}</p>
    <p style="color:#888">
      产物中的 console.log 已被 terser 移除，变量名被压缩，
      打开 dist/bundle.js 可看到压缩后的代码。
    </p>
  `
}

console.log('这行日志在生产构建中会被 terser 移除')
