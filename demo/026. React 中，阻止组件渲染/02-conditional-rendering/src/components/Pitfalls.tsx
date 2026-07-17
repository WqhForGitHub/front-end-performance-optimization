import type { FC, ReactNode } from 'react'

/**
 * Pitfalls -- 条件渲染常见陷阱汇总
 */
export const Pitfalls: FC = () => {
  const items: Array<{ title: string; bad: ReactNode; good: ReactNode }> = [
    {
      title: '1. 0 被渲染',
      bad: <span><code>{'{count && <Comp/>}'}</code> 当 count=0 时会渲染出 "0"</span>,
      good: <span><code>{'{count > 0 && <Comp/>}'}</code> 或 <code>{'{Boolean(count) && <Comp/>}'}</code></span>,
    },
    {
      title: '2. 嵌套三目',
      bad: <span><code>{'{a ? (b ? X : Y) : (c ? Z : W)}'}</code> 可读性极差</span>,
      good: <span>抽成 <code>renderContent()</code> 函数或子组件，用 switch</span>,
    },
    {
      title: '3. 条件渲染破坏 hooks 顺序',
      bad: <span><code>{'{cond && useMemo(...)}'}</code> 把 hooks 放在条件分支里</span>,
      good: <span>hooks 永远在组件顶层无条件调用，条件渲染只控制 JSX 输出</span>,
    },
    {
      title: '4. key 丢失',
      bad: <span><code>{'{cond ? <A/> : <B/>'}</code> 切换时 React 可能复用错误的状态</span>,
      good: <span>给切换的元素加 <code>key</code> 强制重建，或用 <code>display:none</code> 隐藏</span>,
    },
    {
      title: '5. 用 CSS 隐藏代替条件渲染',
      bad: <span>频繁切换的 Tab 用 <code>{'{cond && <Tab/>}'}</code> 反复挂载卸载，性能差</span>,
      good: <span>频繁切换场景用 <code>display:none</code> 保活；不频繁的用条件渲染</span>,
    },
    {
      title: '6. 三目返回 null',
      bad: <span><code>{'{cond ? <Comp/> : null}'}</code> 多此一举</span>,
      good: <span>直接用 <code>{'{cond && <Comp/>}'}</code> 更简洁</span>,
    },
  ]

  return (
    <div className="page">
      <h2>常见陷阱汇总</h2>
      <div className="pitfall-list">
        {items.map((it) => (
          <div className="pitfall-item" key={it.title}>
            <div className="pitfall-title">{it.title}</div>
            <div className="pitfall-row">
              <div className="pitfall-bad">
                <span className="icon-bad">x</span> {it.bad}
              </div>
              <div className="pitfall-good">
                <span className="icon-good">ok</span> {it.good}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
