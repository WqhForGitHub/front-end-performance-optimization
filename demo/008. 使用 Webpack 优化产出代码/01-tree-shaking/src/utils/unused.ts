/**
 * 未使用的工具模块
 *
 * index.ts 没有导入本文件的任何导出。
 * 配合 package.json 的 "sideEffects": false，
 * webpack 会将整个文件移除，不会出现在产物中。
 */

export function unusedUtilityA(): string {
  return 'This function should be tree-shaken'
}

export function unusedUtilityB(): string {
  return 'This entire file should be removed'
}

export const UNUSED_CONSTANT = 42
