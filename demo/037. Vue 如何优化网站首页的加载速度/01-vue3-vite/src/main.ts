import { createApp } from 'vue'
import App from './App.vue'

// 移除骨架屏：Vue 挂载完成后移除骨架屏 DOM
const skeleton = document.getElementById('skeleton')
if (skeleton) {
  skeleton.remove()
}

createApp(App).mount('#app')
