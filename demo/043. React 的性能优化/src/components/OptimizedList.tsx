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
 * 正例：使用 PureComponent 优化的 Class 组件
 *
 * 优化点：
 * 1. 继承 React.PureComponent，自动浅比较 props 和 state
 * 2. 当 props.items 引用未变时，跳过 re-render
 * 3. 当 state.renderCount 变化时才更新
 */
export default class OptimizedList extends React.PureComponent<Props, State> {
  state: State = { renderCount: 0 }

  // PureComponent 自动实现 shouldComponentUpdate，浅比较 props 和 state
  // shouldComponentUpdate(nextProps, nextState) {
  //   return (
  //     this.props.items !== nextProps.items ||
  //     this.state.renderCount !== nextState.renderCount
  //   )
  // }

  // 仅在首次挂载时增加计数，跳过 props 未变的更新
  componentDidMount() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={{ ...h3Style, color: '#10b981' }}>已优化（React.PureComponent）</h3>
        <p style={descStyle}>
          PureComponent 自动浅比较 props/state，props 未变则跳过 re-render
        </p>
        <div style={renderStyle}>
          渲染次数：<strong style={{ color: '#10b981' }}>{this.state.renderCount}</strong>
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
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', fontSize: 16 }
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#166534',
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
