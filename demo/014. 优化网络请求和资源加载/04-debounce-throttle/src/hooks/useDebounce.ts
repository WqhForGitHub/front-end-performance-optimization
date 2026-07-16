import { useState, useEffect } from 'react'

/**
 * 防抖 Hook
 *
 * 延迟更新值，只有在用户停止输入 delay 毫秒后才更新。
 * 适用于搜索输入框、窗口大小调整等频繁触发的事件。
 *
 * @param value 需要防抖的值
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的值
 *
 * @example
 * const [input, setInput] = useState('')
 * const debouncedInput = useDebounce(input, 500)
 * useEffect(() => { search(debouncedInput) }, [debouncedInput])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置定时器，delay 后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清除上一个定时器（如果 value 在 delay 内再次变化）
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖回调 Hook
 *
 * 返回一个防抖后的回调函数，只有在最后一次调用后 delay 毫秒才真正执行。
 *
 * @param callback 需要防抖的回调函数
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的回调函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined)

  const debouncedFn = ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    const newTimer = setTimeout(() => {
      callback(...args)
    }, delay)
    setTimer(newTimer)
  }) as T

  return debouncedFn
}
