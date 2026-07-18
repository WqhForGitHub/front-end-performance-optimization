<script setup lang="ts">
// 首屏关键内容：同步加载，确保 LCP 快速渲染
</script>

<template>
  <section class="hero">
    <h2>首屏关键内容（同步加载）</h2>
    <p class="desc">
      Hero 区域是首屏 LCP 的关键元素，必须同步加载以保证快速渲染。
    </p>
    <div class="cta">
      <button class="btn-primary">立即开始</button>
      <button class="btn-secondary">了解更多</button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 40px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
}
.hero h2 {
  margin: 0 0 12px;
  font-size: 28px;
}
.desc {
  margin: 0 0 24px;
  font-size: 16px;
  opacity: 0.9;
}
.cta {
  display: flex;
  gap: 12px;
}
.btn-primary,
.btn-secondary {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s;
}
.btn-primary {
  background: #fff;
  color: #3b82f6;
}
.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}
.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}
</style>
