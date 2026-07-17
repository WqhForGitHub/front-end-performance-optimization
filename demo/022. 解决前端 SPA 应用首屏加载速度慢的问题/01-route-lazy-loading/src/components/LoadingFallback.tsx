import type { FC } from 'react'

interface LoadingFallbackProps {
  label?: string
}

export const LoadingFallback: FC<LoadingFallbackProps> = ({ label }) => {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner" />
      <div>{label ?? '加载中...'}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
        正在通过网络请求对应路由的 chunk 文件
      </div>
    </div>
  )
}
