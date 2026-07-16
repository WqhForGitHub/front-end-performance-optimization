/**
 * 编辑器模块（懒加载）
 *
 * 该模块通过 import() 动态导入，只有在用户点击"加载编辑器"按钮时
 * 才会被加载，生成独立的 editor chunk。
 */

/** 编辑器类 */
export class Editor {
  private content: string = ''
  private container: HTMLElement | null = null

  /** 设置编辑器内容 */
  setContent(content: string): void {
    this.content = content
  }

  /** 获取编辑器内容 */
  getContent(): string {
    return this.content
  }

  /** 将编辑器渲染到指定容器 */
  render(container: HTMLElement): void {
    this.container = container
    container.innerHTML = `
      <textarea
        style="width:100%;height:200px;padding:8px;font-size:14px;"
        placeholder="请输入内容..."
      >${this.content}</textarea>
      <p style="color:#999;font-size:12px;">字数：${this.wordCount()}</p>
    `
    console.log('编辑器已渲染')
  }

  /** 计算字数 */
  wordCount(): number {
    return this.content.length
  }

  /** 清空内容 */
  clear(): void {
    this.content = ''
    if (this.container) {
      this.render(this.container)
    }
  }
}
