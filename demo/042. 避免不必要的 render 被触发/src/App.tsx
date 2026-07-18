import { useState, useMemo, useCallback } from 'react'
import BadCounter from './components/BadCounter'
import GoodCounter from './components/GoodCounter'

export default function App() {
  const [appTick, setAppTick] = useState(0)
  const [text, setText] = useState('')

  // useCallback：稳定函数引用，避免子组件因函数变化而 re-render
  const onGoodAction = useCallback(() => {
     
    console.log('Good action triggered')
  }, [])

  // useMemo：稳定对象引用
  const goodConfig = useMemo(
    () => ({
      label: '优化后的计数器',
      color: '#3b82f6',
    }),
    [],
  )

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>避免不必要的 render 被触发</h1>
        <p style={subtitleStyle}>
          React.memo + useCallback + useMemo + 状态下放 + 比较函数
        </p>
      </header>

      <section style={controlStyle}>
        <h3 style={sectionTitleStyle}>父组件触发 re-render</h3>
        <p style={sectionDescStyle}>
          点击下方按钮触发父组件 re-render，观察两个子组件的渲染次数差异
        </p>
        <button style={btnStyle} onClick={() => setAppTick((t) => t + 1)}>
          父组件 tick：{appTick}
        </button>
        <input
          style={inputStyle}
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          placeholder="输入文字也会触发父组件 re-render"
        />
      </section>

      <div style={gridStyle}>
        <BadCounter />
        <GoodCounter onAction={onGoodAction} config={goodConfig} />
      </div>

      <section style={principleStyle}>
        <h3 style={sectionTitleStyle}>优化原理</h3>
        <ul style={listStyle}>
          <li>
            <strong>1. React.memo</strong>：对组件 props 进行浅比较，相同则跳过渲染
          </li>
          <li>
            <strong>2. useCallback</strong>：稳定函数引用，避免函数每次重新创建
          </li>
          <li>
            <strong>3. useMemo</strong>：稳定对象/数组引用，避免每次重新创建
          </li>
          <li>
            <strong>4. 状态下放</strong>：把只影响子组件的状态下放到子组件内部
          </li>
          <li>
            <strong>5. 自定义比较函数</strong>：React.memo 第二个参数精细控制
          </li>
          <li>
            <strong>6. 状态合并</strong>：用 useReducer 替代多个 useState
          </li>
        </ul>
      </section>

      <footer style={footerStyle}>
        <p>提示：点击父组件按钮，观察子组件渲染次数的变化</p>
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
  padding: 20,
  background: '#f3f4f6',
  borderRadius: 8,
  marginBottom: 20,
}
const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#3b82f6',
  fontSize: 16,
}
const sectionDescStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#6b7280',
  fontSize: 13,
}
const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  marginRight: 12,
}
const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
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
const listStyle: React.CSSProperties = {
  lineHeight: 2,
  fontSize: 14,
  color: '#166534',
  paddingLeft: 20,
  margin: 0,
}
const footerStyle: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
  color: '#9ca3af',
  fontSize: 12,
  textAlign: 'center',
}
