import type { FC } from 'react'

export const About: FC = () => {
  return (
    <div>
      <h2>关于 About</h2>
      <p>
        About 页面同样是同步引入，作为对比基线。
        即使体积较小，所有页面都同步打包会让首屏 bundle 持续膨胀。
      </p>
      <p>
        真实项目中，只有 Layout / 极高频路由适合同步，其余路由都应使用 React.lazy。
      </p>
    </div>
  )
}

export default About
