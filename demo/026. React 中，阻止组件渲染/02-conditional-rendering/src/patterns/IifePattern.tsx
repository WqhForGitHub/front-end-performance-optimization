import { useState } from 'react'
import type { FC, ReactNode } from 'react'

/**
 * 模式 3：IIFE（立即调用函数表达式）
 *
 * 语法：{(() => { if/switch/return ... })()}
 *
 * 适合：JSX 内联复杂逻辑（多分支 + 变量声明），但又不想抽子组件时。
 * 注意：可读性争议较大，社区推荐优先抽子组件；只在简单内联场景使用。
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const IifePattern: FC = () => {
  const [level, setLevel] = useState<LogLevel>('info')

  return (
    <div className="page">
      <h2>模式 3 · IIFE 立即调用函数</h2>
      <p>
        在 JSX 中用 <code>{'{(() => { ... })()}'}</code> 包裹一段带 return 的逻辑，
        适合"需要局部变量 + 多分支"但又不想抽子组件的场景。
      </p>

      <pre className="code-block">{`{(() => {
  switch (level) {
    case 'debug': return <Debug />
    case 'error': return <Error />
    default:      return <Info />
  }
})()}`}</pre>

      <div className="demo-area">
        <div className="row">
          <span>日志级别：</span>
          {(['debug', 'info', 'warn', 'error'] as const).map((l) => (
            <button
              key={l}
              className={'btn-ghost' + (level === l ? ' active' : '')}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="result-box">
          <h4>渲染结果（IIFE 内部 switch）：</h4>
          <div className="rendered">
            {(() => {
              const prefix = `[${level.toUpperCase()}]`
              let body: ReactNode
              switch (level) {
                case 'debug':
                  body = '这是调试信息，仅在开发环境输出'
                  break
                case 'info':
                  body = '这是一条普通信息'
                  break
                case 'warn':
                  body = '警告：请注意此操作可能有问题'
                  break
                case 'error':
                  body = '错误：操作失败，请检查输入'
                  break
                default:
                  body = '未知级别'
              }
              return (
                <div className={'log-item log-' + level}>
                  <span className="log-prefix">{prefix}</span>
                  <span>{body}</span>
                </div>
              )
            })()}
          </div>
          <div className="hint">
            IIFE 内部可以声明局部变量（如上面的 prefix、body），比纯三目嵌套更清晰。
            但如果逻辑再复杂，应该抽成独立子组件。
          </div>
        </div>
      </div>

      <div className="note">
        <b>适用场景：</b>JSX 内联多分支 + 局部变量。
        <b>避免：</b>IIFE 内部超过 20 行，或被复用 -- 此时必须抽子组件。
      </div>
    </div>
  )
}
