import Vue from 'vue'
import App from './App.vue'

// 移除骨架屏
const skeleton = document.getElementById('skeleton')
if (skeleton) {
  skeleton.remove()
}

new Vue({
  render: (h) => h(App),
}).$mount('#app')
