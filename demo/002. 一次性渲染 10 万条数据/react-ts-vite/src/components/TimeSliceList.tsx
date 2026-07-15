import { useState, useEffect, useRef, useCallback } from 'react'
import { ListItem } from '../utils/data'

interface Props {
  data: ListItem[]
  batchSize?: number
}

/**
 * 方法三：时间分片（Time Slicing）
 * 核心原理：
 * 1. 不一次性渲染全部 10 万条，而是分批（每批 batchSize 条）追加
 * 2. 每渲染完一批，用 requestAnimationFrame 让出主线程，浏览器有机会响应交互、绘制
 * 3. 重复上述过程直到所有数据渲染完毕
 *
 * 优点：实现简单，不需要计算可视区域；用户能逐步看到内容，不会长时间白屏卡死。
 * 缺点：最终 DOM 数量仍等于数据总量，10 万条 DOM 会占用较多内存，滚动可能不够流畅。
 * 适合中等数据量（几千到一两万），大数据量推荐虚拟列表。
 */
export default function TimeSliceList({ data, batchSize = 200 }: Props) {
  const [renderedCount, setRenderedCount] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const rafRef = useRef<number | null>(null)

  const startRender = useCallback(() => {
    // 重置
    setRenderedCount(0)
    setIsRendering(true)
  }, [])

  useEffect(() => {
    if (!isRendering) return

    const renderBatch = () => {
      setRenderedCount((prev) => {
        const next = prev + batchSize
        if (next >= data.length) {
          setIsRendering(false)
          return data.length
        }
        // 让出主线程，下一帧继续渲染下一批
        rafRef.current = requestAnimationFrame(renderBatch)
        return next
      })
    }

    rafRef.current = requestAnimationFrame(renderBatch)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isRendering, data.length, batchSize])

  // 数据变化时自动开始
  useEffect(() => {
    startRender()
  }, [data, startRender])

  const visibleData = data.slice(0, renderedCount)

  return (
    <div>
      <div className="status" style={{ marginBottom: 8 }}>
        已渲染 {renderedCount.toLocaleString()} / {data.length.toLocaleString()} 条
        {isRendering && ' · 渲染中...'}
      </div>
      <div className="list-container">
        {visibleData.map((item) => (
          <div className="list-item" key={item.id}>
            <span className="idx">#{item.id + 1}</span>
            <span className="content">
              {item.name} - 值: {item.value} - {item.desc}
            </span>
          </div>
        ))}
        {isRendering && <div className="loading">加载更多数据...</div>}
      </div>
    </div>
  )
}
