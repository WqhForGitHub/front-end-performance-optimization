/**
 * 应用入口
 *
 * 首屏只加载主 bundle（index.ts），
 * 图表、表格、编辑器模块通过 import() 动态加载，
 * 只有用户点击对应按钮时才会请求对应的 chunk。
 *
 * 构建后产出：
 * - main.[hash].js：主入口代码
 * - chart.[hash].js：图表模块（点击"加载图表"时加载）
 * - table.[hash].js：表格模块（点击"加载表格"时加载）
 * - editor.[hash].js：编辑器模块（点击"加载编辑器"时加载）
 */

const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <h1>动态导入懒加载示例</h1>
    <p>首屏只加载主 bundle，以下模块按需加载：</p>
    <div style="margin:16px 0;">
      <button id="load-chart" style="margin-right:8px;padding:8px 16px;">加载图表</button>
      <button id="load-table" style="margin-right:8px;padding:8px 16px;">加载表格</button>
      <button id="load-editor" style="padding:8px 16px;">加载编辑器</button>
    </div>
    <div id="content" style="margin-top:16px;padding:16px;border:1px dashed #ccc;min-height:100px;">
      点击上方按钮按需加载模块...
    </div>
  `

  const content = document.getElementById('content')!

  // 点击"加载图表"按钮时，动态导入 chart 模块
  document.getElementById('load-chart')?.addEventListener('click', async () => {
    content.innerHTML = '正在加载图表模块...'
    // webpackChunkName 魔法注释：指定该异步 chunk 的名称为 "chart"
    const { Chart } = await import(/* webpackChunkName: "chart" */ './modules/chart')
    const chart = new Chart({ width: 400, height: 300, type: 'bar' })
    chart.render(content)
  })

  // 点击"加载表格"按钮时，动态导入 table 模块
  document.getElementById('load-table')?.addEventListener('click', async () => {
    content.innerHTML = '正在加载表格模块...'
    // webpackChunkName 魔法注释：指定该异步 chunk 的名称为 "table"
    const { Table } = await import(/* webpackChunkName: "table" */ './modules/table')
    const table = new Table(
      [
        { key: 'name', title: '姓名' },
        { key: 'age', title: '年龄' },
        { key: 'city', title: '城市' }
      ],
      [
        { name: '张三', age: 25, city: '北京' },
        { name: '李四', age: 30, city: '上海' },
        { name: '王五', age: 28, city: '广州' }
      ]
    )
    table.render(content)
  })

  // 点击"加载编辑器"按钮时，动态导入 editor 模块
  document.getElementById('load-editor')?.addEventListener('click', async () => {
    content.innerHTML = '正在加载编辑器模块...'
    // webpackChunkName 魔法注释：指定该异步 chunk 的名称为 "editor"
    const { Editor } = await import(/* webpackChunkName: "editor" */ './modules/editor')
    const editor = new Editor()
    editor.setContent('这是一段初始内容，可通过编辑器修改。')
    editor.render(content)
  })
}

console.log('主入口已加载，子模块将在点击按钮时按需加载')
