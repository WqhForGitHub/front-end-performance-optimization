/**
 * 本地类型声明（fallback declarations）
 *
 * 作用：在不执行 `npm install`（无 node_modules）的情况下，
 * 让 `tsc --noEmit` 也能通过类型检查。
 *
 * 说明：
 * - 这些声明覆盖了项目用到的第三方模块（webpack、各 loader 插件）
 *   以及 Node 内置（path / __dirname / process）。
 * - 安装依赖后，本文件依然有效（不会产生重复声明冲突），
 *   但 webpack 配置的类型会以本文件的宽松定义为准。
 * - 如需使用第三方库的完整精确类型，可在安装依赖后删除本文件。
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

// ===== webpack =====
declare module 'webpack' {
  /** 宽松的配置类型，接受任意结构，便于无依赖时通过类型检查 */
  export type Configuration = Record<string, unknown>

  export class DllPlugin {
    constructor(options?: Record<string, unknown>)
  }

  export class DllReferencePlugin {
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

declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][]
  export function flatten<T>(array: T[][]): T[]
  export function random(minimum: number, maximum: number): number
  export function range(start: number, end?: number, step?: number): number[]
  export function map<T, U>(array: T[], iteratee: (value: T) => U): U[]
  export function filter<T>(array: T[], predicate: (value: T) => boolean): T[]
}
