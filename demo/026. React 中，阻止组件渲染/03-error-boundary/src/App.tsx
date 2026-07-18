import { useState } from 'react'
import type { FC, ReactNode, CSSProperties } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BuggyCounter } from './components/BuggyCounter'

/**
 * Error Boundary 演示
 *
 * 展示 React 错误边界如何捕获子组件渲染阶段的错误，
 * 阻止整棵树崩溃，并显示 fallback UI。
 */
export default function App() {
  const [resetKey, setResetKey] = useState(0)
  const [errorLogs, setErrorLogs] = useState<string[]>([])

  const pageStyle: CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const sectionStyle: CSSProperties = { marginBottom: '40px' }

  const titleStyle: CSSProperties = {
    fontSize: '20px',
    color: '#1976d2',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #bbdefb',
  }

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.8,
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const cardStyle: CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    backgroundColor: '#fff',
  }

  const cardTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#333',
  }

  const btnStyle: CSSProperties = {
    padding: '10px 24px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '8px',
  }

  const resetBtnStyle: CSSProperties = {
    ...btnStyle,
    backgroundColor: '#ff7043',
  }

  const codeBlockStyle: CSSProperties = {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: 1.6,
    overflowX: 'auto',
    whiteSpace: 'pre',
  }

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  }

  const thStyle: CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    fontWeight: 600,
  }

  const tdStyle: CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  }

  const errorLogStyle: CSSProperties = {
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '12px',
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#e65100',
    maxHeight: '200px',
    overflowY: 'auto',
  }

  const logEntryStyle: CSSProperties = {
    padding: '4px 0',
    borderBottom: '1px solid #ffe0b2',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Error Boundary 错误边界</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
          捕获子组件渲染阶段错误，阻止整棵组件树崩溃
        </p>
      </div>

      {/* 演示区 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>1. 交互演示</h2>
        <div style={descStyle}>
          下方计数器在 count 达到 3 时会在 render 阶段抛出错误。 ErrorBoundary 会捕获该错误，显示
          fallback UI，而不是整个页面白屏。 点击"重置"可以恢复。
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>被 ErrorBoundary 包裹的 BuggyCounter</div>
          <ErrorBoundary
            key={resetKey}
            onError={(error: Error, info: { componentStack: string }) => {
              const log = `[${new Date().toLocaleTimeString()}] ${error.message}`
              setErrorLogs((prev) => [...prev, log])
            }}
            onReset={() => {
              setResetKey((k) => k + 1)
            }}
          >
            <BuggyCounter threshold={3} />
          </ErrorBoundary>
        </div>

        <button
          style={resetBtnStyle}
          onClick={() => {
            setResetKey((k) => k + 1)
            setErrorLogs([])
          }}
        >
          完全重置（清空日志 + 重建组件）
        </button>

        {errorLogs.length > 0 && (
          <div style={errorLogStyle}>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>
              错误日志（componentDidCatch 记录）：
            </div>
            {errorLogs.map((log, i) => (
              <div key={i} style={logEntryStyle}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 原理说明 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>2. Error Boundary 原理</h2>
        <div style={descStyle}>
          错误边界是 React 类组件，通过实现 <code>getDerivedStateFromError</code> 和{' '}
          <code>componentDidCatch</code> 两个生命周期来捕获子组件树的渲染错误。
        </div>
        <pre style={codeBlockStyle}>{`class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  // 渲染阶段调用：返回新 state 切换到 fallback
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // 提交阶段调用：用于副作用（日志上报）
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />
    }
    return this.props.children
  }
}`}</pre>
      </div>

      {/* 能捕获什么 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>3. 能捕获 vs 不能捕获</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>场景</th>
              <th style={thStyle}>能否捕获</th>
              <th style={thStyle}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>子组件 render 阶段抛错</td>
              <td style={{ ...tdStyle, color: '#388e3c', fontWeight: 700 }}>能</td>
              <td style={tdStyle}>最常见的场景</td>
            </tr>
            <tr>
              <td style={tdStyle}>生命周期方法抛错</td>
              <td style={{ ...tdStyle, color: '#388e3c', fontWeight: 700 }}>能</td>
              <td style={tdStyle}>componentDidMount 等</td>
            </tr>
            <tr>
              <td style={tdStyle}>事件回调中抛错 (onClick)</td>
              <td style={{ ...tdStyle, color: '#d32f2f', fontWeight: 700 }}>不能</td>
              <td style={tdStyle}>需用 try/catch 自行处理</td>
            </tr>
            <tr>
              <td style={tdStyle}>异步代码 (setTimeout/Promise)</td>
              <td style={{ ...tdStyle, color: '#d32f2f', fontWeight: 700 }}>不能</td>
              <td style={tdStyle}>需用 try/catch 或 .catch()</td>
            </tr>
            <tr>
              <td style={tdStyle}>服务端渲染错误</td>
              <td style={{ ...tdStyle, color: '#d32f2f', fontWeight: 700 }}>不能</td>
              <td style={tdStyle}>SSR 需单独处理</td>
            </tr>
            <tr>
              <td style={tdStyle}>ErrorBoundary 自身抛错</td>
              <td style={{ ...tdStyle, color: '#d32f2f', fontWeight: 700 }}>不能</td>
              <td style={tdStyle}>需上层边界捕获</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 使用建议 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>4. 最佳实践</h2>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>分层包裹</div>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
            不要只在一个顶层 ErrorBoundary 包裹整个应用。应该在不同层级放置多个 ErrorBoundary，
            这样某个小组件崩溃时不会影响整个页面。
          </p>
          <pre style={codeBlockStyle}>{`<App>
  <ErrorBoundary>
    <Header />
  </ErrorBoundary>
  <ErrorBoundary>
    <Sidebar />
  </ErrorBoundary>
  <main>
    <ErrorBoundary>
      <ChartWidget />
    </ErrorBoundary>
    <ErrorBoundary>
      <DataTable />
    </ErrorBoundary>
  </main>
</App>`}</pre>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>粒度控制</div>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
            关键区域使用细粒度 ErrorBoundary（如单个 Widget）， 非关键区域使用粗粒度（如整个
            Sidebar）。
          </p>
        </div>
      </div>
    </div>
  )
}
