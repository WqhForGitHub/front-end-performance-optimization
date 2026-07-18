import { useState, CSSProperties } from 'react'
import { ResponsiveImage } from './components/ResponsiveImage'
import { PictureArtDirection } from './components/PictureArtDirection'
import { CodeBlock } from './components/CodeBlock'
import { responsiveImages, buildPicUrl } from './data/images'

type ViewMode = 'srcset' | 'picture' | 'compare'

const VIEW_OPTIONS: { value: ViewMode; label: string; desc: string }[] = [
  { value: 'srcset', label: 'srcset + sizes', desc: '同一图片的不同分辨率版本' },
  { value: 'picture', label: '<picture> 艺术指导', desc: '不同视口使用不同构图' },
  { value: 'compare', label: '对比演示', desc: '响应式 vs 固定尺寸对比' },
]

const SRCSET_CODE = `<img
  src="https://picsum.photos/seed/mountain/800/450"
  srcset="
    https://picsum.photos/seed/mountain/400/225 400w,
    https://picsum.photos/seed/mountain/800/450 800w,
    https://picsum.photos/seed/mountain/1200/675 1200w,
    https://picsum.photos/seed/mountain/1600/900 1600w,
    https://picsum.photos/seed/mountain/2000/1125 2000w
  "
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="山景照片"
  loading="lazy"
/>`

const PICTURE_CODE = `<picture>
  <!-- 宽屏：使用 16:9 宽幅构图 -->
  <source
    media="(min-width: 1024px)"
    srcset="https://picsum.photos/seed/mountain/1600/900"
  />
  <!-- 平板：使用 4:3 构图 -->
  <source
    media="(min-width: 640px)"
    srcset="https://picsum.photos/seed/mountain/800/600"
  />
  <!-- 手机：使用 1:1 裁切，突出主体 -->
  <source
    media="(max-width: 639px)"
    srcset="https://picsum.photos/seed/mountain/600/600"
  />
  <!-- 降级 -->
  <img
    src="https://picsum.photos/seed/mountain/800/600"
    alt="山景照片"
    loading="lazy"
  />
</picture>`

const SIZES_CODE = `/* sizes 不是 CSS，而是给浏览器的提示：
 * 告诉浏览器这张图在不同视口下占用多少视窗宽度。
 * 浏览器据此 + DPR 决定从 srcset 中下载哪一张。
 */
sizes="(max-width: 600px) 100vw,    /* 手机：占满整屏 */
       (max-width: 1200px) 50vw,   /* 平板：两列布局 */
       33vw"                       /* 桌面：三列布局 */`

