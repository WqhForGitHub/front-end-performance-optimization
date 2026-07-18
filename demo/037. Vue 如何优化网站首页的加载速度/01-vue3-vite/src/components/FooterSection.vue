<script setup lang="ts">
// 页脚：优先级最低，最后加载
</script>

<template>
  <section class="footer-section">
    <div class="links">
      <a href="#">关于我们</a>
      <a href="#">联系方式</a>
      <a href="#">隐私政策</a>
      <a href="#">服务条款</a>
    </div>
    <p class="copyright">© 2024 Vue3 首页优化示例. All rights reserved.</p>
  </section>
</template>

<style scoped>
.footer-section {
  padding: 24px;
  background: #1f2937;
  color: #d1d5db;
  border-radius: 8px;
  text-align: center;
}
.links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}
.links a {
  color: #d1d5db;
  text-decoration: none;
  font-size: 13px;
}
.links a:hover {
  color: #fff;
}
.copyright {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}
</style>
