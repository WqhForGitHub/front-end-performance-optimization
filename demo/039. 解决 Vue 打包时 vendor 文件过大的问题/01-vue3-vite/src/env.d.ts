/** 本地类型声明 */
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
  export function defineAsyncComponent(options: any): any
  export function shallowRef<T>(value: T): Ref<T>
  export function createApp(rootComponent: any, rootProps?: any): App

  export const KeepAlive: any
  export const Transition: any
  export const Fragment: any
  export const Suspense: any
  export const Teleport: any
}

declare module '@vitejs/plugin-vue' {
  export default function vue(options?: Record<string, unknown>): Record<string, unknown>
}

declare module 'vite' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>
}

declare module 'vite-plugin-compression' {
  export default function viteCompression(options?: Record<string, unknown>): Record<string, unknown>
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css'
