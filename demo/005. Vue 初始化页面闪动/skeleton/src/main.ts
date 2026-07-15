import { createApp } from 'vue'
import App from './App.vue'

// 故意延迟 2 秒挂载 Vue，模拟大型 SPA 的慢加载场景
// 这样可以清楚看到骨架屏的效果：挂载前显示灰色占位骨架，挂载后替换为真实内容
setTimeout(() => {
  createApp(App).mount('#app')
}, 2000)
