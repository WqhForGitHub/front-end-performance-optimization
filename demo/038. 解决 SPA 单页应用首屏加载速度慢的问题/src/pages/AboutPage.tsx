export default function AboutPage() {
  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>关于我们（懒加载）</h2>
      <p style={descStyle}>
        本页面通过 React.lazy 懒加载，首屏不会下载此 chunk。
      </p>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={h3Style}>团队</h3>
          <p style={pStyle}>由资深工程师组成</p>
        </div>
        <div style={cardStyle}>
          <h3 style={h3Style}>愿景</h3>
          <p style={pStyle}>打造极致用户体验</p>
        </div>
        <div style={cardStyle}>
          <h3 style={h3Style}>使命</h3>
          <p style={pStyle}>让前端更高效</p>
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = { padding: 0 }
const h2Style: React.CSSProperties = { margin: '0 0 16px', color: '#3b82f6', fontSize: 20 }
const descStyle: React.CSSProperties = { margin: '0 0 24px', color: '#6b7280', fontSize: 14 }
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
}
const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', color: '#3b82f6', fontSize: 15 }
const pStyle: React.CSSProperties = { margin: 0, fontSize: 13, color: '#6b7280' }
