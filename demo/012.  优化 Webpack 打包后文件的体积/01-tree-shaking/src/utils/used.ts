/**
 * 被使用的工具模块
 *
 * 此模块中的 add 和 multiply 函数会被 index.ts 导入并使用，
 * 因此在 Tree Shaking 过程中会被保留在最终产物中。
 */

export function add(a: number, b: number): number {
  return a + b
}

export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * subtract 函数虽然被导出，但没有被 index.ts 导入，
 * 在 Tree Shaking 开启时会被移除。
 */
export function subtract(a: number, b: number): number {
  return a - b
}
