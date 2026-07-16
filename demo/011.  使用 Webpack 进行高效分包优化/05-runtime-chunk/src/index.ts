/**
 * 应用入口
 *
 * 引入数学工具模块进行计算。
 * 构建后产出三个 chunk：
 * - runtime.[hash].js：Webpack 运行时代码（模块加载、chunk 映射等）
 * - vendors.[hash].js：第三方依赖代码
 * - main.[hash].js：业务代码（index.ts + utils/math.ts）
 *
 * 当业务代码变更时，只有 main 的 contenthash 会变化，
 * runtime 和 vendors 的缓存仍然有效。
 */
import {
  add,
  subtract,
  multiply,
  divide,
  factorial,
  fibonacci,
  isPrime
} from './utils/math'

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>运行时分离示例</h1>
    <table border="1" cellpadding="8" style="border-collapse:collapse;">
      <tr><td>加法</td><td>1 + 2 = ${add(1, 2)}</td></tr>
      <tr><td>减法</td><td>10 - 3 = ${subtract(10, 3)}</td></tr>
      <tr><td>乘法</td><td>3 × 4 = ${multiply(3, 4)}</td></tr>
      <tr><td>除法</td><td>20 ÷ 5 = ${divide(20, 5)}</td></tr>
      <tr><td>阶乘</td><td>5! = ${factorial(5)}</td></tr>
      <tr><td>斐波那契</td><td>fib(10) = ${fibonacci(10)}</td></tr>
      <tr><td>质数判断</td><td>17 是质数？${isPrime(17) ? '是' : '否'}</td></tr>
    </table>
    <hr />
    <p>构建产物被分离为三个 chunk：</p>
    <ul>
      <li><code>runtime.[hash].js</code>：运行时代码</li>
      <li><code>vendors.[hash].js</code>：第三方依赖</li>
      <li><code>main.[hash].js</code>：业务代码</li>
    </ul>
  `
}

console.log('运行时分离示例已加载')
