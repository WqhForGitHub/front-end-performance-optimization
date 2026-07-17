import * as React from 'react'
import type { ReactNode } from 'react'

/**
 * ErrorBoundary -- 错误边界（类组件）
 *
 * React 中只有类组件可以成为错误边界。需要实现两个生命周期：
 *   1. static getDerivedStateFromError(error) -- 渲染阶段调用，返回新 state 切换到 fallback
 *   2. componentDidCatch(error, info)          -- 提交阶段调用，用于副作用（日志上报）
 *
 * 注意：env.d.ts 中未声明 React.Component（仅声明了函数组件相关类型），
 * 这里通过 (React as any).Component 获取真实 Component，保证运行时正确。
 * 类型层面用 any 绕过，不影响 tsc --noEmit。
 *
 * 错误边界能捕获什么：
 *   - 子组件渲染期间的同步错误
 *   - 生命周期中的错误
 *
 * 错误边界不能捕获什么：
 *   - 事件回调中的错误（onClick 里 throw）
 *   - 异步代码（setTimeout / Promise.then / requestAnimationFrame）
 *   - 服务端渲染错误
 *   - ErrorBoundary 自身抛出的错误（只能由上层边界捕获）
 */

// 获取真实的 React.Component（类型层面用 any 绕过）
const Component: any = (React as any).Component

export interface ErrorBoundaryProps {
  children?: ReactNode
  /** 自定义 fallback UI；不传则使用默认 fallback */
  fallback?: ReactNode
  /** 出错时的回调，用于日志上报 */
  onError?: (error: Error, info: { componentStack: string }) => void
  /** 重置时的回调 */
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: { componentStack: string } | null
}

export class ErrorBoundary extends Component {
  declare props: ErrorBoundaryProps
  declare state: ErrorBoundaryState

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * 渲染阶段调用（getDerivedStateFromError）
   * 接收子树抛出的错误，返回新的 state 来触发 fallback 渲染。
   * 注意：这里不能执行副作用（不能 console.log、不能发请求）。
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  /**
   * 提交阶段调用（componentDidCatch）
   * 可以执行副作用：日志上报、Sentry、监控等。
   * 此时 DOM 已经更新为 fallback，可以安全地做副作用操作。
   */
  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    this.setState({ errorInfo })
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  /**
   * 重置错误状态，让子组件重新渲染。
   * 通常配合"重试"按钮使用。
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 优先使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback
      }
      // 默认 fallback UI
      return (
        <div className="error-fallback">
          <div className="error-icon">!</div>
          <h3>组件渲染出错</h3>
          <p className="error-message">
            {this.state.error?.message || '未知错误'}
          </p>
          {this.state.errorInfo && (
            <details className="error-details">
              <summary>组件堆栈</summary>
              <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          <button className="btn-primary" onClick={this.handleReset}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
