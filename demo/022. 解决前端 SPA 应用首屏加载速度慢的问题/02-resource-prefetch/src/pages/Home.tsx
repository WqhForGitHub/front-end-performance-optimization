import type { FC } from 'react'

export const Home: FC = () => {
  return (
    <div>
      <h2>首页 Home</h2>
      <p>
        这是同步引入的首页。其他路由（About / Contact）通过 React.lazy 拆分为独立 chunk，
        并在空闲时 / hover 时预取，访问时近乎零等待。
      </p>
      <p style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
        打开 DevTools Network 面板观察：进入页面几秒后，About / Contact 的 chunk 会被自动预取。
      </p>
    </div>
  )
}

export default Home
