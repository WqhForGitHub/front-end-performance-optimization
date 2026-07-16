import { Suspense, lazy, useState } from 'react'
import LazyImage from './components/LazyImage'

// 使用 React.lazy 懒加载组件
// 只有在 Suspense 内渲染时，才会动态 import 对应的 chunk
const LazyComponent = lazy(() => import('./components/LazyComponent'))

/**
 * 资源懒加载演示
 *
 * 展示两种懒加载方式：
 * 1. 图片懒加载 - 使用 IntersectionObserver，图片进入视口才加载
 * 2. 组件懒加载 - 使用 React.lazy + Suspense，按需加载组件代码
 */
export default function App() {
  const [showLazy, setShowLazy] = useState(false)

  // 生成演示用的图片列表
  const images = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    src: `https://picsum.photos/seed/demo${i}/400/300`,
    alt: `示例图片 ${i + 1}`,
  }))

  const pageStyle: Record<string, string | number | undefined> = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const sectionStyle: Record<string, string | number | undefined> = {
    marginBottom: '40px',
  }

  const sectionTitleStyle: Record<string, string | number | undefined> = {
    fontSize: '20px',
    color: '#1976d2',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #bbdefb',
  }

  const descStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const gridStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  }

  const imageLabelStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '6px',
  }

  const buttonStyle: Record<string, string | number | undefined> = {
    padding: '10px 28px',
    fontSize: '15px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const fallbackStyle: Record<string, string | number | undefined> = {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    border: '2px dashed #bbb',
    color: '#888',
    marginTop: '16px',
  }

  const hintStyle: Record<string, string | number | undefined> = {
    fontSize: '13px',
    color: '#999',
    marginTop: '8px',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>资源懒加载</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          使用 IntersectionObserver 和 React.lazy 优化资源加载
        </p>
      </div>

      {/* 第一部分：图片懒加载 */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>1. 图片懒加载（IntersectionObserver）</h2>
        <div style={descStyle}>
          下方图片只有在滚动到视口附近时才会发起网络请求。
          请向下滚动观察骨架屏到真实图片的切换过程。
        </div>
        <div style={gridStyle}>
          {images.map((img) => (
            <div key={img.id}>
              <LazyImage src={img.src} alt={img.alt} height={220} />
              <div style={imageLabelStyle}>{img.alt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 第二部分：组件懒加载 */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>2. 组件懒加载（React.lazy + Suspense）</h2>
        <div style={descStyle}>
          下方组件使用 <code>React.lazy()</code> 进行懒加载。
          点击按钮后才会动态加载组件代码，加载过程中显示 Suspense fallback。
        </div>
        <button style={buttonStyle} onClick={() => setShowLazy(true)}>
          {showLazy ? '组件已加载' : '点击加载懒加载组件'}
        </button>
        <div style={hintStyle}>
          {showLazy
            ? '组件已加载，查看下方渲染结果'
            : '组件代码尚未加载，初始包中不包含此组件'}
        </div>
        {showLazy && (
          <Suspense fallback={<div style={fallbackStyle}>正在加载组件...</div>}>
            <LazyComponent />
          </Suspense>
        )}
      </div>
    </div>
  )
}
