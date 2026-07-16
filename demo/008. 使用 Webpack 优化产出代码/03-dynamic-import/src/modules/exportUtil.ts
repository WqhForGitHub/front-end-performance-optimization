/**
 * 导出工具模块（模拟按需使用的功能）
 *
 * 这类功能不是所有用户都会用到，适合用动态导入。
 */

export interface ExportOptions {
  format: 'csv' | 'json'
  filename: string
}

export function exportData(data: Record<string, unknown>[], options: ExportOptions): string {
  if (options.format === 'csv') {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0] as Record<string, unknown>)
    const rows = data.map((row) =>
      headers.map((h) => String((row as Record<string, unknown>)[h] ?? '')).join(','),
    )
    return [headers.join(','), ...rows].join('\n')
  }

  return JSON.stringify(data, null, 2)
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
