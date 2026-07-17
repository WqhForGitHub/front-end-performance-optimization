import { useState, type FC } from 'react'

export const About: FC = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h2>关于 About</h2>
      <p>该页面通过 React.lazy 异步加载，访问前已被预取，因此切换无白屏。</p>
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn"
          onClick={() => setCount((c) => c + 1)}
        >
          点击计数：{count}
        </button>
      </div>
    </div>
  )
}

export default About
