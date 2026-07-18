import React from 'react'

interface User {
  name: string
  age: number
}

interface Props {}

interface State {
  user: User
  renderCount: number
}

/**
 * 正例：使用展开运算符创建新对象，PureComponent 触发渲染
 *
 * 解决方案：
 * 1. 使用 { ...obj, key: value } 展开运算符
 * 2. 每次更新都创建新对象，引用变化
 * 3. PureComponent 浅比较发现引用不同，触发渲染
 */
export default class GoodPureComponent extends React.PureComponent<Props, State> {
  state: State = {
    user: { name: 'Alice', age: 28 },
    renderCount: 0,
  }

  // 使用展开运算符创建新对象 - 正确写法
  handleSpread = () => {
    // ✅ 创建新对象，引用变化，触发渲染
    this.setState((state) => ({
      user: {
        ...state.user,
        name: 'Bob ' + Date.now(),
        age: Math.floor(Math.random() * 50) + 18,
      },
    }))
  }

  // 使用 Object.assign - 正确写法
  handleAssign = () => {
    // ✅ Object.assign 第一个参数是空对象，返回新对象
    this.setState((state) => ({
      user: Object.assign({}, state.user, {
        name: 'Charlie ' + Date.now(),
        age: Math.floor(Math.random() * 50) + 18,
      }),
    }))
  }

  componentDidUpdate() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={{ ...h3Style, color: '#10b981' }}>
          正例：使用展开运算符创建新对象（正常渲染）
        </h3>
        <p style={descStyle}>
          点击下方按钮，每次创建新对象，PureComponent 检测到引用变化触发渲染
        </p>
        <div style={infoStyle}>
          <span>name：{this.state.user.name}</span>
          <span>age：{this.state.user.age}</span>
          <span>
            渲染次数：<strong style={{ color: '#10b981' }}>{this.state.renderCount}</strong>
          </span>
        </div>
        <button style={spreadBtnStyle} onClick={this.handleSpread}>
          展开运算符更新
        </button>
        <button style={assignBtnStyle} onClick={this.handleAssign}>
          Object.assign 更新
        </button>
        <p style={tipStyle}>
          提示：展开运算符和 Object.assign 都会创建新对象，引用变化触发渲染
        </p>
      </div>
    )
  }
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', fontSize: 16 }
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#166534',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 12,
  fontSize: 14,
}
const spreadBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  marginRight: 8,
}
const assignBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const tipStyle: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 12,
  color: '#166534',
}
