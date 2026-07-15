<template>
  <div class="container">
    <h2>v-text 指令 - 解决 Vue 初始化闪动</h2>

    <div class="info-banner">
      <strong>v-text 原理：</strong>
      <ol>
        <li>
          使用 <code>v-text="variable"</code> 替代 <code>{<!-- -->{ variable }}</code> 插值
        </li>
        <li>Vue 挂载前，<code>v-text</code> 指令不渲染任何内容（空元素）</li>
        <li>Vue 挂载后，自动将变量值填充到元素的 <code>textContent</code></li>
        <li>
          不会出现 <code>{<!-- -->{ }}</code> 语法闪动，元素只是暂时为空
        </li>
      </ol>
    </div>

    <div class="card">
      <h3>用户信息（使用 v-text）</h3>
      <div class="info-row">
        <span class="label">姓名：</span>
        <span v-text="user.name"></span>
      </div>
      <div class="info-row">
        <span class="label">年龄：</span>
        <span v-text="user.age"></span>
      </div>
      <div class="info-row">
        <span class="label">邮箱：</span>
        <span v-text="user.email"></span>
      </div>
    </div>

    <div class="card">
      <h3>商品列表（使用 v-text）</h3>
      <ul class="product-list">
        <li v-for="product in products" :key="product.id">
          <span class="product-name" v-text="product.name"></span>
          <span class="product-price" v-text="'¥' + product.price"></span>
        </li>
      </ul>
    </div>

    <div class="card">
      <h3>对比演示</h3>
      <p style="margin-bottom: 8px; color: #666; font-size: 14px">
        <code>v-text</code> 在 Vue 挂载前元素为空（不显示任何内容），不会闪动
        <code>{<!-- -->{ }}</code> 语法。
      </p>
      <p style="color: #666; font-size: 14px">
        缺点：挂载前元素为空白，不如 v-cloak 配合 CSS 那样可以显示 loading 占位内容。
      </p>
      <p style="color: #666; font-size: 14px">
        适用场景：适合简单文本内容，不适合包含 HTML 结构的复杂内容。
      </p>
    </div>

    <div class="status">Vue 已挂载！当前时间：<span v-text="mountedTime"></span></div>
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
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #874d00;
}

.info-banner ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.info-banner li {
  margin-bottom: 4px;
}

.info-banner code {
  background: #ffe7ba;
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
