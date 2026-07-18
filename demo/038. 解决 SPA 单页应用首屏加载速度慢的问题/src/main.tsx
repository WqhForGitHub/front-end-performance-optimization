import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 移除骨架屏
const skeleton = document.getElementById('skeleton')
if (skeleton) {
  skeleton.remove()
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
