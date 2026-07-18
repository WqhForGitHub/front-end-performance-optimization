import React from 'react'

interface Item {
  id: number
  name: string
  active: boolean
}

interface Props {}

interface State {
  items: Item[]
  renderCount: number
}

/**
 * 数组的不可变更新演示
 *
 * 数组也是引用类型，直接 push/splice 不会触发渲染
 * 必须使用返回新数组的方法：concat、map、filter、slice
 * 或使用展开运算符 [...arr, newItem]
 */
export default class ImmutableUpdate extends React.PureComponent<Props, State> {
  state: State = {
    items: [
      { id: 1, name: 'Item 1', active: true },
      { id: 2, name: 'Item 2', active: false },
      { id: 3, name: 'Item 3', active: true },
    ],
    renderCount: 0,
  }

  // ❌ 直接 push（不会触发渲染）
  handleBadAdd = () => {
    this.state.items.push({ id: Date.now(), name: 'New Item', active: true })
    this.setState({ items: this.state.items })
  }

  // ✅ 使用展开运算符（触发渲染）
  handleGoodAdd = () => {
    this.setState((state) => ({
      items: [...state.items, { id: Date.now(), name: 'New Item', active: true }],
    }))
  }

  // ✅ 使用 concat（触发渲染）
  handleConcatAdd = () => {
    this.setState((state) => ({
      items: state.items.concat({ id: Date.now(), name: 'Concat Item', active: true }),
    }))
  }

  // ✅ 使用 map 修改某项（触发渲染）
  handleToggleFirst = () => {
    this.setState((state) => ({
      items: state.items.map((item, i) =>
        i === 0 ? { ...item, active: !item.active } : item,
      ),
    }))
  }

  // ✅ 使用 filter 删除（触发渲染）
  handleRemoveLast = () => {
    this.setState((state) => ({
      items: state.items.filter((_, i, arr) => i < arr.length - 1),
    }))
  }

  componentDidUpdate() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={{ ...h3Style, color: '#3b82f6' }}>数组的不可变更新</h3>
        <p style={descStyle}>
          数组也是引用类型，必须使用返回新数组的方法更新
        </p>
        <div style={infoStyle}>
          <span>数组长度：{this.state.items.length}</span>
          <span>
            渲染次数：<strong style={{ color: '#3b82f6' }}>{this.state.renderCount}</strong>
          </span>
        </div>
        <ul style={listStyle}>
          {this.state.items.map((item) => (
            <li key={item.id} style={itemStyle}>
              <span>{item.name}</span>
              <span style={itemActiveStyle}>
                {item.active ? '激活' : '未激活'}
              </span>
            </li>
          ))}
        </ul>
        <div style={btnGroupStyle}>
          <button style={badBtnStyle} onClick={this.handleBadAdd}>
            直接 push（不渲染）
          </button>
          <button style={goodBtnStyle} onClick={this.handleGoodAdd}>
            展开运算符添加
          </button>
          <button style={goodBtnStyle} onClick={this.handleConcatAdd}>
            concat 添加
          </button>
          <button style={toggleBtnStyle} onClick={this.handleToggleFirst}>
            map 切换首项
          </button>
          <button style={removeBtnStyle} onClick={this.handleRemoveLast}>
            filter 删除末项
          </button>
        </div>
      </div>
    )
  }
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', fontSize: 16 }
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#1e40af',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  marginBottom: 12,
  fontSize: 14,
}
const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 12px',
}
const itemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 12px',
  background: '#fff',
  borderRadius: 4,
  marginBottom: 4,
  fontSize: 13,
}
const itemActiveStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
}
const btnGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}
const badBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}
const goodBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}
const toggleBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#f59e0b',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}
const removeBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#8b5cf6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}
