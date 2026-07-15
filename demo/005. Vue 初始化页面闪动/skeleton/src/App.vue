<template>
  <div class="container">
    <h2>骨架屏 - 解决 Vue 初始化闪动</h2>

    <div class="info-banner">
      <strong>骨架屏原理：</strong>
      <ol>
        <li>在 <code>index.html</code> 的 <code>#app</code> 内预先放入骨架屏 HTML</li>
        <li>骨架屏使用灰色占位块 + shimmer 动画，模拟页面布局</li>
        <li>Vue 挂载时自动替换 <code>#app</code> 内容为真实组件</li>
        <li>
          用户看到的是"骨架 -> 真实内容"的平滑过渡，无 <code>{<!-- -->{ }}</code> 闪动
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
      <h3>方案对比</h3>
      <table class="compare-table">
        <thead>
          <tr>
            <th>方案</th>
            <th>挂载前显示</th>
            <th>实现复杂度</th>
            <th>用户体验</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>v-cloak</td>
            <td>空白（隐藏）</td>
            <td>低</td>
            <td>一般</td>
          </tr>
          <tr>
            <td>v-text</td>
            <td>空白（空元素）</td>
            <td>低</td>
            <td>一般</td>
          </tr>
          <tr>
            <td>骨架屏</td>
            <td>灰色占位骨架</td>
            <td>中</td>
            <td><strong>最佳</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="status">Vue 已挂载！骨架屏已替换为真实内容。当前时间：{{ mountedTime }}</div>
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
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #531dab;
}

.info-banner ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.info-banner li {
  margin-bottom: 4px;
}

.info-banner code {
  background: #efdbff;
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

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.compare-table th {
  text-align: left;
  padding: 8px;
  background: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  color: #666;
}

.compare-table td {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
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