export default function App() {
  const [view, setView] = useState<ViewMode>('srcset')

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px',
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>方案二：响应式图片（srcset / sizes / picture）</h1>
        <p>
          让浏览器根据当前视口与 DPR 选择最合适尺寸的图片， 避免在小屏幕上下载 4K
          大图，节省带宽并加快 LCP；
          <code>&lt;picture&gt;</code> 还可做艺术指导（art direction）。
        </p>
      </header>

      <section className="control-panel">
        <div className="control-group">
          <label>演示模式</label>
          <div className="toggle">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={view === opt.value ? 'active' : ''}
                onClick={() => setView(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="mode-desc">
        当前模式：<strong>{VIEW_OPTIONS.find((o) => o.value === view)?.label}</strong>
        {' - '}
        {VIEW_OPTIONS.find((o) => o.value === view)?.desc}
      </p>

      {view === 'srcset' && (
        <section>
          <h2 className="section-title">srcset + sizes：同一图片的不同分辨率</h2>
          <p className="section-desc">
            浏览器会根据视口宽度与设备像素比 (DPR) 自动选择最合适的图片源，
            只下载一张图片。打开开发者工具 Network 面板，缩放窗口可观察下载的图片尺寸变化。
          </p>
          <div style={containerStyle}>
            {responsiveImages.map((img) => (
              <ResponsiveImage
                key={img.id}
                seed={img.seed}
                alt={img.alt}
                widths={img.widths}
                aspect={img.aspect}
              />
            ))}
          </div>
          <div className="code-section">
            <h3>对应 HTML 写法</h3>
            <CodeBlock title="srcset + sizes" code={SRCSET_CODE} />
            <CodeBlock title="sizes 属性说明" code={SIZES_CODE} language="text" />
          </div>
        </section>
      )}

      {view === 'picture' && (
        <section>
          <h2 className="section-title">&lt;picture&gt;：艺术指导（Art Direction）</h2>
          <p className="section-desc">
            不同视口下使用<strong>完全不同的裁切/构图</strong>，而不只是分辨率不同。
            例如手机端裁切成 1:1 突出主体，桌面端用 16:9 展示完整场景。
            缩放浏览器窗口可见下方图片构图变化。
          </p>
          <div style={containerStyle}>
            <PictureArtDirection seed="mountain" alt="山景艺术指导" />
            <PictureArtDirection seed="ocean" alt="海洋艺术指导" />
            <PictureArtDirection seed="forest" alt="森林艺术指导" />
          </div>
          <div className="code-section">
            <h3>对应 HTML 写法</h3>
            <CodeBlock title="<picture> + <source media>" code={PICTURE_CODE} />
          </div>
        </section>
      )}

      {view === 'compare' && (
        <section>
          <h2 className="section-title">对比：固定大图 vs 响应式图片</h2>
          <p className="section-desc">
            左侧固定加载 2000px 大图，右侧根据视口自适应。在小屏上对比尤其明显，
            右侧下载的图片体积远小于左侧。打开 Network 面板对比下载体积。
          </p>
          <div className="compare-grid">
            <div className="compare-item">
              <div className="compare-label bad">固定 2000px 大图</div>
              <div className="compare-media">
                <img src={buildPicUrl('desert', 2000, 16 / 9)} alt="固定大图" loading="lazy" />
              </div>
              <div className="compare-note">
                无论视口多大，都下载 2000px 完整大图，移动端浪费带宽。
              </div>
            </div>
            <div className="compare-item">
              <div className="compare-label good">响应式 srcset</div>
              <div className="compare-media">
                <ResponsiveImage
                  seed="desert"
                  alt="响应式图片"
                  widths={[400, 800, 1200, 1600, 2000]}
                  aspect={16 / 9}
                  sizes="(max-width: 600px) 100vw, 50vw"
                />
              </div>
              <div className="compare-note">
                手机只下载 400w，平板下载 800w，桌面才下载更大版本。
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="info-section">
        <h2>核心概念</h2>

        <h3>1. srcset：提供多个候选源</h3>
        <p>
          通过 <code>srcset=&quot;url 400w, url 800w, ...&quot;</code>{' '}
          提供同一图片的不同分辨率版本， 浏览器自行选择最合适的下载。
          <strong>
            关键字 <code>w</code> 描述图片实际宽度
          </strong>
          ， 不是视口宽度。
        </p>

        <h3>2. sizes：告诉浏览器图片显示尺寸</h3>
        <p>
          <code>sizes</code> 是给浏览器的提示，描述图片在不同视口下占用多少视窗宽度。 浏览器据此结合
          DPR 决定下载哪一张。<strong>必须配合 srcset 使用</strong>，
          否则浏览器无法判断候选源对应的实际宽度。
        </p>
        <pre>
          <code>{`<!-- 例：响应式网格中的图片 -->
<img
  src="photo-800w.jpg"
  srcset="photo-400w.jpg 400w, photo-800w.jpg 800w, photo-1200w.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="..."
/>`}</code>
        </pre>

        <h3>3. &lt;picture&gt; + &lt;source&gt;：艺术指导</h3>
        <p>
          当不同视口需要<strong>不同的裁切/构图</strong>时（如手机端裁成正方形突出主体）， 使用{' '}
          <code>&lt;picture&gt;</code> + <code>&lt;source media=&quot;...&quot;&gt;</code>。
          它还可用于提供不同格式（WebP / AVIF 优先，JPEG 降级）。
        </p>
        <pre>
          <code>{`<picture>
  <source type="image/avif" srcset="photo.avif" />
  <source type="image/webp" srcset="photo.webp" />
  <img src="photo.jpg" alt="..." />
</picture>`}</code>
        </pre>

        <h3>选择建议</h3>
        <ul>
          <li>
            同一图片不同分辨率：用 <code>srcset</code> + <code>sizes</code>
          </li>
          <li>
            不同视口不同构图：用 <code>&lt;picture&gt;</code> + <code>&lt;source media&gt;</code>
          </li>
          <li>
            不同格式降级：用 <code>&lt;picture&gt;</code> + <code>&lt;source type&gt;</code>
          </li>
          <li>
            务必设置 <code>width</code> / <code>height</code> 防止 CLS（布局抖动）
          </li>
          <li>
            配合 <code>loading=&quot;lazy&quot;</code> 进一步优化非首屏图片
          </li>
        </ul>

        <div className="note">
          提示：打开浏览器开发者工具 Network 面板，过滤 Img，缩放窗口或刷新页面，
          可看到响应式图片实际下载的文件尺寸与固定大图的差异。
        </div>
      </section>
    </div>
  )
}
