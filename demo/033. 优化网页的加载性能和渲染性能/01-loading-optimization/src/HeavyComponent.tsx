import type { FC } from 'react'
import { useMemo, useState } from 'react'

/**
 * 模拟一个体积较大的"重型"组件
 * 通过 React.lazy + 动态 import() 拆分出去，避免进入主包
 */
const HeavyComponent: FC = () => {
  const [count, setCount] = useState(0)

  // 模拟昂贵的计算（仅作演示，实际项目里可能是图表/编辑器/3D 渲染等）
  const result = useMemo(() => {
    let total = 0
    for (let i = 0; i < 100000; i++) {
      total += Math.sqrt(i) * Math.sin(i * 0.01)
    }
    return Math.round(total)
  }, [])

  return (
    <div style={{ padding: 16, background: '#ede9fe', borderRadius: 8, color: '#4c1d95' }}>
      <h3 style={{ marginBottom: 8, fontSize: 15 }}>Heavy Component 已加载（动态 import）</h3>
      <p style={{ fontSize: 13, marginBottom: 8 }}>
        该组件在主 chunk 之外，仅在用户点击时才会下载。昂贵的计算结果: {result}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn" onClick={() => setCount((c) => c + 1)}>
          点击: {count}
        </button>
        <span style={{ fontSize: 12, color: '#7c3aed' }}>拆分后主包体积可减少 30%+</span>
      </div>
    </div>
  )
}

export default HeavyComponent
