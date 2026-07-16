import logo from './assets/logo.svg'
import banner from './assets/banner.svg'

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>image-webpack-loader 演示</h1>
    <img src="${logo}" alt="logo" width="120" />
    <div style="margin:16px 0">
      <img src="${banner}" alt="banner" width="320" />
    </div>
    <p style="color:#888">
      打包后查看 dist/images 目录，图片已通过 image-webpack-loader 压缩。
    </p>
  `
}
