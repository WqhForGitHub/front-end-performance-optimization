import { useState, useMemo, useCallback } from 'react'
import MemoDemo from './components/MemoDemo'
import UseMemoDemo from './components/UseMemoDemo'
import UseCallbackDemo from './components/UseCallbackDemo'

export default function App() {
  const [tick, setTick] = useState(0)

  // useCallback：稳定函数引用
  const handleClick = useCallback(() => {
     
    console.log('App handleClick')
  }, [])

  // useMemo：稳定对象引用
  const config = useMemo(
    () => ({
      title: '优化后的标题',
      version: '1.0.0',
    }),
    [],
  )

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>实现 React 组件的记忆</h1>
        <p style={subtitleStyle}>
          React.memo + useMemo + useCallback 三剑客，避免不必要的 re-render
        </p>
      </header>

      <section style={controlStyle}>
        <h3 style={sectionTitleStyle}>触发父组件 re-render</h3>
        <button style={btnStyle} onClick={() => setTick((t) => t + 1)}>
          父组件 tick：{tick}
        </button>
      </section>

      <MemoDemo title={config.title} onClick={handleClick} />
      <UseMemoDemo />
      <UseCallbackDemo onAction={handleClick} />

      <section style={principleStyle}>
        <h3 style={sectionTitleStyle}>React 组件记忆的原理</h3>
        <p style={pStyle}>
          <strong>1. React.memo（组件记忆）</strong>：对函数组件的 props 进行浅比较，相同则跳过渲染。
          相当于 class 组件的 PureComponent + shouldComponentUpdate。
        </p>
        <pre style={codeBlockStyle}>{`// React.memo 工作原理
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false
  return prevKeys.every(key => prev[key] === next[key])
}

const memo = (Component) => (props) => {
  const prevProps = useRef(props)
  if (shallowEqual(prevProps.current, props)) {
    return prevRender.current // 复用上次渲染结果
  }
  prevProps.current = props
  return Component(props)
}`}</pre>

        <p style={pStyle}>
          <strong>2. useMemo（值记忆）</strong>：仅在依赖变化时重新计算，否则复用上次结果。
          相当于在渲染期间做缓存。
        </p>
        <pre style={codeBlockStyle}>{`// useMemo 伪代码
function useMemo(factory, deps) {
  const prevDeps = useRef(deps)
  const prevValue = useRef()
  if (!prevValue.current || !shallowEqual(prevDeps.current, deps)) {
    prevValue.current = factory()
    prevDeps.current = deps
  }
  return prevValue.current
}`}</pre>

        <p style={pStyle}>
          <strong>3. useCallback（函数记忆）</strong>：实际上是 useMemo 的语法糖，缓存函数引用。
        </p>
        <pre style={codeBlockStyle}>{`// useCallback 等价于
const handleClick = useMemo(() => () => {
  console.log('clicked')
}, [])`}</pre>

        <p style={pStyle}>
          <strong>三剑客配合使用</strong>：React.memo 跳过组件渲染 + useMemo 稳定对象 + useCallback 稳定函数，
          才能真正避免不必要的 re-render。
        </p>
        <pre style={codeBlockStyle}>{`function Parent() {
  const handleClick = useCallback(() => {}, []) // 稳定函数
  const config = useMemo(() => ({...}), [])     // 稳定对象
  return <MemoChild onClick={handleClick} config={config} />
}

const MemoChild = memo(function Child({ onClick, config }) {
  return <div onClick={onClick}>{config.title}</div>
})`}</pre>
      </section>

      <footer style={footerStyle}>
        <p>提示：点击父组件按钮，观察各子组件的渲染次数</p>
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
