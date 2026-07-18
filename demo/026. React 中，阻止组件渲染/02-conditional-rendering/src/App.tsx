import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { AndPattern } from './patterns/AndPattern'
import { TernaryPattern } from './patterns/TernaryPattern'
import { IifePattern } from './patterns/IifePattern'
import { SwitchPattern } from './patterns/SwitchPattern'
import { EnumMapPattern } from './patterns/EnumMapPattern'
import { PitfallZero } from './patterns/PitfallZero'
import { Pitfalls } from './components/Pitfalls'
import { PatternCompare } from './components/PatternCompare'

/**
 * 02 · 条件渲染模式
 *
 * 与 01 (return null) 不同：这里是父组件根据条件决定"要不要把子组件挂到树里"。
 *
 * 演示 5 种主流模式 + 1 个经典陷阱：
 *   1. && 短路      -- {cond && <Comp/>}
 *   2. 三目运算符   -- {cond ? <A/> : <B/>}
 *   3. IIFE         -- {(() => { ... })()}
 *   4. switch/case  -- 多分支
 *   5. enum map     -- 状态到 UI 的数据化映射
 *   + 陷阱: count && <Comp/> 当 count 为 0 时会渲染出 "0"
 */
type PatternKey = 'and' | 'ternary' | 'iife' | 'switch' | 'enum' | 'pitfall'

interface PatternMeta {
  key: PatternKey
  label: string
  desc: string
}

const PATTERNS: PatternMeta[] = [
  { key: 'and', label: '&& 短路', desc: '条件为真才渲染' },
  { key: 'ternary', label: '三目运算符', desc: '二选一' },
  { key: 'iife', label: 'IIFE', desc: '复杂逻辑封装' },
  { key: 'switch', label: 'switch/case', desc: '多分支' },
  { key: 'enum', label: 'enum map', desc: '状态到 UI 的映射' },
  { key: 'pitfall', label: '陷阱：count && <Comp/>', desc: '0 会被渲染' },
]

const App: FC = () => {
  const [active, setActive] = useState<PatternKey>('and')

  const renderPattern = (): ReactNode => {
    switch (active) {
      case 'and':
        return <AndPattern />
      case 'ternary':
        return <TernaryPattern />
      case 'iife':
        return <IifePattern />
      case 'switch':
        return <SwitchPattern />
      case 'enum':
        return <EnumMapPattern />
      case 'pitfall':
        return <PitfallZero />
      default:
        return null
    }
  }

  const current = PATTERNS.find((p) => p.key === active)

  return (
    <div className="app-shell">
      <nav className="navbar">
        <span className="navbar-brand">02 · 条件渲染模式</span>
        {PATTERNS.map((p) => (
          <button
            key={p.key}
            className={'nav-btn' + (active === p.key ? ' active' : '')}
            onClick={() => setActive(p.key)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="page">
          <h2>什么是条件渲染？</h2>
          <p>
            条件渲染指的是<b>父组件</b>根据某个条件决定"要不要把子组件挂到 React 树中"。 与 01 的{' '}
            <code>return null</code>（组件自己决定）不同，条件渲染由父组件控制。
          </p>
          <p>
            当前查看：<b>{current?.label}</b> - {current?.desc}
          </p>
        </div>

        {renderPattern()}

        <PatternCompare />
        <Pitfalls />
      </main>
    </div>
  )
}

export default App
