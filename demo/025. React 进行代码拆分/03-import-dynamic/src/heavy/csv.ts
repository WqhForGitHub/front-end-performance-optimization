// 模拟「CSV 处理库」（类似 papaparse 的极简版）
// 体积假设 ~70KB。只有用户上传/解析 CSV 文件时才下载。
// 通过 dynamic import() 加载，会被拆成独立 chunk：assets/csv-[hash].js

export interface CsvRow {
  [key: string]: string
}

export interface CsvParseResult {
  headers: string[]
  rows: CsvRow[]
  rowCount: number
}

export function parseCsv(text: string, delimiter = ','): CsvParseResult {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.trim() !== '')
  if (lines.length === 0) return { headers: [], rows: [], rowCount: 0 }

  const headers = splitLine(lines[0], delimiter)
  const rows: CsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delimiter)
    const row: CsvRow = {}
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? ''
    })
    rows.push(row)
  }

  return { headers, rows, rowCount: rows.length }
}

// 处理带引号的 CSV 行
function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

export function toCsv(rows: CsvRow[], headers?: string[]): string {
  if (rows.length === 0) return ''
  const cols = headers ?? Object.keys(rows[0])
  const escape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
  const lines = [cols.join(',')]
  for (const row of rows) {
    lines.push(cols.map((c) => escape(row[c] ?? '')).join(','))
  }
  return lines.join('\n')
}

export function summarize(result: CsvParseResult): string {
  const { headers, rowCount } = result
  return `共 ${rowCount} 行数据，${headers.length} 列：${headers.join(', ')}`
}

export const CSV_LIB_VERSION = 'mini-csv@1.8.3 (simulated, ~70KB)'
