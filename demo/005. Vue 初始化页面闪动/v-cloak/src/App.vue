<template>
  <div class="container">
    <h2>v-cloak 指令 - 解决 Vue 初始化闪动</h2>

    <div class="info-banner">
      <strong>v-cloak 原理：</strong>
      <ol>
        <li>在 HTML 中给元素添加 <code>v-cloak</code> 指令</li>
        <li>在 CSS 中定义 <code>[v-cloak] { display: none }</code>，挂载前隐藏元素</li>
        <li>Vue 挂载完成后自动移除 <code>v-cloak</code> 属性，元素显示</li>
        <li>
          这样就不会出现 <code>{<!-- -->{ }}</code> 语法闪动
        </li>
      </ol>
    </div>

    <div class="card">
      <h3>用户信息</h3>
      <div class="info-row">
        <span class="label">姓名：</span>
        <span>{{ user.name }}</span>
      </div>
      <div class="info-row">
        <span class="label">年龄：</span>
        <span>{{ user.age }}</span>
      </div>
      <div class="info-row">
        <span class="label">邮箱：</span>
        <span>{{ user.email }}</span>
      </div>
    </div>

    <div class="card">
      <h3>商品列表</h3>
      <ul class="product-list">
        <li v-for="product in products" :key="product.id">
          <span class="product-name">{{ product.name }}</span>
          <span class="product-price">¥{{ product.price }}</span>
        </li>
      </ul>
    </div>

    <div class="card">
      <h3>对比演示</h3>
      <p style="margin-bottom: 8px; color: #666; font-size: 14px">
        如果没有 v-cloak，页面在 Vue 挂载前会显示
        <code>{<!-- -->{ user.name }}</code> 这样的原始语法，造成闪动。
      </p>
      <p style="color: #666; font-size: 14px">
        使用 v-cloak 后，元素在 Vue 挂载前被
        <code>display: none</code> 隐藏，挂载后自动显示，无闪动。
      </p>
    </div>

    <div class="status">Vue 已挂载！当前时间：{{ mountedTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = ref({
  name: '张三',
  age: 28,
  email: 'zhangsan@example.com',
})

const products = ref([
  { id: 1, name: 'TypeScript 实战指南', price: 89.0 },
  { id: 2, name: 'Vue3 设计与实现', price: 99.0 },
  { id: 3, name: '前端性能优化', price: 79.0 },
])

const mountedTime = ref('')

onMounted(() => {
  mountedTime.value = new Date().toLocaleTimeString()
})
</script>

<style scoped>
.container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.info-banner {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #003a8c;
}

.info-banner ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.info-banner li {
  margin-bottom: 4px;
}

.info-banner code {
  background: #bae0ff;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.info-row {
  display: flex;
  padding: 6px 0;
  font-size: 14px;
}

.info-row .label {
  width: 60px;
  color: #999;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.product-list li:last-child {
  border-bottom: none;
}

.product-price {
  color: #ff4d4f;
  font-weight: 600;
}

.status {
  text-align: center;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  color: #52c41a;
  font-size: 14px;
}
</style>
