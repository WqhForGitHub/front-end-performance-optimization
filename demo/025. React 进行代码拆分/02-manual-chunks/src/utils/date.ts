// 模拟「日期工具库」（类似 dayjs）
// 真实项目里来自 node_modules，会被归入 date-vendor chunk。

const PAD = (n: number) => String(n).padStart(2, '0')

export function formatDate(d: Date | number, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = typeof d === 'number' ? new Date(d) : d
  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: PAD(date.getMonth() + 1),
    DD: PAD(date.getDate()),
    HH: PAD(date.getHours()),
    mm: PAD(date.getMinutes()),
    ss: PAD(date.getSeconds()),
  }
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k])
}

export function fromNow(ts: number): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec} 秒前`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  return `${day} 天前`
}

export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(ts: number, days: number): number {
  return ts + days * 86400000
}

export const DATE_LIB_VERSION = 'date-utils@1.2.5 (simulated)'
