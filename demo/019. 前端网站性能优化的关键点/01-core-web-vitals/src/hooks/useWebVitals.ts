import { useEffect, useRef, useState } from 'react'

/**
 * Web Vitals 指标类型
 */
export type Rating = 'good' | 'needs-improvement' | 'poor' | 'pending'

export interface MetricData {
  /** 指标名称 */
  name: 'LCP' | 'CLS' | 'INP'
  /** 当前数值 */
  value: number
  /** 评级 */
  rating: Rating
  /** 单位 */
  unit: string
  /** 采集时间戳 */
  timestamp: number
}

export interface MetricRecord {
  name: 'LCP' | 'CLS' | 'INP'
  value: number
  rating: Rating
  timestamp: number
}

interface SessionState {
  lcp: number | null
  cls: number
  inp: number | null
  history: MetricRecord[]
}

/**
 * 评级阈值（基于 Google 官方 Core Web Vitals 标准）
 * - LCP: 良好 <= 2500ms, 需改进 <= 4000ms, 较差 > 4000ms
 * - CLS: 良好 <= 0.1, 需改进 <= 0.25, 较差 > 0.25
 * - INP: 良好 <= 200ms, 需改进 <= 500ms, 较差 > 500ms
 */
export function getRating(name: 'LCP' | 'CLS' | 'INP', value: number | null): Rating {
  if (value === null) return 'pending'
  if (name === 'LCP') {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }
  if (name === 'CLS') {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }
  // INP
  if (value <= 200) return 'good'
  if (value <= 500) return 'needs-improvement'
  return 'poor'
}

/**
 * 使用 PerformanceObserver API 采集 Core Web Vitals 指标
 *
 * - LCP: largest-contentful-paint，取最后一次上报的值
 * - CLS: layout-shift，累加所有无最近输入的布局偏移
 * - INP: event，跟踪所有交互事件的最差（最大）延迟
 */
export function useWebVitals() {
  const [metrics, setMetrics] = useState<Record<'LCP' | 'CLS' | 'INP', MetricData>>({
    LCP: { name: 'LCP', value: 0, rating: 'pending', unit: 'ms', timestamp: 0 },
    CLS: { name: 'CLS', value: 0, rating: 'pending', unit: '', timestamp: 0 },
    INP: { name: 'INP', value: 0, rating: 'pending', unit: 'ms', timestamp: 0 },
  })
  const [history, setHistory] = useState<MetricRecord[]>([])
  const sessionRef = useRef<SessionState>({ lcp: null, cls: 0, inp: null, history: [] })

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return

    const observers: PerformanceObserver[] = []

    // ===== LCP 采集 =====
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length === 0) return
        const lastEntry = entries[entries.length - 1]
        const value = lastEntry.startTime
        sessionRef.current.lcp = value
        const rating = getRating('LCP', value)
        const record: MetricRecord = {
          name: 'LCP',
          value,
          rating,
          timestamp: Date.now(),
        }
        setMetrics((prev) => ({
          ...prev,
          LCP: { name: 'LCP', value, rating, unit: 'ms', timestamp: Date.now() },
        }))
        setHistory((prev) => [...prev, record])
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      observers.push(lcpObserver)
    } catch (e) {
      // 浏览器不支持 LCP
    }

    // ===== CLS 采集 =====
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number
          hadRecentInput: boolean
          startTime: number
        }>) {
          if (!entry.hadRecentInput) {
            sessionRef.current.cls += entry.value
            const value = sessionRef.current.cls
            const rating = getRating('CLS', value)
            setMetrics((prev) => ({
              ...prev,
              CLS: { name: 'CLS', value, rating, unit: '', timestamp: Date.now() },
            }))
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      observers.push(clsObserver)
    } catch (e) {
      // 浏览器不支持 CLS
    }

    // ===== INP 采集 =====
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          duration: number
          startTime: number
          processingStart: number
          processingEnd: number
        }>) {
          // 交互延迟 = 事件开始到主线程处理完成
          const value = entry.duration
          // INP 取会话中最差的一次交互（演示用最大值）
          const prevInp = sessionRef.current.inp ?? 0
          if (value > prevInp) {
            sessionRef.current.inp = value
            const rating = getRating('INP', value)
            const record: MetricRecord = {
              name: 'INP',
              value,
              rating,
              timestamp: Date.now(),
            }
            setMetrics((prev) => ({
              ...prev,
              INP: { name: 'INP', value, rating, unit: 'ms', timestamp: Date.now() },
            }))
            setHistory((prev) => [...prev, record])
          }
        }
      })
      inpObserver.observe({ type: 'event', buffered: true })
      observers.push(inpObserver)
    } catch (e) {
      // 浏览器不支持 event entry
    }

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [])

  return { metrics, history }
}
