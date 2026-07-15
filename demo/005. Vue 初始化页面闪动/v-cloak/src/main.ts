import { createApp } from 'vue'
import App from './App.vue'

// 故意延迟 2 秒挂载 Vue，模拟大型 SPA 的慢加载场景
// 这样可以清楚看到 v-cloak 的效果：挂载前页面不会闪动 {{ }} 语法
setTimeout(() => {
  createApp(App).mount('#app')
}, 2000)
