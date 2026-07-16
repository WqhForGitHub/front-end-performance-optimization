/**
 * CSS 优化演示入口
 *
 * 在 TypeScript 中导入多个 CSS 文件，
 * 演示 MiniCssExtractPlugin 将 CSS 抽取为独立文件，
 * 以及 CssMinimizerPlugin 对 CSS 进行压缩。
 */
import './styles/main.css'
import './styles/theme.css'

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <div class="container">
      <h1 class="title">CSS 抽取与压缩演示</h1>
      <p class="description">
        本页面的样式通过 MiniCssExtractPlugin 抽取为独立的 CSS 文件，
        并通过 CssMinimizerPlugin 进行压缩优化。
      </p>
      <div class="card">
        <h2 class="card-title">优化效果</h2>
        <ul class="feature-list">
          <li>CSS 独立文件，可被浏览器并行加载</li>
          <li>移除注释和空白字符</li>
          <li>精简颜色值和简写属性</li>
          <li>利用 contenthash 实现长效缓存</li>
        </ul>
      </div>
    </div>
  `
}
