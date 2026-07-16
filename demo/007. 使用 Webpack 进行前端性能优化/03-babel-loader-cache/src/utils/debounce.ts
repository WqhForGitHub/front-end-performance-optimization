export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
