import { useState } from 'react'
import type { FC } from 'react'

/**
 * 模式 1：&& 短路
 *
 * 语法：{cond && <Comp/>}
 * 当 cond 为 truthy 时渲染 <Comp/>，否则不渲染任何内容。
 *
 * 适合：单条件"显示/不显示"的场景。
 * 注意：左侧操作数若为 0/'' 等 falsy 但非 boolean 值，会被渲染出来（见 PitfallZero）。
 */
export const AndPattern: FC = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [hasNotification, setHasNotification] = useState(true)

  return (
    <div className="page">
      <h2>模式 1 · && 短路</h2>
      <p>最常用的条件渲染方式。条件为 truthy 时渲染右侧，否则不输出任何 DOM。</p>

      <pre className="code-block">{`{loggedIn && <WelcomeBanner />}
{hasNotification && <NotificationDot />}`}</pre>

      <div className="demo-area">
        <div className="row">
          <button className="btn-ghost" onClick={() => setLoggedIn((v) => !v)}>
            切换 loggedIn: {String(loggedIn)}
          </button>
          <button className="btn-ghost" onClick={() => setHasNotification((v) => !v)}>
            切换 hasNotification: {String(hasNotification)}
          </button>
        </div>

        <div className="result-box">
          <h4>渲染结果：</h4>
          <div className="rendered">
            {loggedIn && (
              <div className="banner banner-success">欢迎回来，用户！(loggedIn 为 true 时显示)</div>
            )}
            {hasNotification && (
              <span className="notification-dot" title="有新通知">
                ●
              </span>
            )}
            {!loggedIn && !hasNotification && (
              <span className="hint">两个条件都为 false，无内容渲染</span>
            )}
          </div>
          <div className="hint">
            打开开发者工具查看：当条件为 false 时，对应位置的 DOM 节点完全不存在。
          </div>
        </div>
      </div>

      <div className="note">
        <b>适用场景：</b>通知红点、登录态横幅、权限提示等"单条件显示/隐藏"场景。
        多条件组合时可链式调用：<code>{'{loggedIn && isAdmin && <AdminPanel/>'}</code>。
      </div>
    </div>
  )
}
