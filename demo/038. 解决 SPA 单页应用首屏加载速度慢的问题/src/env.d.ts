/** 本地类型声明 */
declare module 'react' {
  export type ReactNode = string | number | boolean | null | undefined | Iterable<ReactNode>
  export type FC<P = Record<string, unknown>> = (props: P & { children?: ReactNode }) => ReactNode
  export type CSSProperties = Record<string, string | number | undefined>
  export type RefObject<T> = { current: T | null }
  export type ChangeEvent<T = HTMLInputElement> = { target: T & { value: string } }
  export type MouseEvent<T = HTMLElement> = {
    preventDefault: () => void
    currentTarget: T
    target: T
  }
  export type HTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    className?: string
    style?: CSSProperties
    children?: ReactNode
    onClick?: (e: MouseEvent<T>) => void
    id?: string
  }
  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
  export function useState<T = undefined>(): [T | undefined, (value: T) => void]
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void
  export function useRef<T>(initial: T): { current: T }
  export function useRef<T = undefined>(): { current: T | null }
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: ReadonlyArray<unknown>,
  ): T
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T
  export function useContext<T>(context: Context<T>): T
  export function createContext<T>(defaultValue: T): Context<T>
  export const Fragment: unknown
  export const StrictMode: FC<{ children?: ReactNode }>
  export function memo<P>(component: (props: P) => ReactNode): typeof component
  export const Suspense: FC<{ fallback?: ReactNode; children?: ReactNode }>
  export function lazy<T>(loader: () => Promise<{ default: T }>): T
  const React: {
    createElement: (
      type: unknown,
      props?: Record<string, unknown>,
      ...children: ReactNode[]
    ) => unknown
    Fragment: unknown
    StrictMode: FC<{ children?: ReactNode }>
  }
  export default React
}
declare module 'react/jsx-runtime' {
  export function jsx(
    type: unknown,
    props: Record<string, unknown> | null,
    key?: string | number,
  ): unknown
  export function jsxs(
    type: unknown,
    props: Record<string, unknown> | null,
    key?: string | number,
  ): unknown
  export const Fragment: unknown
  export namespace JSX {
    type Element = any
    interface ElementClass {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
    type LibraryManagedAttributes<C, P> = P
  }
}
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render: (children: unknown) => void
    unmount: () => void
  }
}
declare module 'react-router-dom' {
  import type { FC, ReactNode } from 'react'
  export type BrowserRouterProps = { children?: ReactNode }
  export const BrowserRouter: FC<BrowserRouterProps>
  export type RoutesProps = { children?: ReactNode }
  export const Routes: FC<RoutesProps>
  export type RouteProps = {
    path?: string
    element?: ReactNode
    index?: boolean
    children?: ReactNode
  }
  export const Route: FC<RouteProps>
  export type LinkProps = { to: string; children?: ReactNode; className?: string; key?: string | number; style?: Record<string, string | number>; onMouseEnter?: () => void }
  export const Link: FC<LinkProps>
  export function useNavigate(): (path: string) => void
  export function useLocation(): { pathname: string }
  export const useNavigate: () => (path: string) => void
}
declare module 'vite' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>
}
declare module '@vitejs/plugin-react' {
  export default function react(options?: Record<string, unknown>): Record<string, unknown>
}
declare module '*.css'
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
/** 全局 React 命名空间（支持 React.CSSProperties 等类型访问） */
declare namespace React {
  type ReactNode = string | number | boolean | null | undefined | Iterable<ReactNode>
  type FC<P = Record<string, unknown>> = (props: P & { children?: ReactNode }) => ReactNode
  type CSSProperties = Record<string, string | number | undefined>
  type RefObject<T> = { current: T | null }
  type ChangeEvent<T = HTMLInputElement> = { target: T & { value: string } }
  type MouseEvent<T = HTMLElement> = {
    preventDefault: () => void
    currentTarget: T
    target: T
  }
  type HTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    className?: string
    style?: CSSProperties
    children?: ReactNode
    onClick?: (e: MouseEvent<T>) => void
    id?: string
  }
}
declare namespace JSX {
  type Element = any
  interface ElementClass {}
  interface IntrinsicElements {
    [elemName: string]: any
  }
  type LibraryManagedAttributes<C, P> = P
}
