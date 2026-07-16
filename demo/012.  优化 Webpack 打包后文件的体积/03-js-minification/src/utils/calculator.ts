/**
 * 计算器工具模块
 *
 * 提供基本的四则运算功能。
 * 在开启 terser 压缩后，变量名会被混淆，注释会被移除。
 */

/**
 * 数字格式化函数
 * @param value 需要格式化的数字
 * @param decimals 保留的小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 计算器类
 * 封装了基本的四则运算方法
 */
export class Calculator {
  private name: string

  constructor(name: string) {
    this.name = name
  }

  /**
   * 获取计算器名称
   */
  public getName(): string {
    return this.name
  }

  /**
   * 加法运算
   */
  public add(a: number, b: number): number {
    return a + b
  }

  /**
   * 减法运算
   */
  public subtract(a: number, b: number): number {
    return a - b
  }

  /**
   * 乘法运算
   */
  public multiply(a: number, b: number): number {
    return a * b
  }

  /**
   * 除法运算
   */
  public divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('除数不能为零')
    }
    return a / b
  }

  /**
   * 计算平均值
   */
  public average(numbers: number[]): number {
    if (numbers.length === 0) {
      return 0
    }
    const sum = numbers.reduce((acc, cur) => acc + cur, 0)
    return sum / numbers.length
  }

  /**
   * 计算百分比
   */
  public percentage(part: number, total: number): string {
    if (total === 0) {
      return '0%'
    }
    return `${formatNumber((part / total) * 100, 1)}%`
  }
}
