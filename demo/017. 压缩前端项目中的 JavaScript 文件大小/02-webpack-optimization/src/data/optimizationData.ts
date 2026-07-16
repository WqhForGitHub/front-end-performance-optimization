/**
 * Webpack 优化策略与分包数据
 */

export interface OptimizationStrategy {
  /** 策略名称 */
  name: string
  /** 配置项 */
  config: string
  /** 说明 */
  desc: string
  /** 体积节省比例（相对原始体积） */
  savedPercent: number
  /** 颜色 */
  color: string
}

export const optimizationStrategies: OptimizationStrategy[] = [
  {
    name: 'TerserPlugin 压缩',
    config: 'optimization.minimizer',
    desc: '通过 TerserPlugin 移除空白 / 注释 / console / debugger，混淆变量名，消除死代码',
    savedPercent: 56.2,
    color: '#1976d2',
  },
  {
    name: 'Tree Shaking',
    config: 'optimization.usedExports + sideEffects:false',
    desc: '标记并移除未使用的导出；package.json 设置 sideEffects:false 让 webpack 安全删除未引用模块',
    savedPercent: 12.8,
    color: '#388e3c',
  },
  {
    name: '代码分割 splitChunks',
    config: 'optimization.splitChunks',
    desc: '按 node_modules / react 拆分 chunk，首屏只加载必要 chunk，其余按需异步',
    savedPercent: 42.5,
    color: '#7b1fa2',
  },
  {
    name: 'Scope Hoisting',
    config: 'optimization.concatenateModules',
    desc: '把多个模块的代码合并到一个函数作用域，减少函数声明与闭包开销',
    savedPercent: 4.3,
    color: '#f57c00',
  },
  {
    name: 'runtimeChunk 提取',
    config: 'optimization.runtimeChunk',
    desc: '把 webpack runtime 提取到单独文件，业务代码变化不影响 vendor 长缓存',
    savedPercent: 2.1,
    color: '#0097a7',
  },
  {
    name: 'contenthash 文件名',
    config: 'output.filename + [contenthash]',
    desc: '文件名带内容 hash，配合强缓存策略实现“文件不变则永远命中缓存”',
    savedPercent: 0,
    color: '#5d4037',
  },
]

export interface ChunkInfo {
  /** chunk 名称 */
  name: string
  /** chunk 说明 */
  desc: string
  /** 大小（KB） */
  size: number
  /** 是否首屏必需 */
  firstLoad: boolean
  /** 颜色 */
  color: string
}

/**
 * 代码分割对比数据
 * - chunkSplitData[0]   : 单 bundle 方案的总体积
 * - chunkSplitData[1..] : 多 chunk 方案各 chunk 的体积
 */
export const chunkSplitData: ChunkInfo[] = [
  {
    name: '单 bundle（优化前）',
    desc: 'react + react-dom + 业务代码 + 工具库 全部打到 1 个 bundle',
    size: 275.2,
    firstLoad: true,
    color: '#ef5350',
  },
  {
    name: 'main.[hash].js',
    desc: '业务主入口（仅含本页业务逻辑）',
    size: 96.4,
    firstLoad: true,
    color: '#42a5f5',
  },
  {
    name: 'react.[hash].js',
    desc: 'react + react-dom（拆分后可长缓存）',
    size: 44.9,
    firstLoad: true,
    color: '#66bb6a',
  },
  {
    name: 'vendors.[hash].js',
    desc: 'node_modules 中的其他依赖（lodash 等）',
    size: 64.2,
    firstLoad: false,
    color: '#ab47bc',
  },
  {
    name: 'runtime.[hash].js',
    desc: 'webpack runtime（模块加载器，体积小）',
    size: 2.4,
    firstLoad: true,
    color: '#ffa726',
  },
  {
    name: 'lazy-page.[hash].chunk.js',
    desc: '懒加载的二级页面 chunk（路由切换时才加载）',
    size: 68.7,
    firstLoad: false,
    color: '#26c6da',
  },
]
