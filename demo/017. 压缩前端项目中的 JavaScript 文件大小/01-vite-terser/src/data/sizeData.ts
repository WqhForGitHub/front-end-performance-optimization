/**
 * 压缩前后体积数据
 *
 * 这里以“一个中等规模 React 项目构建产物”为示例。
 * 实际数字会随项目复杂度、依赖、压缩配置不同而变化。
 *
 * 数据维度：
 * - original  : 原始未压缩（开发构建，保留注释 / 空白 / 长变量名）
 * - minified  : Terser 压缩后（移除空白、注释，混淆变量名，drop_console 等）
 * - saved     : 相对原始节省的字节数
 */
export interface SizeEntry {
  /** 资源名称 */
  name: string
  /** 资源说明 */
  desc: string
  /** 原始大小（KB） */
  original: number
  /** Terser 压缩后大小（KB） */
  minified: number
}

/**
 * 一组示例构建产物体积数据
 */
export const sizeEntries: SizeEntry[] = [
  {
    name: 'main.js',
    desc: '业务主入口（含所有页面 + 业务逻辑）',
    original: 528.4,
    minified: 178.6,
  },
  {
    name: 'react-vendor.js',
    desc: 'react + react-dom 拆分后的 vendor chunk',
    original: 142.3,
    minified: 44.9,
  },
  {
    name: 'lodash.js',
    desc: 'lodash 工具库（未做按需引入的部分）',
    original: 73.1,
    minified: 25.7,
  },
  {
    name: 'utils.js',
    desc: '项目内部通用工具函数集合',
    original: 46.8,
    minified: 14.2,
  },
  {
    name: 'styles.css',
    desc: '全局样式 + 业务样式（CSS 也会被压缩）',
    original: 38.5,
    minified: 11.8,
  },
  {
    name: 'Total',
    desc: '合计',
    original: 829.1,
    minified: 275.2,
  },
]

/**
 * 各 Terser 选项对最终体积的贡献（示意值）
 */
export interface TerserOptionImpact {
  /** 选项名称 */
  option: string
  /** 说明 */
  desc: string
  /** 启用后相对原始节省的体积百分比 */
  savedPercent: number
  /** 是否启用 */
  enabled: boolean
}

export const terserOptionsImpact: TerserOptionImpact[] = [
  {
    option: 'drop_console',
    desc: '移除所有 console.* 调用，避免调试日志泄露并减小体积',
    savedPercent: 4.8,
    enabled: true,
  },
  {
    option: 'drop_debugger',
    desc: '移除 debugger 断点语句',
    savedPercent: 0.2,
    enabled: true,
  },
  {
    option: 'mangle.toplevel',
    desc: '混淆顶层变量名（缩短为 a、b、c 等单字符）',
    savedPercent: 12.5,
    enabled: true,
  },
  {
    option: 'compress.unused',
    desc: '删除未使用的变量与函数',
    savedPercent: 8.1,
    enabled: true,
  },
  {
    option: 'compress.dead_code',
    desc: '死代码消除（如 if (false) 分支）',
    savedPercent: 3.6,
    enabled: true,
  },
  {
    option: 'format.comments=false',
    desc: '移除所有注释',
    savedPercent: 9.4,
    enabled: true,
  },
  {
    option: 'compress.sequences',
    desc: '将多条语句合并为逗号表达式',
    savedPercent: 2.3,
    enabled: true,
  },
  {
    option: 'compress.evaluate',
    desc: '编译期计算常量表达式',
    savedPercent: 1.7,
    enabled: true,
  },
]
