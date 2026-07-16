/**
 * 图片压缩优化演示入口
 *
 * 导入 SVG 图片文件，演示 image-webpack-loader 在构建时压缩图片。
 * 小于 8KB 的图片会被内联为 base64，大于 8KB 的图片会输出为独立文件。
 */
import logoSrc from './assets/logo.svg'
import bannerSrc from './assets/banner.svg'

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>图片压缩优化演示</h1>
    <p>使用 image-webpack-loader 在构建时压缩图片</p>

    <h2>Logo（SVG）</h2>
    <img src="${logoSrc}" alt="Logo" width="120" height="120" />
    <p style="color: #999;">SVG 图片通过 svgo 优化，移除冗余属性和注释</p>

    <h2>Banner（SVG）</h2>
    <img src="${bannerSrc}" alt="Banner" width="400" height="120" />
    <p style="color: #999;">SVG 图片通过 svgo 优化，减小文件体积</p>

    <h2>优化说明</h2>
    <ul style="color: #666; line-height: 1.8;">
      <li>JPEG/PNG: 使用 mozjpeg/pngquant/optipng 压缩</li>
      <li>SVG: 使用 svgo 移除冗余属性、注释、元数据</li>
      <li>GIF: 使用 gifsicle 优化</li>
      <li>WebP: 使用 webp 编码器压缩</li>
      <li>小于 8KB 的图片自动内联为 base64</li>
      <li>大于 8KB 的图片输出为独立文件，带 hash 缓存标识</li>
    </ul>
  `
}
