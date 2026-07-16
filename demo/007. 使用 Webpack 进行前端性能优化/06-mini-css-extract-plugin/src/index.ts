import './styles/main.css'
import './styles/theme.css'

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <div class="card">
      <h1 class="card__title">mini-css-extract-plugin 演示</h1>
      <p class="card__desc">
        CSS 已被抽取为独立文件，并在生产模式下压缩。
      </p>
      <button class="btn btn--primary">主要按钮</button>
      <button class="btn btn--ghost">幽灵按钮</button>
    </div>
    <p style="color:#888;margin-top:16px">
      打开 dist/css 目录可看到抽取并压缩后的 CSS 文件。
    </p>
  `
}
