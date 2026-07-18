import type { FC, ReactNode } from 'react'

/**
 * Principles -- return null 使用原则与陷阱
 */
export const Principles: FC = () => {
  const dos: Array<{ title: string; body: ReactNode }> = [
    {
      title: '1. 早返回要放在所有 hooks 之后',
      body: (
        <span>
          React 要求 hooks 调用顺序稳定。若 <code>if (cond) return null</code> 写在{' '}
          <code>useState</code> 之前， 下次渲染条件变化会导致 hooks 数量不一致，触发报错。
        </span>
      ),
    },
    {
      title: '2. 适合"判断逻辑简单"的场景',
      body: (
        <span>
          单纯的存在性 / 权限 / 开关判断非常适合。如果判断前需要大量计算，应把计算放到{' '}
          <code>useMemo</code> 或上移到父组件。
        </span>
      ),
    },
    {
      title: '3. return null 仍会执行组件函数体',
      body: (
        <span>
          组件函数本身、其中所有顶层 hooks（<code>useState</code>/<code>useEffect</code>{' '}
          等）仍会执行， 只是最终不输出 DOM。不要用它跳过昂贵的副作用。
        </span>
      ),
    },
    {
      title: '4. 优先于 CSS 隐藏（display:none）',
      body: (
        <span>
          当"完全不渲染"语义正确时，<code>return null</code> 比 <code>display:none</code>{' '}
          更干净：DOM 更小、副作用更少、更安全。
        </span>
      ),
    },
  ]

  const donts: Array<{ title: string; body: ReactNode }> = [
    {
      title: '1. 不要用它跳过 hooks 规则',
      body: (
        <span>
          <code>if (cond) return null</code> 写在 hooks 调用之前会破坏 hooks 调用顺序，React
          会在开发模式下抛错。
        </span>
      ),
    },
    {
      title: '2. 不要用它替代 memo / shouldComponentUpdate',
      body: (
        <span>
          <code>return null</code> 仍会重算整个组件。<code>memo</code> /{' '}
          <code>shouldComponentUpdate</code> 才是"跳过重渲染"的工具。
        </span>
      ),
    },
    {
      title: '3. 不要在频繁切换的场景滥用',
      body: (
        <span>
          频繁 <code>null</code> &lt;-&gt; 元素 切换会导致组件反复挂载/卸载，比{' '}
          <code>display:none</code> 更昂贵（重建 DOM、副作用反复触发）。
        </span>
      ),
    },
    {
      title: '4. 不要混淆 return null 与 return undefined',
      body: (
        <span>
          React 中两者行为一致（都不输出 DOM），但 <code>null</code> 语义是"明确不渲染"，
          <code>undefined</code> 常常是"忘了 return"，应该用 <code>null</code>。
        </span>
      ),
    },
  ]

  return (
    <div className="page">
      <h2>使用原则与陷阱</h2>

      <div className="two-col">
        <div>
          <h3 className="good-title">推荐做法</h3>
          {dos.map((it) => (
            <div className="info-card good" key={it.title}>
              <div className="value">{it.title}</div>
              <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>{it.body}</div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="bad-title">需要避免</h3>
          {donts.map((it) => (
            <div className="info-card bad" key={it.title}>
              <div className="value">{it.title}</div>
              <div style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>{it.body}</div>
            </div>
          ))}
        </div>
      </div>

      <h3>关键代码</h3>
      <pre className="code-block">{`// ✅ 正确：hooks 在前，早返回在后
function Comp({ open }) {
  const [data, setData] = useState(null)
  useEffect(() => { /* ... */ }, [])
  if (!open) return null          // OK：所有 hooks 已被调用
  return <div>{data}</div>
}

// ❌ 错误：早返回在 hooks 之前
function Comp({ open }) {
  if (!open) return null          // 会破坏 hooks 调用顺序
  const [data, setData] = useState(null)  // 报错！
  return <div>{data}</div>
}`}</pre>
    </div>
  )
}
