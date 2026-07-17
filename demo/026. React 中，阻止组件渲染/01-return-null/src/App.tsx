import { useState, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { HiddenModal } from './components/HiddenModal'
import { EmptyList } from './components/EmptyList'
import { PermissionGated } from './components/PermissionGated'
import { BeforeAfter } from './components/BeforeAfter'
import { Principles } from './components/Principles'

/**
 * 01 · return null 阻止组件渲染
 *
 * 核心思想：组件函数体里根据条件 `return null`，React 不会输出任何 DOM 节点。
 * 这是"组件自己决定要不要出现"的最直接写法。
 *
 * 本 demo 包含 3 个真实场景：
 *   1. HiddenModal —— 隐藏的弹窗，未打开时 return null
 *   2. EmptyList   —— 空列表时 return null，避免渲染空骨架
 *   3. PermissionGated —— 权限受控组件，无权限时 return null
 *
 * 还包含 before/after 对比与原则说明。
 */
const App: FC = () => {
  const [section, setSection] = useState<'modal' | 'list' | 'permission'>('modal')

  const sections: Array<{ key: typeof section; label: string }> = [
    { key: 'modal', label: '隐藏的 Modal' },
    { key: 'list', label: '空列表状态' },
    { key: 'permission', label: '权限受控组件' },
  ]

  const body = useMemo<ReactNode>(() => {
    switch (section) {
      case 'modal':
        return <ModalSection />
      case 'list':
        return <ListSection />
      case 'permission':
        return <PermissionSection />
      default:
        return null
    }
  }, [section])

  return (
    <div className="app-shell">
      <nav className="navbar">
        <span className="navbar-brand">01 · return null 阻止渲染</span>
        {sections.map((s) => (
          <button
            key={s.key}
            className={'nav-btn' + (section === s.key ? ' active' : '')}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="page">
          <h2>
            什么是 <code>return null</code>？
          </h2>
          <p>
            在组件函数体内根据业务条件直接 <code>return null</code>，React 不会为该组件创建任何 DOM 节点。
            这是组件"自己决定不出现"的最直接方式，与父组件用 <code>{'{false && <Comp/>}'}</code> 把它挡在外面是两种不同的视角。
          </p>
          <pre className="code-block">{`function Modal({ open }: { open: boolean }) {
  if (!open) return null     // 不输出任何 DOM
  return <div className="modal">...</div>
}`}</pre>
          <div className="note">
            关键点：<code>return null</code> 仍然会执行组件函数体（包括所有 hooks），
            所以它适合"判断逻辑简单、不影响性能"的场景；不能用它跳过昂贵的 hooks 计算。
          </div>
        </div>

        {body}

        <BeforeAfter />
        <Principles />
      </main>
    </div>
  )
}

// ---------- 场景 1：隐藏的 Modal ----------
const ModalSection: FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className="page">
      <h2>
        场景 1 · 隐藏的 Modal <span className="tag tag-good">常见</span>
      </h2>
      <p>
        Modal 默认关闭。组件内部用 <code>if (!open) return null</code> 直接阻止渲染，
        关闭时 DOM 中不会残留任何遮罩/弹层节点。
      </p>

      <div className="row">
        <button className="btn-primary" onClick={() => setOpen(true)}>
          打开 Modal
        </button>
        <span className="hint">点击后查看 DOM 结构变化（开发者工具 Elements 面板）</span>
      </div>

      <HiddenModal open={open} onClose={() => setOpen(false)}>
        <h3>这是一个 Modal</h3>
        <p>当 open=false 时，HiddenModal 直接 return null，DOM 中无任何节点。</p>
        <button className="btn-secondary" onClick={() => setOpen(false)}>
          关闭
        </button>
      </HiddenModal>

      <div className="kv">
        <div><b>open:</b> {String(open)}</div>
        <div><b>DOM 节点:</b> {open ? '渲染 modal-root 容器' : '无（被 return null 拦截）'}</div>
      </div>
    </div>
  )
}

// ---------- 场景 2：空列表状态 ----------
const ListSection: FC = () => {
  const [items, setItems] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'non-empty'>('all')

  const add = () => setItems((prev) => [...prev, `Item #${prev.length + 1}`])
  const clear = () => setItems([])

  return (
    <div className="page">
      <h2>
        场景 2 · 空列表状态 <span className="tag tag-good">推荐</span>
      </h2>
      <p>
        列表为空时，<code>EmptyList</code> 组件内部判断 <code>items.length === 0</code> 直接 return null，
        不渲染空 ul 骨架，DOM 更干净。
      </p>

      <div className="row">
        <button className="btn-primary" onClick={add}>追加一项</button>
        <button className="btn-secondary" onClick={clear}>清空</button>
        <button
          className={'btn-ghost' + (filter === 'all' ? ' active' : '')}
          onClick={() => setFilter('all')}
        >
          展示 EmptyList 节点
        </button>
        <button
          className={'btn-ghost' + (filter === 'non-empty' ? ' active' : '')}
          onClick={() => setFilter('non-empty')}
        >
          仅展示非空时
        </button>
      </div>

      <EmptyList items={items} showEmptyHint={filter === 'all'} />

      <div className="note">
        当 <code>filter = 'all'</code> 且 <code>items</code> 为空时，EmptyList 会渲染"暂无数据"提示；
        当 <code>filter = 'non-empty'</code> 时，组件内部 return null，DOM 中无任何节点。
        两种策略由组件自己根据 props 决定，父组件无需关心。
      </div>
    </div>
  )
}

// ---------- 场景 3：权限受控组件 ----------
const PermissionSection: FC = () => {
  const [role, setRole] = useState<'guest' | 'user' | 'admin'>('guest')

  return (
    <div className="page">
      <h2>
        场景 3 · 权限受控组件 <span className="tag tag-good">安全</span>
      </h2>
      <p>
        敏感操作按钮组件内部判断当前用户角色，无权限时直接 <code>return null</code>，
        既不渲染也不留任何痕迹。比"渲染后用 CSS 隐藏"更安全（DOM 中无敏感文案）。
      </p>

      <div className="row">
        <span>切换角色：</span>
        {(['guest', 'user', 'admin'] as const).map((r) => (
          <button
            key={r}
            className={'btn-ghost' + (role === r ? ' active' : '')}
            onClick={() => setRole(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="permission-demo">
        <h3>操作面板</h3>
        <PermissionGated role={role} require="user">
          <button className="btn-primary">查看订单（需要 user+）</button>
        </PermissionGated>
        <PermissionGated role={role} require="admin">
          <button className="btn-danger">删除用户（需要 admin）</button>
        </PermissionGated>
        <PermissionGated role={role} require="admin">
          <button className="btn-danger">导出全部数据（需要 admin）</button>
        </PermissionGated>
        <div className="hint">
          当前角色: <b>{role}</b>。无权限的按钮不会出现在 DOM 中，用 CSS 隐藏则不同。
        </div>
      </div>
    </div>
  )
}

export default App
