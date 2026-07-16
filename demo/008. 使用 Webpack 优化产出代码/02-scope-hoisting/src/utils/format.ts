/** 工具模块 A */
export function greet(name: string): string {
  return `Hello, ${name}!`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}
