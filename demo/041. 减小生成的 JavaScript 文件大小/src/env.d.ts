/** 本地类型声明（fallback declarations） */

// ===== Node 内置（替代 @types/node 中用到的部分）=====
declare module 'path' {
  interface Path {
    resolve(...pathSegments: string[]): string
    join(...pathSegments: string[]): string
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

// ===== React 类型声明 =====
declare module 'react' {
  export type ReactNode = string | number | boolean | null | undefined | Iterable<ReactNode>
  export type FC<P = Record<string, unknown>> = (props: P & { children?: ReactNode }) => ReactNode
  export type CSSProperties = Record<string, string | number | undefined>
  export type HTMLAttributes<T = HTMLElement> = Record<string, unknown> & {
    className?: string
    style?: CSSProperties
    children?: ReactNode
    onClick?: (e: { target: T; preventDefault: () => void }) => void
  }
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: ReadonlyArray<unknown>,
  ): T
  export function memo<P>(component: (props: P) => ReactNode): typeof component
  export const Fragment: unknown
  export const StrictMode: FC<{ children?: ReactNode }>
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

// ===== webpack =====
declare module 'webpack' {
  export type Configuration = Record<string, unknown>
}

// ===== webpack 插件 =====
declare module 'html-webpack-plugin' {
  export default class HtmlWebpackPlugin {
    constructor(options?: Record<string, unknown>)
  }
}
declare module 'terser-webpack-plugin' {
  export default class TerserPlugin {
    constructor(options?: Record<string, unknown>)
  }
}
declare module 'mini-css-extract-plugin' {
  export default class MiniCssExtractPlugin {
    constructor(options?: Record<string, unknown>)
    static loader: string
  }
}
declare module 'compression-webpack-plugin' {
  export default class CompressionPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module '*.css'

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
