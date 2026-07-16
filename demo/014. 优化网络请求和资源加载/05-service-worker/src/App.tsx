import CacheStatus from './components/CacheStatus'

/**
 * Service Worker 缓存演示
 *
 * 展示 Service Worker 在资源缓存和离线访问中的应用：
 * 1. SW 注册 - 拦截网络请求，管理缓存
 * 2. 预缓存 - 安装时缓存核心资源
 * 3. 缓存策略 - Cache First / Network First / Stale While Revalidate
 *
 * 注意：由于本项目无构建产物，SW 相关功能为模拟演示。
 * 在真实项目中，使用 vite-plugin-pwa 插件可自动生成 SW 文件。
 */
export default function App() {
  const pageStyle: Record<string, string | number | undefined> = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#333',
  }

  const headerStyle: Record<string, string | number | undefined> = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
  }

  const infoStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '24px',
    backgroundColor: '#fff3e0',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ffe0b2',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Service Worker 缓存</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          使用 Service Worker 实现离线缓存和请求拦截
        </p>
      </div>

      <div style={infoStyle}>
        <strong>什么是 Service Worker？</strong>
        <br />
        Service Worker 是浏览器后台运行的脚本，可以拦截网络请求、缓存资源，
        实现离线访问和性能优化。它是 PWA（渐进式 Web 应用）的核心技术之一。
        <br /><br />
        <strong>常用缓存策略：</strong>
        <br />
        - <strong style={{ color: '#4caf50' }}>Cache First</strong>：优先缓存，适合静态资源
        <br />
        - <strong style={{ color: '#2196f3' }}>Network First</strong>：优先网络，适合 API 请求
        <br />
        - <strong style={{ color: '#ff9800' }}>Stale While Revalidate</strong>：先返回缓存后更新，平衡速度与新鲜度
        <br /><br />
        <strong>注意：</strong>本项目无构建产物，SW 功能为模拟演示。
        真实项目推荐使用 <code>vite-plugin-pwa</code> 插件。
      </div>

      <CacheStatus />
    </div>
  )
}
