import { useState } from 'react'
import type { FC } from 'react'

/**
 * 模式 2：三目运算符
 *
 * 语法：{cond ? <A/> : <B/>}
 * 条件为真渲染 A，为假渲染 B。两个分支必定渲染其一。
 *
 * 适合：二选一场景（loading/data、空/有数据、暗/亮主题）。
 * 注意：嵌套三目可读性差，超过两层应改用 switch 或 IIFE。
 */
export const TernaryPattern: FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <div className="page">
      <h2>模式 2 · 三目运算符</h2>
      <p>
        二选一场景的最佳选择。两个分支必定渲染其一，不存在"什么都不渲染"的情况。
        如果需要"条件为假则不渲染"，应该用 <code>&&</code> 而非{' '}
        <code>{'cond ? <Comp/> : null'}</code>。
      </p>

      <pre className="code-block">{`{status === 'loading' ? <Spinner/> : <Data/>}
{theme === 'dark' ? <DarkMode/> : <LightMode/>}`}</pre>

      <div className="demo-area">
        <div className="row">
          <span>状态：</span>
          {(['loading', 'success', 'error'] as const).map((s) => (
            <button
              key={s}
              className={'btn-ghost' + (status === s ? ' active' : '')}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
          <span style={{ marginLeft: 16 }}>主题：</span>
          <button
            className={'btn-ghost' + (theme === 'light' ? ' active' : '')}
            onClick={() => setTheme('light')}
          >
            light
          </button>
          <button
            className={'btn-ghost' + (theme === 'dark' ? ' active' : '')}
            onClick={() => setTheme('dark')}
          >
            dark
          </button>
        </div>

        <div className="result-box">
          <h4>渲染结果：</h4>
          <div className="rendered">
            {/* 二选一：状态渲染 */}
            {status === 'loading' ? (
              <div className="status-card status-loading">加载中...</div>
            ) : status === 'success' ? (
              <div className="status-card status-success">数据加载成功</div>
            ) : (
              <div className="status-card status-error">加载失败，请重试</div>
            )}

            {/* 二选一：主题渲染 */}
            <div className={'theme-card theme-' + theme}>
              当前主题: {theme === 'dark' ? '深色模式' : '浅色模式'}
            </div>
          </div>
          <div className="hint">
            注意上面的嵌套三目{' '}
            <code>{'status === "loading" ? ... : status === "success" ? ... : ...'}</code>，
            超过两层时可读性急剧下降，应改用 switch 或 IIFE。
          </div>
        </div>
      </div>

      <div className="note">
        <b>适用场景：</b>loading/data 二态、空/有数据二态、主题切换。
        <b>避免：</b>三层以上嵌套三目，改用 switch 或抽取子组件。
      </div>
    </div>
  )
}
