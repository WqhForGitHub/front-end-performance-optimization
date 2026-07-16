/**
 * 未被使用的工具模块
 *
 * 此模块定义了一些函数，但 index.ts 从未导入此模块。
 * 在 Tree Shaking 开启时，整个模块会被移除，
 * 不会出现在最终的打包产物中。
 *
 * 可以通过对比 build 和 build:no-shake 的产物体积来验证效果。
 */

export function unusedFunction1(): string {
  return '这是一个未被使用的函数 1'
}

export function unusedFunction2(): number {
  return 42
}

export function unusedFunction3(): void {
  console.log('这是一个未被使用的函数 3')
}

/**
 * 模拟一个较大的未使用代码块，
 * 以便在对比打包体积时有明显差异
 */
export function largeUnusedFunction(): void {
  const data: number[] = []
  for (let i = 0; i < 1000; i++) {
    data.push(Math.random() * 100)
  }
  const sorted = data.sort((a, b) => a - b)
  console.log('排序后的数据:', sorted.slice(0, 10))
}
