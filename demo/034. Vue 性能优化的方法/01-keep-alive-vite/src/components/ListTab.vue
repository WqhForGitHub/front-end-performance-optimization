<script setup lang="ts">
import { ref, onMounted, onActivated, onDeactivated } from 'vue'

const list = ref<number[]>([])
const mountTime = ref<string>('')

onMounted(() => {
  mountTime.value = new Date().toLocaleTimeString()
  list.value = Array.from({ length: 8 }, (_, i) => i + 1)
  console.log('[ListTab] onMounted - 列表数据初始化（仅一次）')
})

onActivated(() => {
  console.log('[ListTab] onActivated - 列表恢复显示')
})

onDeactivated(() => {
  console.log('[ListTab] onDeactivated - 列表被缓存')
})
</script>

<template>
  <div class="panel">
    <h3>列表面板</h3>
    <p class="desc">列表数据初始化后会被缓存，切换 tab 回来无需重新生成。</p>
    <ul class="list">
      <li v-for="item in list" :key="item">项目 {{ item }}</li>
    </ul>
    <p class="mount-info">挂载时间：{{ mountTime }}</p>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}
.list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 16px 0;
}
.list li {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
}
.mount-info {
  color: #9ca3af;
  font-size: 12px;
}
.desc {
  color: #6b7280;
  font-size: 14px;
}
</style>
