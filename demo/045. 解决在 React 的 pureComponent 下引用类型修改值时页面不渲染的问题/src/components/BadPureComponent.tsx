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
 * 反例：直接修改引用类型，PureComponent 不会触发渲染
 *
 * 问题：
 * 1. 使用 this.state.user.name = 'xxx' 直接修改
 * 2. setState 传入同一个对象引用
 * 3. PureComponent 浅比较认为 props/state 未变，跳过渲染
 * 4. 页面不更新，但 state 实际已被修改（潜在 bug）
 */
export default class BadPureComponent extends React.PureComponent<Props, State> {
  state: State = {
    user: { name: 'Alice', age: 28 },
    renderCount: 0,
  }

  // 直接修改引用类型 - 错误写法
  handleMutate = () => {
    // ❌ 直接修改 state 中的对象，引用未变
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.user.name = 'Bob ' + Date.now()
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.user.age = Math.floor(Math.random() * 50) + 18
    // ❌ setState 传入同一引用，PureComponent 浅比较返回 true，跳过渲染
    this.setState({ user: this.state.user })
  }

  // 强制更新（不推荐，仅用于演示）
  handleForceUpdate = () => {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.user.name = 'Bob ' + Date.now()
    this.forceUpdate()
  }

  componentDidUpdate() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={{ ...h3Style, color: '#ef4444' }}>
          反例：直接修改引用类型（不渲染）
        </h3>
        <p style={descStyle}>
          点击「直接修改」按钮，user 内部值已变但页面不更新（PureComponent 浅比较跳过渲染）
        </p>
        <div style={infoStyle}>
          <span>name：{this.state.user.name}</span>
          <span>age：{this.state.user.age}</span>
          <span>
            渲染次数：<strong style={{ color: '#ef4444' }}>{this.state.renderCount}</strong>
          </span>
        </div>
        <button style={badBtnStyle} onClick={this.handleMutate}>
          直接修改（不渲染）
        </button>
        <button style={warnBtnStyle} onClick={this.handleForceUpdate}>
          forceUpdate（不推荐）
        </button>
        <p style={tipStyle}>
          提示：点击「直接修改」后，state 内部值已变（可在 React DevTools 看到），但页面未更新
        </p>
      </div>
    )
  }
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 8,
  marginBottom: 16,
}
const h3Style: React.CSSProperties = { margin: '0 0 8px', fontSize: 16 }
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#991b1b',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 12,
  fontSize: 14,
}
const badBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  marginRight: 8,
}
const warnBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#f59e0b',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const tipStyle: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 12,
  color: '#991b1b',
}
