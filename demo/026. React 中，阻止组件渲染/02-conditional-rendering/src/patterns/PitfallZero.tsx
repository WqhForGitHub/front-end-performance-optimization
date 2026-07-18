import { useState } from 'react'
import type { FC } from 'react'

/**
 * 陷阱：count && <Comp/> 当 count 为 0
 *
 * JavaScript 中 0 是 falsy，但 React 会把 0 当作有效子节点渲染出来（输出字符 "0"）。
 * 同理 ''（空字符串）和 false 本身不会被渲染，但 0 会。
 *
 * 修复方式：
 *   1. count > 0 && <Comp/>         -- 推荐：语义最清晰
 *   2. Boolean(count) && <Comp/>    -- 显式转 boolean
 *   3. !!count && <Comp/>           -- 等价于 Boolean
 *   4. count ? <Comp/> : null       -- 三目也能避免
 */
export const PitfallZero: FC = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="page">
      <h2>
        陷阱 · <code>count && {'<Comp/>'}</code> 当 count 为 0
        <span className="tag tag-bad">经典陷阱</span>
      </h2>
      <p>
        JavaScript 中 <code>0</code> 是 falsy，所以 <code>0 && {'<Comp/>'}</code> 的求值结果是{' '}
        <code>0</code>。 但 React 会把 <code>0</code> 当作合法的子节点，
        <b>在页面上渲染出字符 "0"</b>！ 这是 React 中最常见、最容易踩的条件渲染陷阱。
      </p>

      <div className="demo-area">
        <div className="row">
          <span>count = {count}</span>
          <button className="btn-ghost" onClick={() => setCount((c) => Math.max(0, c - 1))}>
            -1
          </button>
          <button className="btn-ghost" onClick={() => setCount((c) => c + 1)}>
            +1
          </button>
          <button className="btn-ghost" onClick={() => setCount(0)}>
            重置为 0
          </button>
        </div>

        <div className="compare-grid">
          <div className="compare-card">
            <div className="compare-tag tag-bad">写法 A · 有陷阱</div>
            <pre className="code-block">{`{count && <Badge count={count} />}`}</pre>
            <div className="result-box">
              <div className="rendered pitfall-render">
                {count && <span className="badge">{count}</span>}
              </div>
              <div className="hint pitfall-hint">
                {count === 0
                  ? '注意！这里渲染出了字符 "0"，而不是什么都不渲染'
                  : 'count > 0 时正常显示徽标'}
              </div>
            </div>
          </div>

          <div className="compare-card">
            <div className="compare-tag tag-good">写法 B · 修复 1</div>
            <pre className="code-block">{`{count > 0 && <Badge count={count} />}`}</pre>
            <div className="result-box">
              <div className="rendered">{count > 0 && <span className="badge">{count}</span>}</div>
              <div className="hint">
                {count === 0 ? 'count=0 时不渲染，DOM 干净' : 'count > 0 时正常显示'}
              </div>
            </div>
          </div>

          <div className="compare-card">
            <div className="compare-tag tag-good">写法 C · 修复 2</div>
            <pre className="code-block">{`{Boolean(count) && <Badge count={count} />}`}</pre>
            <div className="result-box">
              <div className="rendered">
                {Boolean(count) && <span className="badge">{count}</span>}
              </div>
              <div className="hint">
                {count === 0 ? 'Boolean(0) = false，不渲染' : 'Boolean(count) = true，正常显示'}
              </div>
            </div>
          </div>

          <div className="compare-card">
            <div className="compare-tag tag-good">写法 D · 修复 3</div>
            <pre className="code-block">{`{!!count && <Badge count={count} />}`}</pre>
            <div className="result-box">
              <div className="rendered">{!!count && <span className="badge">{count}</span>}</div>
              <div className="hint">
                {count === 0 ? '!!0 = false，不渲染' : '!!count = true，正常显示'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="note">
        <b>根因：</b>React 渲染子节点时，<code>false</code>、<code>null</code>、
        <code>undefined</code>、<code>true</code>
        会被忽略，但 <code>0</code> 和 <code>NaN</code> 会被当作有效文本节点渲染。 所以{' '}
        <code>{'{someNumber && <Comp/>}'}</code> 在 someNumber 为 0 时会输出 "0"。
        <b>修复：</b>用 <code>count &gt; 0 &&</code> 或 <code>Boolean(count) &&</code> 或{' '}
        <code>!!count &&</code>。
      </div>
    </div>
  )
}
