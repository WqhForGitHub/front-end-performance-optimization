import { useState } from 'react'
import type { FC } from 'react'

/**
 * BuggyCounter -- 一个故意会抛错的计数器
 *
 * 当 count 达到 3 时，render 阶段抛出错误。
 * 这会触发上层 ErrorBoundary 的 getDerivedStateFromError。
 *
 * 注意：抛错发生在 render 阶段（不是事件回调中），
 * 所以 ErrorBoundary 能捕获它。
 * 如果把 throw 放在 onClick 回调里，ErrorBoundary 就捕获不到。
 */
interface BuggyCounterProps {
  /** 触发错误的阈值，默认 3 */
  threshold?: number
}

export const BuggyCounter: FC<BuggyCounterProps> = ({ threshold = 3 }) => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount((c) => c + 1)
  }

  // render 阶段抛错：当 count 达到阈值时
  if (count >= threshold) {
    throw new Error(
      `BuggyCounter 在 count=${count} 时崩溃了！这是一个渲染阶段的错误，会被 ErrorBoundary 捕获。`,
    )
  }

  return (
    <div className="buggy-counter">
      <div className="counter-display">
        <span className="counter-label">count</span>
        <span className="counter-value">{count}</span>
        <span className="counter-threshold">/ {threshold}</span>
      </div>
      <button className="btn-primary" onClick={increment}>
        +1
      </button>
      <p className="counter-hint">
        点击按钮增加计数。当 count 达到 {threshold} 时，render 阶段会抛错。
      </p>
    </div>
  )
}
