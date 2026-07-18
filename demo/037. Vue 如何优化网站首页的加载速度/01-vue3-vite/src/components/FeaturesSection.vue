<script setup lang="ts">
// 非首屏内容：异步加载，减小首屏 bundle 体积
const features = [
  { icon: '⚡', title: '极速体验', desc: '首屏加载 < 1s' },
  { icon: '🎨', title: '优雅设计', desc: '现代化 UI 风格' },
  { icon: '🔒', title: '安全可靠', desc: 'HTTPS + CSP' },
  { icon: '📱', title: '响应式', desc: '适配所有设备' },
]
</script>

<template>
  <section class="features">
    <h2>功能特性（异步加载）</h2>
    <div class="grid">
      <div v-for="f in features" :key="f.title" class="card">
        <div class="icon">{{ f.icon }}</div>
        <h3>{{ f.title }}</h3>
        <p>{{ f.desc }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  margin-bottom: 24px;
}
.features h2 {
  margin: 0 0 16px;
  color: #3b82f6;
  font-size: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.card {
  padding: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}
.icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.card h3 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #1f2937;
}
.card p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
