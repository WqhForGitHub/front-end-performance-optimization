/**
 * 图表模块（懒加载）
 *
 * 该模块通过 import() 动态导入，只有在用户点击"加载图表"按钮时
 * 才会被加载，生成独立的 chart chunk。
 */

/** 图表类型 */
export type ChartType = 'bar' | 'line' | 'pie'

/** 图表配置选项 */
export interface ChartOptions {
  width: number
  height: number
  type: ChartType
}

/** 图表类 */
export class Chart {
  private options: ChartOptions
  private rendered: boolean = false

  constructor(options: ChartOptions) {
    this.options = options
  }

  /** 将图表渲染到指定容器 */
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="chart" style="
        width:${this.options.width}px;
        height:${this.options.height}px;
        border:1px solid #ccc;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#f9f9f9;
      ">
        图表类型：${this.options.type}（${this.options.width} x ${this.options.height}）
      </div>
    `
    this.rendered = true
    console.log('图表已渲染')
  }

  /** 销毁图表 */
  destroy(): void {
    this.rendered = false
    console.log('图表已销毁')
  }

  /** 是否已渲染 */
  isRendered(): boolean {
    return this.rendered
  }
}
