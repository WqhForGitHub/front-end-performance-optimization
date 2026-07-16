import { processData, safeProcess } from './utils/processor'

const app = document.getElementById('app')

if (app) {
  const validResult = safeProcess([10, 20, 30, 40, 50])
  const errorResult = safeProcess([])

  app.innerHTML = `
    <h1>Source Map 优化演示</h1>
    <p>有效数据处理结果：${validResult.success ? validResult.result : validResult.error}</p>
    <p>空数组处理结果：${errorResult.success ? errorResult.result : errorResult.error}</p>
    <p style="color:#888">
      构建后查看 dist 目录：<br>
      - <code>npm run build</code>        -> 生成 .map 文件（nosources-source-map，不含源码内容）<br>
      - <code>npm run build:cheap</code>  -> 生成 .map 文件（cheap-source-map，含源码内容）<br>
      - <code>npm run build:source</code> -> 生成 .map 文件（完整 source-map）<br>
      - <code>npm run build:none</code>   -> 不生成 .map 文件
    </p>
    <p style="color:#888">
      打开浏览器 DevTools，在 Sources 面板中可以看到：<br>
      - 有 Source Map 时，错误堆栈和断点指向原始 TS 源码<br>
      - 无 Source Map 时，只能看到压缩后的代码
    </p>
    <button id="trigger-error" style="padding:8px 16px;margin:4px;cursor:pointer;">
      触发未捕获异常
    </button>
  `

  // 点击按钮触发未捕获异常，观察错误堆栈中的源码位置
  document.getElementById('trigger-error')?.addEventListener('click', () => {
    // 故意不 try-catch，让异常冒泡到全局
    const result = processData([])
    console.log('不会执行到这里:', result)
  })
}
