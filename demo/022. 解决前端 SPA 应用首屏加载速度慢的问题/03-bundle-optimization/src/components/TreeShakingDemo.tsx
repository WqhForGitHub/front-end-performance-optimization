import { useState, type FC, type ChangeEvent } from 'react'
import { add, hashLabel, VERSION } from '../utils/exampleUtils'

export const TreeShakingDemo: FC = () => {
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const [text, setText] = useState('hello')

  // 这里只使用了 add / hashLabel / VERSION；
  // exampleUtils 中的 multiply / formatPrice 未被引用，会被 tree shaking 剔除
  const sum = add(a, b)
  const hashed = hashLabel(text)

  return (
    <div className="section">
      <h2>2. Tree Shaking 实际效果演示</h2>
      <div className="desc">
        <code>exampleUtils.ts</code> 导出了 5 个符号，但本组件仅使用{' '}
        <code>add / hashLabel / VERSION</code>； 未使用的 <code>multiply / formatPrice</code>{' '}
        会被打包器剔除。
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          a =
          <input
            type="number"
            value={String(a)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setA(Number(e.target.value) || 0)}
            style={{ width: 70, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
          />
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          b =
          <input
            type="number"
            value={String(b)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setB(Number(e.target.value) || 0)}
            style={{ width: 70, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
          />
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          text =
          <input
            type="text"
            value={text}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
            style={{ width: 140, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
          />
        </label>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          fontSize: 13,
        }}
      >
        <div>
          add(a, b) = <b style={{ color: '#ef4444' }}>{sum}</b>
        </div>
        <div>
          hashLabel(text) ={' '}
          <b style={{ color: '#ef4444', fontFamily: 'ui-monospace, monospace' }}>{hashed}</b>
        </div>
        <div>
          VERSION ={' '}
          <b style={{ color: '#ef4444', fontFamily: 'ui-monospace, monospace' }}>{VERSION}</b>
        </div>
      </div>

      <div className="tree-demo">
        <div className="tree-card">
          <h4>未启用 tree shaking</h4>
          <pre>{`import _ from 'lodash'

// 整包 lodash 全部打入产物
// 70 KB`}</pre>
          <p>整包 import 会带入所有未使用代码，体积膨胀。</p>
        </div>
        <div className="tree-card">
          <h4>启用 tree shaking</h4>
          <pre>{`import { add, hashLabel } from './utils'
// 仅打包实际使用的 add / hashLabel
// 0.3 KB`}</pre>
          <p>ESM 命名导入 + sideEffects: false，未使用代码被安全剔除。</p>
        </div>
      </div>

      <div className="warn">
        注意：CommonJS（require）和命名空间 import（import * as）会大幅削弱 tree shaking 效果；
        务必使用 ESM 命名导入，并在 package.json 中声明 sideEffects。
      </div>
    </div>
  )
}
