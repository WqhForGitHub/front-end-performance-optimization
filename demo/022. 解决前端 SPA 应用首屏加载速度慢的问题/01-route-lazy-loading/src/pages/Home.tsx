import type { FC } from 'react'

export const Home: FC = () => {
  return (
    <div>
      <h2>首页 Home</h2>
      <p>
        这是同步引入的首页组件，会被打包进主 bundle。
        首屏必须立刻可用，所以不做懒加载。
      </p>
      <p>
        切换到「仪表盘」或「设置」试试，浏览器 Network 面板会看到对应 chunk 的请求，
        且加载期间会展示 Loading fallback。
      </p>
      <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
        提示：打开 DevTools Network 面板，勾选「Slow 3G」可更明显地观察到懒加载效果。
      </p>
    </div>
  )
}

export default Home
