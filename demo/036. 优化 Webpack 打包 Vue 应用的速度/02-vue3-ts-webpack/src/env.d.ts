/**
 * 本地类型声明（fallback declarations）
 *
 * 作用：在不执行 npm install（无 node_modules）的情况下，
 * 让 tsc --noEmit 也能通过类型检查。
 */

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

// ===== Vue 3 类型声明 =====
declare module 'vue' {
  export type Ref<T = any> = { value: T }
  export type ComputedRef<T = any> = Ref<T>
  export type CSSProperties = Record<string, string | number | undefined>

  export interface App {
    mount: (container: Element | string) => any
    unmount: () => void
    use: (plugin: any, options?: any) => any
    component: (name: string, component?: any) => any
    directive: (name: string, directive?: any) => any
  }

  export function defineComponent(options: any): any
  export function ref<T>(value: T): Ref<T>
  export function reactive<T extends object>(target: T): T
  export function computed<T>(getter: () => T): ComputedRef<T>
  export function watch(source: any, callback: any, options?: any): void
  export function watchEffect(effect: () => void): void
  export function onMounted(callback: () => void): void
  export function onUnmounted(callback: () => void): void
  export function nextTick(callback?: () => void): Promise<void>
  export function h(type: any, props?: any, children?: any): any
  export function createApp(rootComponent: any, rootProps?: any): App

  export const KeepAlive: any
  export const Transition: any
  export const Fragment: any
  export const Suspense: any
  export const Teleport: any
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// ===== webpack =====
declare module 'webpack' {
  export type Configuration = Record<string, unknown>
}

// ===== webpack 插件 =====
declare module 'vue-loader' {
  export const VueLoaderPlugin: any
}

declare module 'mini-css-extract-plugin' {
  export default class MiniCssExtractPlugin {
    constructor(options?: Record<string, unknown>)
    static loader: string
  }
}

declare module 'terser-webpack-plugin' {
  export default class TerserPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module 'html-webpack-plugin' {
  export default class HtmlWebpackPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module 'cache-loader' {
  const loader: string
  export default loader
}

declare module 'vue-style-loader' {
  const loader: string
  export default loader
}

declare module 'thread-loader' {
  const loader: string
  export default loader
}

declare module '*.css'
