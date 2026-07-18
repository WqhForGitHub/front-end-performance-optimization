export default function HomePage() {
  return (
    <div style={containerStyle}>
      <section style={heroStyle}>
        <h2 style={h2Style}>首屏关键内容（同步加载）</h2>
        <p style={descStyle}>
          首页内容是首屏 LCP 的关键元素，必须快速渲染。
        </p>
        <div style={ctaStyle}>
          <button style={btnPrimaryStyle}>立即开始</button>
          <button style={btnSecondaryStyle}>了解更多</button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 style={h3Style}>SPA 首屏优化方案</h3>
        <ul style={listStyle}>
          <li>1. 路由懒加载：首屏只加载首页代码</li>
          <li>2. 骨架屏：避免白屏，提升感知性能</li>
          <li>3. 代码分割：把 vendor 分成多个 chunk</li>
          <li>4. 资源预连接：&lt;link rel="preconnect"&gt;</li>
          <li>5. hover 预加载：用户 hover 链接时预加载</li>
          <li>6. SSR/SSG：服务端直出 HTML（生产环境）</li>
        </ul>
      </section>
    </div>
  )
}

const containerStyle: React.CSSProperties = { padding: 0 }
const heroStyle: React.CSSProperties = {
  padding: '40px 24px',
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  color: '#fff',
  borderRadius: 12,
  marginBottom: 24,
}
const h2Style: React.CSSProperties = { margin: '0 0 12px', fontSize: 28 }
const descStyle: React.CSSProperties = { margin: '0 0 24px', fontSize: 16, opacity: 0.9 }
const ctaStyle: React.CSSProperties = { display: 'flex', gap: 12 }
const btnPrimaryStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#fff',
  color: '#3b82f6',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: 'transparent',
  color: '#fff',
  border: '1px solid #fff',
  borderRadius: 6,
  fontSize: 14,
  cursor: 'pointer',
}
const h3Style: React.CSSProperties = { margin: '0 0 12px', color: '#3b82f6', fontSize: 18 }
const listStyle: React.CSSProperties = {
  lineHeight: 2,
  fontSize: 14,
  color: '#4b5563',
  paddingLeft: 20,
}
