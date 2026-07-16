export function throttle<T extends (...args: never[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: unknown, ...args: Parameters<T>): void {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}
