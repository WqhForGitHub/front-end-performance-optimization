<template>
  <div class="app">
    <h2>Vue2 + Webpack 打包速度优化</h2>
    <p class="subtitle">
      本项目演示通过 thread-loader、cache-loader、externals 等手段优化 Webpack 打包 Vue2 应用的速度
    </p>

    <div class="grid">
      <div v-for="item in optimizations" :key="item.title" class="card">
        <h3>{{ item.title }}</h3>
        <p class="desc">{{ item.desc }}</p>
        <code class="code">{{ item.code }}</code>
      </div>
    </div>

    <div class="counter">
      <p>当前计数：{{ count }}</p>
      <button @click="count++">+1</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      count: 0,
      optimizations: [
        {
          title: '1. thread-loader',
          desc: '多进程并行处理 Babel/JS 转译，加快编译',
          code: "use: ['thread-loader', 'babel-loader']",
        },
        {
          title: '2. cache-loader',
          desc: '缓存 loader 处理结果，二次构建显著加速',
          code: "use: ['cache-loader', 'vue-loader']",
        },
        {
          title: '3. babel cacheDirectory',
          desc: 'Babel 开启缓存目录，避免重复编译',
          code: "options: { cacheDirectory: true }",
        },
        {
          title: '4. externals + CDN',
          desc: 'Vue 走 CDN 不打包，减少 bundle 体积与构建耗时',
          code: "externals: { vue: 'Vue' }",
        },
        {
          title: '5. TerserPlugin parallel',
          desc: '多进程并行压缩 JS',
          code: 'new TerserPlugin({ parallel: true })',
        },
        {
          title: '6. resolve.alias',
          desc: '缩短路径解析时间',
          code: "alias: { vue$: 'vue/dist/vue.runtime.esm.js' }",
        },
      ],
    }
  },
}
</script>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1f2937;
}
.app h2 {
  color: #3b82f6;
  margin: 0 0 8px;
}
.subtitle {
  color: #6b7280;
  margin: 0 0 24px;
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}
.card h3 {
  margin: 0 0 8px;
  color: #3b82f6;
  font-size: 15px;
}
.desc {
  color: #4b5563;
  font-size: 13px;
  margin: 0 0 10px;
}
.code {
  display: block;
  background: #1f2937;
  color: #a7f3d0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Fira Code', 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
.counter {
  margin-top: 24px;
  padding: 16px;
  background: #ecfdf5;
  border-radius: 8px;
  text-align: center;
}
.counter button {
  padding: 6px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 12px;
}
</style>
