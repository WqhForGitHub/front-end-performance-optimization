<template>
  <div>
    <div class="skeleton-title"></div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px">
      <div v-for="i in 6" :key="i" style="padding: 12px; background: #f5f5f5; border-radius: 6px">
        <div class="skeleton-line" style="height: 14px; width: 60%; margin-bottom: 8px"></div>
        <div class="skeleton-line" style="height: 12px; width: 40%"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 骨架屏组件 - 在页面懒加载期间显示
</script>

<style scoped>
.skeleton-title {
  height: 24px;
  width: 120px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
  animation: skeleton-shimmer 1.5s infinite;
}
.skeleton-line {
  background: #e0e0e0;
  border-radius: 4px;
  animation: skeleton-shimmer 1.5s infinite;
}
@keyframes skeleton-shimmer {
  0% {
    background: #e0e0e0;
  }
  50% {
    background: #d0d0d0;
  }
  100% {
    background: #e0e0e0;
  }
}
</style>
