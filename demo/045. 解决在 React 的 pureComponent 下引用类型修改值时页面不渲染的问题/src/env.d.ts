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
  }
  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>
  }
  export class Component<P = {}, S = {}> {
    constructor(props?: P, context?: any)
    state: Readonly<S>
    props: Readonly<P> & Readonly<{ children?: ReactNode }>
    setState<K extends keyof S>(
      state:
        | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
        | Pick<S, K>
        | S
        | null,
      callback?: () => void,
    ): void
    forceUpdate(callback?: () => void): void
    render(): ReactNode
    componentDidMount?(): void
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void
    componentWillUnmount?(): void
  }
  export class PureComponent<P = {}, S = {}> extends Component<P, S> {}
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
  export const Fragment: unknown
  export const StrictMode: FC<{ children?: ReactNode }>
  export function memo<P>(component: (props: P) => ReactNode): typeof component
  const React: {
    createElement: (
      type: unknown,
      props?: Record<string, unknown>,
      ...children: ReactNode[]
    ) => unknown
    Fragment: unknown
    StrictMode: FC<{ children?: ReactNode }>
    Component: typeof Component
    PureComponent: typeof PureComponent
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
declare module 'vite' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>
}
declare module '@vitejs/plugin-react' {
  export default function react(options?: Record<string, unknown>): Record<string, unknown>
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
  class Component<P = {}, S = {}> {
    constructor(props?: P, context?: any)
    state: Readonly<S>
    props: Readonly<P> & Readonly<{ children?: ReactNode }>
    setState<K extends keyof S>(
      state:
        | ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null)
        | Pick<S, K>
        | S
        | null,
      callback?: () => void,
    ): void
    forceUpdate(callback?: () => void): void
    render(): ReactNode
    componentDidMount?(): void
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void
    componentWillUnmount?(): void
  }
  class PureComponent<P = {}, S = {}> extends Component<P, S> {}
}
declare namespace JSX {
  type Element = any
  interface ElementClass {}
  interface IntrinsicElements {
    [elemName: string]: any
  }
  type LibraryManagedAttributes<C, P> = P
}
