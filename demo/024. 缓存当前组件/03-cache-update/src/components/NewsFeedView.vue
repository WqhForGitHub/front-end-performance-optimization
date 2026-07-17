<script lang="ts">
export default { name: 'NewsFeedView' }
</script>

<script setup lang="ts">
import { ref, watch, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'
import { fetchNews, type Category, type NewsItem } from '../mockServer'

interface Props {
  category: Category
  useActivatedRefresh: boolean
  useWatchProp: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'refresh', payload: { trigger: string; time: string }): void
  (e: 'lifecycle', payload: { event: string; time: string }): void
}>()

const items = ref<NewsItem[]>([])
const fetchedAt = ref('')
const loading = ref(false)
const refreshCount = ref(0)
const lastTrigger = ref('尚未刷新')
const mountedAt = ref('')
const activatedCount = ref(0)
const isActivated = ref(false)

function time() {
  const d = new Date()
  return (
    d.toLocaleTimeString('zh-CN', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  )
}

async function refresh(trigger: string) {
  loading.value = true
  lastTrigger.value = trigger
  const result = await fetchNews(props.category)
  items.value = result.items
  fetchedAt.value = result.fetchedAt
  refreshCount.value++
  loading.value = false
  emit('refresh', { trigger, time: result.fetchedAt })
}

// ============ 策略 1：onActivated 钩子刷新 ============
onActivated(() => {
  isActivated.value = true
  activatedCount.value++
  const t = time()
  emit('lifecycle', { event: 'onActivated', time: t })
  if (props.useActivatedRefresh) {
    // 当从缓存恢复时，自动拉取最新数据
    refresh('onActivated（重新激活时自动刷新）')
  }
})

onDeactivated(() => {
  isActivated.value = false
  emit('lifecycle', { event: 'onDeactivated', time: time() })
})

onMounted(() => {
  mountedAt.value = time()
  emit('lifecycle', { event: 'onMounted', time: mountedAt.value })
  // 首次挂载必须拉取一次数据
  refresh('onMounted（首次挂载）')
})

onUnmounted(() => {
  emit('lifecycle', { event: 'onUnmounted', time: time() })
})

// ============ 策略 2：watch 监听 prop 变化 ============
watch(
  () => props.category,
  (newCat, oldCat) => {
    if (props.useWatchProp && newCat !== oldCat) {
      refresh(`watch（分类变化：${oldCat} → ${newCat}）`)
    }
  },
)

// ============ 策略 3：force update 由父组件改变 :key 实现 ============
// 这里不直接实现，组件本身被销毁重建即可达到刷新目的

// ============ 策略 4：手动刷新按钮 ============
function manualRefresh() {
  refresh('手动刷新按钮')
}

// 暴露给父组件 ref 调用
defineExpose({ refresh, manualRefresh })
</script>

<template>
  <div class="news-view">
    <div class="head">
      <h2>新闻列表</h2>
      <div class="meta">
        <span class="badge" :class="{ active: isActivated }">
          {{ isActivated ? '已激活' : '已缓存(未激活)' }}
        </span>
      </div>
    </div>

    <div class="status-bar">
      <div class="stat">
        <span class="label">数据获取时间</span>
        <span class="value">{{ fetchedAt || '尚未获取' }}</span>
      </div>
      <div class="stat">
        <span class="label">累计刷新次数</span>
        <span class="value">{{ refreshCount }}</span>
      </div>
      <div class="stat">
        <span class="label">激活次数</span>
        <span class="value">{{ activatedCount }}</span>
      </div>
      <div class="stat">
        <span class="label">最近触发</span>
        <span class="value trigger">{{ lastTrigger }}</span>
      </div>
    </div>

    <div class="strategies">
      <div class="strategy" :class="{ on: useActivatedRefresh }">
        <span class="num">1</span>
        <span>onActivated 自动刷新：{{ useActivatedRefresh ? '开启' : '关闭' }}</span>
      </div>
      <div class="strategy" :class="{ on: useWatchProp }">
        <span class="num">2</span>
        <span>watch 监听 prop：{{ useWatchProp ? '开启' : '关闭' }}</span>
      </div>
      <div class="strategy on">
        <span class="num">3</span>
        <span>key 强制重建：父组件控制</span>
      </div>
      <div class="strategy on">
        <span class="num">4</span>
        <span>手动刷新按钮：可用</span>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn refresh" :disabled="loading" @click="manualRefresh">
        {{ loading ? '刷新中...' : '手动刷新（策略 4）' }}
      </button>
      <span class="current-cat">当前分类：{{ category }}</span>
    </div>

    <ul class="news-list" v-if="!loading && items.length">
      <li v-for="item in items" :key="item.id" :class="item.category">
        <span class="cat-tag">{{ item.category }}</span>
        <span class="title">{{ item.title }}</span>
        <span class="time">{{ item.publishedAt }}</span>
      </li>
    </ul>
    <div class="loading" v-else-if="loading">数据加载中...</div>
    <div class="empty" v-else>暂无数据</div>

    <p class="tip">
      提示：切换到"其他页面"再切回本 Tab，观察数据获取时间是否更新（取决于策略 1 是否开启）。
      切换下方分类，观察是否触发刷新（取决于策略 2 是否开启）。
      点击"强制重建组件"按钮会销毁并重建本组件（策略 3）。
    </p>
  </div>
</template>

<style scoped>
.news-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.head h2 {
  font-size: 18px;
  color: #2c3e50;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #f0f2f5;
  color: #909399;
}

.badge.active {
  background: #e1f3d8;
  color: #67c23a;
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat .label {
  font-size: 11px;
  color: #909399;
}

.stat .value {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 600;
  font-family: 'Consolas', monospace;
}

.stat .value.trigger {
  font-size: 11px;
  color: #e6a23c;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.4;
}

.strategies {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.strategy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f7fa;
  font-size: 12px;
  color: #909399;
}

.strategy.on {
  background: #ecf5ff;
  color: #409eff;
}

.strategy .num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: currentColor;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.strategy.on .num {
  color: #fff;
  background: #409eff;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn {
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn.refresh {
  background: #409eff;
  color: #fff;
}

.btn.refresh:hover:not(:disabled) {
  background: #337ecc;
}

.btn.refresh:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

.current-cat {
  font-size: 13px;
  color: #606266;
}

.news-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 200px;
}

.news-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fafbfc;
  border-left: 3px solid #c0c4cc;
  border-radius: 4px;
  font-size: 13px;
}

.news-list li.tech {
  border-left-color: #409eff;
}
.news-list li.sport {
  border-left-color: #67c23a;
}
.news-list li.finance {
  border-left-color: #e6a23c;
}

.cat-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f2f5;
  color: #606266;
  min-width: 38px;
  text-align: center;
}

.news-list li.tech .cat-tag {
  background: #ecf5ff;
  color: #409eff;
}
.news-list li.sport .cat-tag {
  background: #f0f9eb;
  color: #67c23a;
}
.news-list li.finance .cat-tag {
  background: #fdf6ec;
  color: #e6a23c;
}

.title {
  flex: 1;
  color: #2c3e50;
}

.time {
  font-size: 11px;
  color: #909399;
  font-family: 'Consolas', monospace;
}

.loading,
.empty {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.7;
  padding: 10px 12px;
  background: #fff8e6;
  border-radius: 6px;
}
</style>
