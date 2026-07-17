import { useMemo, CSSProperties } from 'react'
import { ProgressiveImage } from './components/ProgressiveImage'

interface GalleryItem {
  id: number
  seed: string
  alt: string
  aspect: number
}

/**
 * 方案三：渐进式图片加载（LQIP + blur-up）演示
 * - LQIP（Low Quality Image Placeholder）：先加载一张极小的低质量占位图
 * - 主图加载完成后，平滑淡入并取消模糊，呈现"先模糊后清晰"的过渡
 * - 避免长时间白屏，提升用户感知性能与 LCP 体验
 */
export default function App() {
  // 6 张演示图，宽高比混合
  const items = useMemo<GalleryItem[]>(
    () => [
      { id: 1, seed: 'aurora', alt: '极光夜景', aspect: 16 / 9 },
      { id: 2, seed: 'lake', alt: '湖泊倒影', aspect: 4 / 3 },
      { id: 3, seed: 'canyon', alt: '峡谷风光', aspect: 16 / 9 },
      { id: 4, seed: 'waterfall', alt: '瀑布流水', aspect: 4 / 3 },
      { id: 5, seed: 'sunrise', alt: '日出云海', aspect: 16 / 9 },
      { id: 6, seed: 'meadow', alt: '草原花海', aspect: 4 / 3 }
    ],
    []
  )

  // LQIP：20px 宽，体积极小（通常几 KB），几乎瞬间加载完成
  // 主图：1600px 宽，体积较大，需要时间下载
  const buildLqip = (seed: string, aspect: number) =>
    `https://picsum.photos/seed/${seed}/20/${Math.round(20 / aspect)}?blur=2`
  const buildMain = (seed: string, aspect: number) =>
    `https://picsum.photos/seed/${seed}/1600/${Math.round(1600 / aspect)}`

  const galleryStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px'
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>方案三：渐进式图片加载（LQIP + blur-up）</h1>
        <p>
          先加载一张极小的低质量占位图（LQIP）并模糊显示，主图加载完成后平滑淡入，
          给用户即时反馈，避免长时间白屏，提升感知性能与 LCP 体验。
        </p>
      </header>

      <section className="intro-card">
        <div className="intro-row">
          <div className="intro-step">
            <div className="step-num">1</div>
            <div className="step-text">
              <strong>LQIP 即时显示</strong>
              <span>20px 占位图体积仅几 KB，几乎瞬间加载，被放大并模糊</span>
            </div>
          </div>
          <div className='intro-arrow'>{'->'}</div>
          <div className="intro-step">
            <div className="step-num">2</div>
            <div className="step-text">
              <strong>主图后台加载</strong>
              <span>1600px 主图通过 new Image() 异步预加载，不阻塞渲染</span>
            </div>
          </div>
          <div className='intro-arrow'>{'->'}</div>
          <div className="intro-step">
            <div className="step-num">3</div>
            <div className="step-text">
              <strong>淡入去模糊</strong>
              <span>主图加载完成后淡入覆盖，LQIP 淡出，呈现"模糊到清晰"过渡</span>
            </div>
          </div>
        </div>
      </section>

      <h2 className="section-title">图库演示（缩放窗口可观察效果）</h2>
      <p className="section-desc">
        每张图先显示模糊的 LQIP，主图加载完成后过渡为清晰版本。
        打开开发者工具 Network 面板，过滤 Img，可看到先下载 20px 小图再下载 1600px 大图。
      </p>

      <div style={galleryStyle}>
        {items.map((item) => (
          <ProgressiveImage
            key={item.id}
            placeholderSrc={buildLqip(item.seed, item.aspect)}
            src={buildMain(item.seed, item.aspect)}
            alt={item.alt}
            aspect={item.aspect}
            lazy
          />
        ))}
      </div>

      <section className="comparison-section">
        <h2 className="section-title">三种加载策略对比</h2>
        <p className="section-desc">
          相同的图片，三种不同的加载策略。慢速网络下差异最明显（可在 Network 面板限速）。
        </p>
        <div className="compare-grid">
          <div className="compare-item">
            <div className="compare-label bad">直接加载（白屏等待）</div>
            <div className="compare-media">
              <img
                src={buildMain('aurora', 16 / 9)}
                alt="直接加载"
                className="raw-image"
                loading="eager"
              />
            </div>
            <div className="compare-note">
              主图加载完成前完全空白，用户长时间看到空白区域，体验差。
            </div>
          </div>
          <div className="compare-item">
            <div className="compare-label mid">骨架屏占位</div>
            <div className="compare-media skeleton">
              <div className="skeleton-shimmer" />
            </div>
            <div className="compare-note">
              用 shimmer 动画占位，无内容预览，比白屏好但仍缺乏信息。
            </div>
          </div>
          <div className="compare-item">
            <div className="compare-label good">LQIP 渐进式</div>
            <div className="compare-media">
              <ProgressiveImage
                placeholderSrc={buildLqip('aurora', 16 / 9)}
                src={buildMain('aurora', 16 / 9)}
                alt="LQIP 渐进式"
                aspect={16 / 9}
                lazy={false}
                showState
              />
            </div>
            <div className="compare-note">
              立即看到模糊预览，主图加载完后平滑过渡到清晰，体验最佳。
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2>实现要点</h2>

        <h3>1. LQIP 占位图</h3>
        <p>
          LQIP 是极小尺寸（通常 20~40px 宽）的低质量图片，体积通常只有几 KB，
          几乎瞬间加载完成。可以由服务端动态生成（如图片处理服务压缩到 20px），
          也可使用 base64 内联到 HTML/CSS 中避免额外请求。
        </p>
        <pre>
          <code>{`<!-- LQIP：20px 宽，几 KB 体积 -->
<img
  src="https://picsum.photos/seed/aurora/20/11?blur=2"
  class="lqip"
  aria-hidden="true"
/>`}</code>
        </pre>

        <h3>2. blur-up 模糊过渡</h3>
        <p>
          LQIP 被放大到容器尺寸时会非常模糊。通过 CSS <code>filter: blur()</code>
          进一步模糊并加 <code>opacity</code> 过渡，主图加载完成后淡入并取消模糊。
        </p>
        <pre>
          <code>{`.lqip {
  filter: blur(20px);
  transform: scale(1.1);        /* 避免模糊边缘出现透明边 */
  transition: opacity 0.4s ease;
}
.lqip.faded {
  opacity: 0;                   /* 主图加载完成后淡出 LQIP */
}
.main-image {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.main-image.loaded {
  opacity: 1;                   /* 主图淡入 */
}`}</code>
        </pre>

        <h3>3. 主图异步预加载</h3>
        <p>
          使用 <code>new Image()</code> 在后台预加载主图，监听 <code>load</code> 事件后
          才把 <code>src</code> 写入真实 <code>&lt;img&gt;</code>，避免加载过程中
          出现闪烁。也可结合 IntersectionObserver 实现懒加载。
        </p>
        <pre>
          <code>{`const img = new Image()
img.src = mainSrc
img.addEventListener('load', () => {
  setMainReady(true)  // 触发主图淡入
})`}</code>
        </pre>

        <h3>选择建议</h3>
        <ul>
          <li>首屏 LCP 图片：可用 LQIP 提升感知速度，但注意 LCP 仍以主图加载为准</li>
          <li>图库/列表：LQIP + 懒加载组合效果最佳</li>
          <li>对感知性能要求高：LQIP 优于纯骨架屏</li>
          <li>极小图标/装饰图：无需 LQIP，直接 inline SVG 或 base64 即可</li>
          <li>类似方案：SQIP（基于 SVG 的占位）、BlurHash、 dominant-color 占位</li>
        </ul>

        <div className="note">
          提示：在 Network 面板中将网络限速为 Slow 3G，可更明显观察 LQIP 与主图
          的加载先后顺序及过渡效果。
        </div>
      </section>
    </div>
  )
}
