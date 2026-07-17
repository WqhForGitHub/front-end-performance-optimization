import { lazy, useState, useEffect, type FC } from 'react'
import Home from './pages/Home'
import About from './pages/About'

// 路由级懒加载：每个页面通过 React.lazy + dynamic import 拆分为独立 chunk。
// Vite/Rollup 会为下面每个动态 import() 生成单独的 JS 文件。
const Dashboard = lazy<FC>(() => import('./pages/Dashboard'))
const Settings = lazy<FC>(() => import('./pages/Settings'))

// 路由配置
export interface RouteConfig {
  path: string
  label: string
  // 同步组件：直接打包进主 bundle
  sync?: boolean
  // 同步组件为 FC，懒加载组件经由 lazy<FC> 包装后同样是 FC
  component: FC
}

export const routes: RouteConfig[] = [
  // 首页 / About 是同步引入（对比基线），其他路由走 lazy 拆分
  { path: '/', label: '首页 Home', sync: true, component: Home },
  { path: '/about', label: '关于 About', sync: true, component: About },
  { path: '/dashboard', label: '仪表盘 Dashboard', component: Dashboard },
  { path: '/settings', label: '设置 Settings', component: Settings }
]

// 极简的 hash router hook（不依赖 react-router-dom）
export interface RouterValue {
  path: string
  navigate: (to: string) => void
}

export function useRouter(): RouterValue {
  const getPath = (): string => window.location.hash.replace(/^#/, '') || '/'
  const [path, setPath] = useState<string>(getPath)

  useEffect(() => {
    const onChange = (): void => setPath(window.location.hash.replace(/^#/, '') || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = (to: string): void => {
    window.location.hash = to
  }

  return { path, navigate }
}

// 路由级 chunk 信息（用于可视化，数值为模拟真实场景的估算）
export interface ChunkInfo {
  name: string
  sizeKB: number
  lazy: boolean
}

export const singleBundleChunks: ChunkInfo[] = [
  { name: 'main.js（含所有路由）', sizeKB: 320, lazy: false }
]

export const splitBundleChunks: ChunkInfo[] = [
  { name: 'main.js（runtime + Home + About）', sizeKB: 80, lazy: false },
  { name: 'Dashboard-[hash].js', sizeKB: 95, lazy: true },
  { name: 'Settings-[hash].js', sizeKB: 60, lazy: true },
  { name: 'vendor.js（react 等）', sizeKB: 140, lazy: false }
]
