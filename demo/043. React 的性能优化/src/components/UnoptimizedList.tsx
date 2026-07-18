import React from 'react'

interface Item {
  id: number
  name: string
  price: number
}

interface Props {
  items: Item[]
}

interface State {
  renderCount: number
}

/**
 * 反例：未优化的 Class 组件
 *
 * 问题：
 * 1. 继承 React.Component 而非 PureComponent
 * 2. 默认 shouldComponentUpdate 总是返回 true
 * 3. 父组件任何 re-render 都会触发本组件渲染
 */
export default class UnoptimizedList extends React.Component<Props, State> {
  state: State = { renderCount: 0 }

  // 未实现 shouldComponentUpdate，默认总是返回 true
  // shouldComponentUpdate() { return true }

  componentDidUpdate() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={{ ...h3Style, color: '#ef4444' }}>未优化（React.Component）</h3>
        <p style={descStyle}>
          默认 shouldComponentUpdate 返回 true，父组件每次 re-render 都触发本组件
        </p>
        <div style={renderStyle}>
          渲染次数：<strong style={{ color: '#ef4444' }}>{this.state.renderCount}</strong>
        </div>
        <ul style={listStyle}>
          {this.props.items.map((item) => (
            <li key={item.id} style={itemStyle}>
              <span>{item.name}</span>
              <span style={priceStyle}>¥{item.price}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', fontSize: 16 }
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#991b1b',
}
const renderStyle: React.CSSProperties = {
  marginBottom: 12,
  fontSize: 14,
}
const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
}
const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: '#fff',
  borderRadius: 4,
  marginBottom: 4,
  fontSize: 13,
}
const priceStyle: React.CSSProperties = { color: '#3b82f6', fontWeight: 600 }
