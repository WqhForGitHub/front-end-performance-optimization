import React from 'react'

interface Props {
  id?: number
}

interface State {
  renderCount: number
  id: number
}

/**
 * shouldComponentUpdate 手动优化演示
 *
 * 通过手写 shouldComponentUpdate，精细控制何时更新：
 * - 当 props.id 未变时，跳过更新
 * - 当内部 state.renderCount 变化时，更新
 */
export default class ShouldComponentUpdateDemo extends React.Component<Props, State> {
  state: State = { renderCount: 0, id: 1 }

  // 手动实现 shouldComponentUpdate
  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // 仅当 id 或 renderCount 变化时才更新
    if (nextState.id !== this.state.id) return true
    if (nextState.renderCount !== this.state.renderCount) return true
    return false
  }

  private incrementRender() {
    this.setState((s) => ({ renderCount: s.renderCount + 1 }))
  }

  private changeId() {
    this.setState((s) => ({ id: s.id + 1, renderCount: s.renderCount + 1 }))
  }

  private tryNoopUpdate() {
    // 触发 setState 但值相同，shouldComponentUpdate 会阻止 re-render
    this.setState((s) => ({ renderCount: s.renderCount }))
  }

  render() {
    return (
      <div style={cardStyle}>
        <h3 style={h3Style}>shouldComponentUpdate 手动优化演示</h3>
        <p style={descStyle}>
          通过手写 shouldComponentUpdate，精细控制何时更新；点击下方按钮观察渲染次数
        </p>
        <div style={infoStyle}>
          <span>id：{this.state.id}</span>
          <span>
            渲染次数：<strong style={{ color: '#3b82f6' }}>{this.state.renderCount}</strong>
          </span>
        </div>
        <div style={btnGroupStyle}>
          <button style={btnPrimaryStyle} onClick={() => this.changeId()}>
            修改 id（会渲染）
          </button>
          <button style={btnNormalStyle} onClick={() => this.incrementRender()}>
            仅修改 renderCount（会渲染）
          </button>
          <button style={btnWarnStyle} onClick={() => this.tryNoopUpdate()}>
            setState 相同值（不渲染）
          </button>
        </div>
        <p style={tipStyle}>
          点击「setState 相同值」不会触发渲染，因为 shouldComponentUpdate 返回 false
        </p>
      </div>
    )
  }
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  marginBottom: 24,
}
const h3Style: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#3b82f6',
  fontSize: 16,
}
const descStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 13,
  color: '#6b7280',
}
const infoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  marginBottom: 12,
  fontSize: 14,
}
const btnGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const btnNormalStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
const btnWarnStyle: React.CSSProperties = {
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
  color: '#9ca3af',
}
