<template>
  <div class="app">
    <h1>页面内一次性渲染 {{ total.toLocaleString() }} 条数据</h1>

    <div class="tabs">
      <button
        v-for="m in methods"
        :key="m.key"
        :class="['tab-btn', { active: method === m.key }]"
        @click="switchMethod(m.key)"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="toolbar">
      <button @click="reload">重新渲染</button>
      <span class="status">{{ currentDesc }}</span>
    </div>

    <div class="status" style="margin-bottom: 8px">
      总数据量：{{ data.length.toLocaleString() }} 条 · 当前方法：{{ currentLabel }}
    </div>

    <div :key="method + '-' + tick">
      <NormalList v-if="method === 'normal'" :data="data" />
      <VirtualList v-if="method === 'virtual'" :data="data" />
      <TimeSliceList v-if="method === 'timeslice'" :data="data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NormalList from './components/NormalList.vue'
import VirtualList from './components/VirtualList.vue'
import TimeSliceList from './components/TimeSliceList.vue'
import { generateData, type ListItem } from './utils/data'

type Method = 'normal' | 'virtual' | 'timeslice'

const TOTAL = 100000
const total = TOTAL

const method = ref<Method>('virtual')
const tick = ref(0)
const data = ref<ListItem[]>(generateData(TOTAL))

const methods: { key: Method; label: string; desc: string }[] = [
  { key: 'normal', label: '方法一：直接渲染', desc: '一次性渲染全部 DOM（会卡顿，仅作对比）' },
  { key: 'virtual', label: '方法二：虚拟列表', desc: '只渲染可视区域，DOM 数量恒定（推荐）' },
  { key: 'timeslice', label: '方法三：时间分片', desc: 'requestAnimationFrame 分批渲染' },
]

const current = computed(() => methods.find((m) => m.key === method.value)!)
const currentLabel = computed(() => current.value.label)
const currentDesc = computed(() => current.value.desc)

function switchMethod(key: Method) {
  method.value = key
}

function reload() {
  tick.value += 1
}
</script>
