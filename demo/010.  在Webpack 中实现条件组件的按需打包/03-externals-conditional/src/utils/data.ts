/**
 * data.ts -- 使用 lodash 的工具模块
 *
 * 业务代码只关心 import lodash，不关心它是被打包还是走 CDN。
 * 是否 external 由 webpack.config.ts 的函数式 externals 决定。
 */
import { chunk, flatten, random, range, map } from 'lodash'

/** 生成一组随机数据 */
export function generateRandomData(count: number): number[] {
  // range(0, count) 生成 [0, 1, ..., count-1]
  // map 把每个值映射成一个随机数
  return map(range(0, count), () => random(1, 100))
}

/** 把数组切成每段 size 个的小数组，再拍平，演示 lodash 链式用法 */
export function chunkAndFlatten(data: number[], size: number): number[] {
  return flatten(chunk(data, size))
}

/** 对数据进行分页展示 */
export function paginate<T>(data: T[], pageSize: number): T[][] {
  return chunk(data, pageSize)
}
