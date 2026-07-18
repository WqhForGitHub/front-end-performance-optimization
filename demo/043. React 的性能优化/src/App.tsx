import { useState } from 'react'
import UnoptimizedList from './components/UnoptimizedList'
import OptimizedList from './components/OptimizedList'
import ShouldComponentUpdateDemo from './components/ShouldComponentUpdateDemo'

export default function App() {
  const [tick, setTick] = useState(0)
  const [items] = useState([
    { id: 1, name: 'Apple', price: 5 },
    { id: 2, name: 'Banana', price: 3 },
    { id: 3, name: 'Cherry', price: 8 },
  ])

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>React 的性能优化 - 生命周期</h1>
        <p style={subtitleStyle}>
          主要集中在 shouldComponentUpdate（class 组件）与 React.memo（函数组件）
        </p>
      </header>

      <section style={controlStyle}>
        <h3 style={sectionTitleStyle}>父组件触发 re-render</h3>
        <button style={btnStyle} onClick={() => setTick((t) => t + 1)}>
          父组件 tick：{tick}
        </button>
      </section>

      <div style={gridStyle}>
        <UnoptimizedList items={items} />
        <OptimizedList items={items} />
      </div>

      <ShouldComponentUpdateDemo />

      <section style={principleStyle}>
        <h3 style={sectionTitleStyle}>shouldComponentUpdate 优化原理</h3>
        <p style={pStyle}>
          <strong>shouldComponentUpdate</strong>{' '}
          在组件接收到新的 props 或 state 时被调用，返回 false 则跳过本次 re-render。
          默认实现总是返回 true，所以需要手动优化。
        </p>
        <pre style={codeBlockStyle}>{`// Class 组件
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 仅当 id 变化时才更新
    return nextProps.id !== this.props.id
  }
  render() { return <div>{this.props.id}</div> }
}

// 等价的函数组件写法
const MyComponent = React.memo(
  (props) => <div>{props.id}</div>,
  (prev, next) => prev.id === next.id // 返回 true 表示跳过
)`}</pre>

        <p style={pStyle}>
          <strong>PureComponent</strong> 是 React 提供的内置优化基类，自动实现
          shouldComponentUpdate 对 props 和 state 做浅比较：
        </p>
        <pre style={codeBlockStyle}>{`class MyComponent extends React.PureComponent {
  // 自动浅比较 props 和 state，无需手写 shouldComponentUpdate
  render() { return <div>{this.props.id}</div> }
}`}</pre>
      </section>

      <footer style={footerStyle}>
        <p>提示：点击父组件按钮，观察两个列表的渲染次数</p>
      </footer>
    </div>
  )
}

const appStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px 16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#1f2937',
}
const headerStyle: React.CSSProperties = { marginBottom: 24 }
const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: 24, color: '#3b82f6' }
const subtitleStyle: React.CSSProperties = { margin: 0, fontSize: 14, color: '#6b7280' }
const controlStyle: React.CSSProperties = {
  padding: 16,
  background: '#f3f4f6',
  borderRadius: 8,
  marginBottom: 20,
}
const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#3b82f6',
  fontSize: 16,
}
const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
}
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  marginBottom: 24,
}
const principleStyle: React.CSSProperties = {
  padding: 20,
  background: '#ecfdf5',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
  marginBottom: 24,
}
const pStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 14,
  color: '#166534',
  lineHeight: 1.6,
}
const codeBlockStyle: React.CSSProperties = {
  background: '#1f2937',
  color: '#a7f3d0',
  padding: 16,
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'Fira Code, Consolas, monospace',
  overflow: 'auto',
  margin: '0 0 16px',
}
const footerStyle: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
  color: '#9ca3af',
  fontSize: 12,
  textAlign: 'center',
}
