/**
 * 本地类型声明（fallback declarations）
 * 作用：在不执行 npm install（无 node_modules）的情况下，让 tsc --noEmit 也能通过类型检查。
 */

// ===== React 相关 =====
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
  export type KeyboardEvent<T = HTMLElement> = {
    key: string
    preventDefault: () => void
    target: T
  }
  export type InputHTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    value?: string
    onChange?: (e: ChangeEvent<T>) => void
    onInput?: (e: ChangeEvent<T>) => void
    onKeyDown?: (e: KeyboardEvent<T>) => void
    placeholder?: string
    type?: string
    disabled?: boolean
    checked?: boolean
    name?: string
    id?: string
    className?: string
    style?: CSSProperties
    autoFocus?: boolean
  }
  export type ButtonHTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    onClick?: (e: MouseEvent<T>) => void
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    className?: string
    style?: CSSProperties
    children?: ReactNode
  }
  export type HTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    className?: string
    style?: CSSProperties
    children?: ReactNode
    onClick?: (e: MouseEvent<T>) => void
    id?: string
  }
  export type ImgHTMLAttributes<T = HTMLElement> = HTMLAttributes<T> & {
    src?: string
    alt?: string
    width?: number | string
    height?: number | string
    loading?: 'eager' | 'lazy'
  }
  export type DivHTMLAttributes<T = HTMLElement> = HTMLAttributes<T> & {
    ref?: RefObject<T>
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
  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initialState: S,
  ): [S, (action: A) => void]
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

// ===== Webpack 相关 =====
declare module 'webpack' {
  export default function webpack(config: Record<string, unknown>): any
  export interface Configuration {
    [key: string]: any
  }
}
declare module 'webpack-cli' {}
declare module 'terser-webpack-plugin' {
  export default class TerserPlugin {
    constructor(options?: Record<string, unknown>)
  }
}
declare module 'ts-loader' {}
declare module 'html-webpack-plugin' {
  export default class HtmlWebpackPlugin {
    constructor(options?: Record<string, unknown>)
  }
}
declare module 'webpack-dev-server' {}

// ===== Node 内置（webpack.config.ts 用到 path / __dirname）=====
declare module 'path' {
  interface Path {
    resolve(...pathSegments: string[]): string
    join(...pathSegments: string[]): string
    dirname(p: string): string
  }
  const path: Path
  export default path
}
declare const __dirname: string
declare const process: {
  env: {
    NODE_ENV?: string
    [key: string]: string | undefined
  }
}

// ===== 静态资源 =====
declare module '*.css'
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}

declare namespace JSX {
  type Element = any
  interface ElementClass {}
  interface IntrinsicElements {
    [elemName: string]: any
  }
  type LibraryManagedAttributes<C, P> = P
}
