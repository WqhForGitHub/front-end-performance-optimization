/**
 * DataContext - 数据状态提升到 Context
 *
 * 核心思想：把“请求 + 数据”这一状态提升到共同父级（DataProvider），
 * 在 Provider 内部只发起一次请求，然后通过 Context 向下分发数据。
 * 3 个子组件各自 useContext 读取同一份数据，不会再发起额外请求。
 *
 * 优点：数据来源单一、天然去重，配合 Provider 还能集中处理 loading/error。
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type FC,
  type ReactNode,
} from 'react'
import { fetchUser, type UserData } from '../api/mockApi'

interface DataContextValue {
  data: UserData | undefined
  loading: boolean
  error: Error | undefined
  refresh: () => void
}

// 创建 Context，默认值 undefined，由 useData 内部做存在性校验
const DataContext = createContext<DataContextValue | undefined>(undefined)

interface DataProviderProps {
  children?: ReactNode
}

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<UserData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  // refreshKey 变化时重新发起一次请求
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // 请求只在 Provider 这一层发起一次
    fetchUser()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(undefined)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const value: DataContextValue = { data, loading, error, refresh }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/** 在子组件中读取共享数据 */
export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (ctx === undefined) {
    throw new Error('useData 必须在 <DataProvider> 内部使用')
  }
  return ctx
}
