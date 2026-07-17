import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 注意：在真实 SSR/预渲染中，这里会使用 hydrateRoot 而不是 createRoot，
// 让 React 复用服务端/构建期已经渲染好的 DOM，而不是重新创建。
//
// import { hydrateRoot } from 'react-dom/client'
// hydrateRoot(document.getElementById('root')!, <App />)
//
// 本 demo 仅演示概念，仍使用 createRoot。
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
