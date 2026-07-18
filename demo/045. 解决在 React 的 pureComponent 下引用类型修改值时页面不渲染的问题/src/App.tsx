import { useState } from 'react'
import BadPureComponent from './components/BadPureComponent'
import GoodPureComponent from './components/GoodPureComponent'
import ImmutableUpdate from './components/ImmutableUpdate'

export default function App() {
  const [tick, setTick] = useState(0)

  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          解决 PureComponent 下引用类型修改值时页面不渲染的问题
        </h1>
        <p style={subtitleStyle}>
 PureComponent 浅比较机制：直接修改引用类型内部值，引用不变，跳过渲染
        </p>
      </header>

      <section style={controlStyle}>
        <h3 style={sectionTitleStyle}>触发父组件 re-render</h3>
        <button style={btnStyle} onClick={() => setTick((t) => t + 1)}>
          父组件 tick：{tick}
        </button>
      </section>

      <BadPureComponent />
      <GoodPureComponent />
      <ImmutableUpdate />

      <section style={principleStyle}>
        <h3 style={sectionTitleStyle}>问题原因与解决方案</h3>
        <p style={pStyle}>
          <strong>问题原因</strong>：PureComponent 通过浅比较（shallowEqual）判断是否更新。
          浅比较只比较第一层引用，对引用类型（对象/数组）只比较引用地址，
          不比较内部值。直接修改引用类型内部值不会改变引用地址，浅比较返回 true（相等），跳过渲染。
        </p>
        <pre style={codeBlockStyle}>{`// shallowEqual 浅比较原理
function shallowEqual(prev, next) {
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false
  return prevKeys.every(key => prev[key] === next[key])
  // 对象的 prev.obj === next.obj 只比较引用，不比较内容
}

// 问题代码：直接修改引用类型
this.state.user.name = 'Bob' // 引用未变！
this.setState({ user: this.state.user }) // 浅比较认为相等，跳过渲染

// 正确代码：创建新对象
this.setState({
  user: { ...this.state.user, name: 'Bob' } // 新引用，触发渲染
})`}</pre>

        <p style={pStyle}>
          <strong>解决方案</strong>：使用不可变数据（Immutable Data）更新策略，每次更新都创建新引用。
        </p>
        <ul style={listStyle}>
          <li>1. 展开运算符（spread operator）：{`{ ...obj, key: value }`}</li>
          <li>2. Object.assign：{`Object.assign({}, obj, { key: value })`}</li>
          <li>3. 数组方法：concat、map、filter、slice（返回新数组）</li>
          <li>4. immer：基于 Proxy 的不可变数据方案</li>
          <li>5. immutable.js：Facebook 的不可变数据库</li>
        </ul>
      </section>

      <footer style={footerStyle}>
        <p>提示：点击「直接修改」按钮观察页面不更新的问题</p>
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
const titleStyle: React.CSSProperties = { margin: '0 0 8px', fontSize: 22, color: '#3b82f6' }
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
