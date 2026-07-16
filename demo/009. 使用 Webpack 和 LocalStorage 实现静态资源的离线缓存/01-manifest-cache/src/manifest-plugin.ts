/**
 * 自定义 Manifest 插件
 *
 * 作用：在 webpack 构建完成时，遍历 compilation.assets 生成一份
 * 「资源清单（manifest）」，包含每个产物的文件名与对应的 contenthash。
 *
 * 清单会被注入到一个独立的 manifest.json 产物中，
 * 同时通过 webpack 的 DefinePlugin 机制或运行时 fetch 加载到前端，
 * 前端 CacheManager 据此决定哪些资源需要重新拉取、哪些可走 LocalStorage 缓存。
 *
 * 这里只是一个最小实现，演示自定义插件的基本结构：
 *   1. 通过 compiler.hooks.emit 拿到 compilation.assets
 *   2. 解析每个 asset 的文件名，提取 [contenthash:8] 段
 *   3. 写入一个 manifest.json 到产物中
 */

/** 单个资源条目 */
export interface ManifestEntry {
  /** 资源名称（含目录，如 js/bundle.abcd1234.js） */
  name: string
  /** 提取出的 contenthash（8 位），无则为空字符串 */
  hash: string
  /** 文件大小（字节） */
  size: number
}

/** 整个 manifest 的结构 */
export interface ManifestData {
  /** 构建时间戳 */
  buildAt: number
  /** 资源条目列表 */
  assets: ManifestEntry[]
}

/** 从文件名中提取 8 位 contenthash 的简易正则 */
const HASH_REGEX = /\.([a-f0-9]{8})\.(js|css)$/i

/**
 * ManifestPlugin
 *
 * 用法：在 webpack.config.ts 中 `new ManifestPlugin()` 加入 plugins 数组。
 */
export class ManifestPlugin {
  static pluginName = 'ManifestPlugin'

  /**
   * 这里采用「鸭子类型」的 webpack 插件签名，
   * 接收一个宽松的 compiler 对象，避免依赖 webpack 真实类型。
   */
  apply(compiler: {
    hooks: {
      emit: {
        tapAsync: (
          name: string,
          fn: (compilation: unknown, callback: () => void) => void,
        ) => void
      }
    }
  }): void {
    compiler.hooks.emit.tapAsync(ManifestPlugin.pluginName, (compilation, callback) => {
      const assets = (compilation as { assets: Record<string, { size: () => number }> }).assets
      const entries: ManifestEntry[] = []

      for (const name of Object.keys(assets)) {
        const match = name.match(HASH_REGEX)
        entries.push({
          name,
          hash: match ? match[1] : '',
          size: assets[name].size(),
        })
      }

      const manifest: ManifestData = {
        buildAt: Date.now(),
        assets: entries,
      }

      // 将 manifest.json 写入产物
      assets['manifest.json'] = {
        source: () => JSON.stringify(manifest, null, 2),
        size: () => JSON.stringify(manifest).length,
      } as unknown as { size: () => number }

      callback()
    })
  }
}
