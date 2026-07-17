import type { FC } from 'react'

/**
 * BeforeAfter -- return null vs CSS 隐藏 对比
 */
export const BeforeAfter: FC = () => {
  return (
    <div className="page">
      <h2>before / after 对比</h2>
      <p>
        同样是"组件不显示"，下面三种写法的 DOM 产物完全不同。理解差异才能选对方案。
      </p>

      <div className="compare-grid">
        <div className="compare-card">
          <div className="compare-tag tag-bad">写法 A · CSS 隐藏（不推荐）</div>
          <pre className="code-block">{`function Badge({ count }) {
  return (
    <span
      className="badge"
      style={{
        display: count > 0 ? '' : 'none',
      }}
    >
      {count}
    </span>
  )
}`}</pre>
          <ul className="cons">
            <li>DOM 中始终存在节点</li>
            <li>子组件副作用始终执行（网络请求、订阅等）</li>
            <li>敏感文案可被审查工具看到</li>
            <li>无障碍工具仍可能读到隐藏内容</li>
          </ul>
        </div>

        <div className="compare-card">
          <div className="compare-tag tag-good">写法 B · 父组件条件渲染</div>
          <pre className="code-block">{`function Toolbar({ count }) {
  return (
    <div>
      {count > 0 && <Badge count={count} />}
    </div>
  )
}`}</pre>
          <ul className="pros">
            <li>无节点时 DOM 干净</li>
            <li>子组件不挂载、副作用不执行</li>
            <li>判断逻辑放在父组件，耦合度高</li>
          </ul>
        </div>

        <div className="compare-card">
          <div className="compare-tag tag-good">写法 C · 组件 return null（本 demo 主题）</div>
          <pre className="code-block">{`function Badge({ count }) {
  if (count <= 0) return null
  return <span className="badge">{count}</span>
}`}</pre>
          <ul className="pros">
            <li>无节点时 DOM 干净</li>
            <li>判断逻辑封装在组件内部，复用性高</li>
            <li>组件使用者无需关心是否要渲染</li>
            <li>组件内部仍执行 hooks（注意：不能用它跳过昂贵计算）</li>
          </ul>
        </div>
      </div>

      <div className="note">
        经验法则：组件"该不该出现"由它自己判断时用 <code>return null</code>；
        由父组件"我需不需要它"判断时用条件渲染。两者可以组合使用。
      </div>
    </div>
  )
}
