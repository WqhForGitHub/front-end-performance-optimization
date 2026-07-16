import { useState } from 'react'
import { useFetch } from './hooks/useFetch'
import SearchBox from './components/SearchBox'

interface Post {
  id: number
  title: string
  body: string
}

/**
 * 请求取消演示
 *
 * 展示 AbortController 在请求取消中的应用：
 * 1. 搜索框防抖 + 请求取消 - 快速输入时取消之前的请求
 * 2. 手动取消请求 - 点击按钮取消正在进行的请求
 * 3. 组件卸载自动取消 - 切换 tab 时取消未完成的请求
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search')
  const [postId, setPostId] = useState(1)

  // 手动取消演示：请求指定 ID 的文章
  const { data, loading, error, cancel } = useFetch<Post>(
    `https://jsonplaceholder.typicode.com/posts/${postId}`
  )

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

  const tabContainerStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  }

  const tabStyle = (active: boolean): Record<string, string | number | undefined> => ({
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    border: '2px solid',
    borderColor: active ? '#1976d2' : '#e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#e3f2fd' : 'transparent',
    color: active ? '#1976d2' : '#999',
    fontWeight: active ? 'bold' : 'normal',
    fontSize: '14px',
    transition: 'all 0.2s',
  })

  const sectionStyle: Record<string, string | number | undefined> = {
    marginBottom: '24px',
  }

  const descStyle: Record<string, string | number | undefined> = {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '16px',
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    borderRadius: '8px',
  }

  const buttonRowStyle: Record<string, string | number | undefined> = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  }

  const buttonStyle: Record<string, string | number | undefined> = {
    padding: '8px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  }

  const primaryBtn: Record<string, string | number | undefined> = {
    ...buttonStyle,
    backgroundColor: '#1976d2',
    color: '#fff',
  }

  const dangerBtn: Record<string, string | number | undefined> = {
    ...buttonStyle,
    backgroundColor: '#f44336',
    color: '#fff',
  }

  const cardStyle: Record<string, string | number | undefined> = {
    padding: '20px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>请求取消</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '15px' }}>
          使用 AbortController 取消不必要的网络请求
        </p>
      </div>

      <div style={tabContainerStyle}>
        <div style={tabStyle(activeTab === 'search')} onClick={() => setActiveTab('search')}>
          防抖搜索 + 自动取消
        </div>
        <div style={tabStyle(activeTab === 'manual')} onClick={() => setActiveTab('manual')}>
          手动取消请求
        </div>
      </div>

      {activeTab === 'search' && (
        <div style={sectionStyle}>
          <div style={descStyle}>
            <strong>场景：</strong>用户在搜索框中快速输入时，每次输入都会触发搜索请求。
            使用防抖（600ms 延迟）+ AbortController，在发送新请求前取消上一个未完成的请求，
            避免浪费网络资源和处理过期响应。
            <br />
            <strong>请快速输入观察「已取消请求」计数器的变化。</strong>
          </div>
          <SearchBox />
        </div>
      )}

      {activeTab === 'manual' && (
        <div style={sectionStyle}>
          <div style={descStyle}>
            <strong>场景：</strong>点击「加载文章」发起请求，在请求完成前点击「取消请求」可以中断请求。
            这在用户主动取消操作或切换页面时非常有用。
          </div>
          <div style={buttonRowStyle}>
            <button
              style={primaryBtn}
              onClick={() => setPostId((prev) => prev + 1)}
            >
              加载文章 #{postId + 1}
            </button>
            <button style={dangerBtn} onClick={cancel} disabled={!loading}>
              取消请求
            </button>
          </div>
          <div style={cardStyle}>
            {loading && <div style={{ color: '#ff9800' }}>正在加载文章 #{postId}...</div>}
            {error && (
              <div style={{ color: '#f44336' }}>
                请求失败: {error.name === 'AbortError' ? '请求已被取消' : error.message}
              </div>
            )}
            {!loading && !error && data && (
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                  #{data.id} - {data.title}
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  {data.body}
                </p>
              </div>
            )}
            {!loading && !error && !data && (
              <div style={{ color: '#999' }}>点击「加载文章」按钮开始</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
