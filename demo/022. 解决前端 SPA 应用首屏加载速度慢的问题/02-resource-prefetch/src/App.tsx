import type { FC } from 'react'
import { PrefetchDemo } from './components/PrefetchDemo'
import { RoutePrefetchList } from './components/RoutePrefetchList'

const App: FC = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>方案二：资源预取与预连接</h1>
        <span className="badge">SPA 首屏优化 Demo</span>
      </header>

      <PrefetchDemo />
      <RoutePrefetchList />
    </div>
  )
}

export default App
