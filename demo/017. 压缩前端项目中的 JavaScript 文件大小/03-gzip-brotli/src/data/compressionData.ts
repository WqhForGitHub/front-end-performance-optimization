/**
 * 压缩算法对比数据
 *
 * 以一个 React 项目的构建产物为示例，对比 4 种状态下的体积：
 * - original  : 原始未压缩（开发构建）
 * - minified  : Terser/esbuild 压缩后（生产构建）
 * - gzipped   : 在 minified 基础上 gzip 压缩
 * - brotli    : 在 minified 基础上 brotli 压缩
 */

export interface CompressionEntry {
  /** 资源名称 */
  name: string
  /** 资源说明 */
  desc: string
  /** 原始大小（KB） */
  original: number
  /** 压缩后大小（KB） */
  minified: number
  /** gzip 压缩后大小（KB） */
  gzipped: number
  /** brotli 压缩后大小（KB） */
  brotli: number
}

export const compressionEntries: CompressionEntry[] = [
  {
    name: 'main.js',
    desc: '业务主入口（含路由 + 业务逻辑）',
    original: 528.4,
    minified: 178.6,
    gzipped: 56.3,
    brotli: 47.8,
  },
  {
    name: 'react-vendor.js',
    desc: 'react + react-dom 拆分后的 vendor chunk',
    original: 142.3,
    minified: 44.9,
    gzipped: 14.2,
    brotli: 12.6,
  },
  {
    name: 'lodash.js',
    desc: 'lodash 工具库',
    original: 73.1,
    minified: 25.7,
    gzipped: 9.1,
    brotli: 7.9,
  },
  {
    name: 'styles.css',
    desc: '全局样式表（CSS 同样支持 gzip / brotli）',
    original: 38.5,
    minified: 11.8,
    gzipped: 3.4,
    brotli: 2.9,
  },
  {
    name: 'Total',
    desc: '合计',
    original: 782.3,
    minified: 261.0,
    gzipped: 83.0,
    brotli: 71.2,
  },
]

export interface AlgorithmInfo {
  /** 算法名称 */
  name: string
  /** 算法说明 */
  desc: string
  /** 压缩等级范围 */
  level: string
  /** 浏览器兼容性 */
  compatibility: string
  /** 平均压缩率（相对 minified） */
  ratio: number
  /** 压缩速度 */
  speed: string
  /** 是否需要 HTTPS */
  httpsOnly: boolean
  /** 颜色 */
  color: string
}

export const algorithmInfo: AlgorithmInfo[] = [
  {
    name: 'gzip',
    desc: '基于 DEFLATE 算法，所有现代浏览器都支持，是 Web 压缩的事实标准',
    level: '1-9（推荐 6-9）',
    compatibility: '所有现代浏览器（HTTP/HTTPS 均可）',
    ratio: 0.32,
    speed: '快',
    httpsOnly: false,
    color: '#1976d2',
  },
  {
    name: 'brotli',
    desc: 'Google 推出，针对 Web 文本（HTML/CSS/JS）优化，压缩率比 gzip 高 15%~25%',
    level: '0-11（推荐 11）',
    compatibility: '现代浏览器（仅 HTTPS 下生效）',
    ratio: 0.27,
    speed: '慢（最高等级）',
    httpsOnly: true,
    color: '#388e3c',
  },
]

export interface NginxConfig {
  /** 指令名称 */
  directive: string
  /** 说明 */
  desc: string
}

export const nginxDirectives: NginxConfig[] = [
  {
    directive: 'gzip_static on;',
    desc: '优先返回预压缩的 .gz 文件，避免运行时压缩',
  },
  {
    directive: 'brotli_static on;',
    desc: '优先返回预压缩的 .br 文件（需 ngx_brotli 模块）',
  },
  {
    directive: 'gzip_vary on;',
    desc: '响应头加上 Vary: Accept-Encoding，让 CDN/代理正确缓存不同编码版本',
  },
  {
    directive: 'gzip_types text/plain text/css application/javascript ...',
    desc: '指定哪些 MIME 类型参与压缩',
  },
]
