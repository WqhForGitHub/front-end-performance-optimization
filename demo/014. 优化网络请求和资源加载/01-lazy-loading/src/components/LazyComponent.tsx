/**
 * 懒加载组件
 *
 * 这个组件通过 React.lazy + Suspense 进行懒加载，
 * 只有在用户点击"加载组件"按钮后才会被请求和执行。
 *
 * 模拟一个较重的组件（包含较多内容），展示懒加载的效果：
 * - 减少初始包体积
 * - 按需加载，提升首屏速度
 */
export default function LazyComponent() {
  const features = [
    { title: '按需加载', desc: '只有用户需要时才加载组件代码' },
    { title: '减小首屏体积', desc: '将不常用的代码拆分为独立 chunk' },
    { title: 'Suspense 占位', desc: '加载过程中显示 fallback 内容' },
    { title: '提升用户体验', desc: '首屏加载更快，交互更流畅' },
  ]

  const containerStyle: Record<string, string | number | undefined> = {
    padding: '24px',
    backgroundColor: '#e8f5e9',
    borderRadius: '12px',
    border: '2px solid #4caf50',
    marginTop: '16px',
  }

  const titleStyle: Record<string, string | number | undefined> = {
    margin: '0 0 16px 0',
    color: '#2e7d32',
    fontSize: '20px',
  }

  const listStyle: Record<string, string | number | undefined> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '0',
    listStyle: 'none',
    margin: '0',
  }

  const itemStyle: Record<string, string | number | undefined> = {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
  }

  const itemTitleStyle: Record<string, string | number | undefined> = {
    margin: '0 0 4px 0',
    fontSize: '15px',
    color: '#1b5e20',
    fontWeight: 'bold',
  }

  const itemDescStyle: Record<string, string | number | undefined> = {
    margin: '0',
    fontSize: '13px',
    color: '#555',
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>懒加载组件已加载成功</h3>
      <p style={{ margin: '0 0 16px 0', color: '#555', fontSize: '14px' }}>
        此组件通过 <code>React.lazy()</code> 懒加载，只有点击按钮后才会请求对应的 JS chunk。
      </p>
      <ul style={listStyle}>
        {features.map((item, i) => (
          <li key={i} style={itemStyle}>
            <h4 style={itemTitleStyle}>{item.title}</h4>
            <p style={itemDescStyle}>{item.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
