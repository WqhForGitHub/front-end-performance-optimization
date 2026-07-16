/**
 * 本地类型声明（fallback declarations）
 *
 * 作用：在不执行 `npm install`（无 node_modules）的情况下，
 * 让 `tsc --noEmit` 也能通过类型检查。
 */

// ===== Node 内置 =====
declare module 'path' {
  interface Path {
    resolve(...pathSegments: string[]): string
    join(...pathSegments: string[]): string
    dirname(p: string): string
    basename(p: string): string
    extname(p: string): string
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
  argv: string[]
}

// Node.js require（用于条件导入 / 动态加载）
declare function require(id: string): any

// ===== webpack =====
declare module 'webpack' {
  export type Configuration = Record<string, unknown>
  export class DllPlugin {
    constructor(options?: Record<string, unknown>)
  }
  export class DllReferencePlugin {
    constructor(options?: Record<string, unknown>)
  }
  export class DefinePlugin {
    constructor(options?: Record<string, unknown>)
  }
  export class NormalModuleReplacementPlugin {
    constructor(resourceRegExp: RegExp, newResource: string | ((resource: unknown) => void))
  }
  export class ContextReplacementPlugin {
    constructor(...args: unknown[])
  }
  export class BannerPlugin {
    constructor(options?: Record<string, unknown>)
  }
  export class ProvidePlugin {
    constructor(options?: Record<string, unknown>)
  }
  export class IgnorePlugin {
    constructor(options?: Record<string, unknown>)
  }
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

declare module 'css-minimizer-webpack-plugin' {
  export default class CssMinimizerPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module 'compression-webpack-plugin' {
  export default class CompressionPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module 'copy-webpack-plugin' {
  export default class CopyPlugin {
    constructor(options?: Record<string, unknown>)
  }
}

declare module 'webpack-bundle-analyzer' {
  export class BundleAnalyzerPlugin {
    constructor(options?: Record<string, unknown>)
  }
  export default BundleAnalyzerPlugin
}

declare module 'webpack-manifest-plugin' {
  export class WebpackManifestPlugin {
    constructor(options?: Record<string, unknown>)
  }
  export default WebpackManifestPlugin
}

declare module 'image-webpack-loader' {
  const loader: string
  export default loader
}

declare module 'thread-loader' {
  const loader: string
  export default loader
}

declare module 'babel-loader' {
  const loader: string
  export default loader
}

// ===== 第三方库 =====
declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][]
  export function flatten<T>(array: T[][]): T[]
  export function random(minimum: number, maximum: number): number
  export function range(start: number, end?: number, step?: number): number[]
  export function map<T, U>(array: T[], iteratee: (value: T) => U): U[]
  export function filter<T>(array: T[], predicate: (value: T) => boolean): T[]
  export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T
  export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T
  export function cloneDeep<T>(value: T): T
  export function merge<T>(object: T, ...sources: unknown[]): T
  export function pick<T>(object: T, keys: string[]): Partial<T>
  export function omit<T>(object: T, keys: string[]): Partial<T>
}

// CSS modules
declare module '*.css'
