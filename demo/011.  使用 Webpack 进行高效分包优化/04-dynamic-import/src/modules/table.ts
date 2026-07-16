/**
 * 表格模块（懒加载）
 *
 * 该模块通过 import() 动态导入，只有在用户点击"加载表格"按钮时
 * 才会被加载，生成独立的 table chunk。
 */

/** 表格列定义 */
export interface TableColumn {
  key: string
  title: string
}

/** 表格行数据 */
export interface TableRow {
  [key: string]: string | number
}

/** 表格类 */
export class Table {
  private columns: TableColumn[]
  private rows: TableRow[]

  constructor(columns: TableColumn[], rows: TableRow[]) {
    this.columns = columns
    this.rows = rows
  }

  /** 将表格渲染到指定容器 */
  render(container: HTMLElement): void {
    const header = this.columns.map((col) => `<th>${col.title}</th>`).join('')
    const body = this.rows
      .map(
        (row) =>
          `<tr>${this.columns.map((col) => `<td>${row[col.key]}</td>`).join('')}</tr>`
      )
      .join('')

    container.innerHTML = `
      <table border="1" cellpadding="6" style="border-collapse:collapse;">
        <thead>
          <tr>${header}</tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
    `
    console.log('表格已渲染，共', this.rows.length, '行')
  }

  /** 获取行数 */
  getRowCount(): number {
    return this.rows.length
  }
}
