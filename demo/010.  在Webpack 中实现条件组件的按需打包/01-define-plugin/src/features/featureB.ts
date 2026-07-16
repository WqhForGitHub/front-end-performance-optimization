/**
 * 功能 B：导出 Excel 模块
 *
 * 这是一个"导出 Excel"功能模块，依赖较大的 xlsx 库（这里用模拟函数代替）。
 * 当 FEATURE_B=false 时，此模块的导入分支会被视为死代码并移除。
 */
export interface ExportRow {
  [key: string]: string | number
}

export function exportToExcel(rows: ExportRow[]): string {
  // 模拟一个重量级的导出过程
  const header = Object.keys(rows[0] ?? {}).join(',')
  const body = rows
    .map((row) => Object.values(row).join(','))
    .join('\n')
  return `[Excel] 导出 ${rows.length} 行数据\n${header}\n${body}`
}

export function parseExcel(content: string): ExportRow[] {
  const lines = content.split('\n')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    return { col1: values[0] ?? '', col2: values[1] ?? '' }
  })
}
