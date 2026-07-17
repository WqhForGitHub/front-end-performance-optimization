<script setup lang="ts">
import { ref, shallowRef, markRaw, computed, watch } from 'vue'
import AlphaComp from './components/AlphaComp.vue'
import BetaComp from './components/BetaComp.vue'
import GammaComp from './components/GammaComp.vue'
import DeltaComp from './components/DeltaComp.vue'

interface TabDef {
  name: string
  label: string
  component: any
}

const tabs: TabDef[] = [
  { name: 'AlphaComp', label: 'AlphaComp', component: markRaw(AlphaComp) },
  { name: 'BetaComp', label: 'BetaComp', component: markRaw(BetaComp) },
  { name: 'GammaComp', label: 'GammaComp', component: markRaw(GammaComp) },
  { name: 'DeltaComp', label: 'DeltaComp', component: markRaw(DeltaComp) },
]

const activeTab = ref<string>('AlphaComp')
const currentComponent = shallowRef<any>(tabs[0].component)

// ============ 配置项 ============
type Mode = 'none' | 'include' | 'exclude' | 'both' | 'max'
type Format = 'string' | 'regex' | 'array'

const mode = ref<Mode>('include')
const includeFormat = ref<Format>('string')
const excludeFormat = ref<Format>('string')

// include 配置
const includeStr = ref('AlphaComp,BetaComp')
const includeRegexStr = ref('^Alpha')
const includeArrStr = ref('AlphaComp,BetaComp,GammaComp')

// exclude 配置
const excludeStr = ref('DeltaComp')
const excludeRegexStr = ref('Delta$')
const excludeArrStr = ref('DeltaComp')

const maxCount = ref(2)

// ============ 解析为 KeepAlive 可用的 props ============
function parseNames(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildValue(format: Format, strVal: string, regexVal: string, arrVal: string): any {
  if (format === 'string') {
    // 字符串形式：逗号分隔的组件名
    return strVal
  }
  if (format === 'regex') {
    // 正则形式：匹配组件名
    try {
      return new RegExp(regexVal)
    } catch (e) {
      return null
    }
  }
  if (format === 'array') {
    // 数组形式：组件名数组
    return parseNames(arrVal)
  }
  return undefined
}

const includeValue = computed(() => {
  if (mode.value !== 'include' && mode.value !== 'both') return undefined
  return buildValue(includeFormat.value, includeStr.value, includeRegexStr.value, includeArrStr.value)
})

const excludeValue = computed(() => {
  if (mode.value !== 'exclude' && mode.value !== 'both') return undefined
  return buildValue(excludeFormat.value, excludeStr.value, excludeRegexStr.value, excludeArrStr.value)
})

const maxValue = computed(() => {
  if (mode.value !== 'max') return undefined
  return maxCount.value > 0 ? maxCount.value : undefined
})

// 当前缓存配置的描述
const configDesc = computed(() => {
  const parts: string[] = []
  if (includeValue.value !== undefined) {
    parts.push(`include=${formatValue(includeValue.value)}`)
  }
  if (excludeValue.value !== undefined) {
    parts.push(`exclude=${formatValue(excludeValue.value)}`)
  }
  if (maxValue.value !== undefined) {
    parts.push(`max=${maxValue.value}`)
  }
  return parts.length ? parts.join('，') : '无任何配置（全部缓存）'
})

function formatValue(v: any): string {
  if (v instanceof RegExp) return v.toString()
  if (Array.isArray(v)) return '[' + v.join(', ') + ']'
  return JSON.stringify(v)
}

// 判断组件是否会被缓存
function isCached(name: string): boolean {
  if (mode.value === 'none' || mode.value === 'max') return true
  let included = true
  let excluded = false
  if (includeValue.value !== undefined) {
    included = matchName(name, includeValue.value)
  }
  if (excludeValue.value !== undefined) {
    excluded = matchName(name, excludeValue.value)
  }
  return included && !excluded
}

function matchName(name: string, pattern: any): boolean {
  if (pattern instanceof RegExp) return pattern.test(name)
  if (Array.isArray(pattern)) return pattern.includes(name)
  if (typeof pattern === 'string') {
    return pattern.split(',').map((s) => s.trim()).includes(name)
  }
  return false
}

// 切换 Tab
function switchTab(name: string) {
  const tab = tabs.find((t) => t.name === name)
  if (!tab) return
  activeTab.value = name
  currentComponent.value = tab.component
}

// 配置变更时给一个提示
const configChangeTip = ref('')
watch([mode, includeFormat, excludeFormat, includeStr, includeRegexStr, includeArrStr, excludeStr, excludeRegexStr, excludeArrStr, maxCount], () => {
  configChangeTip.value = `配置已更新：${configDesc.value}（切换 Tab 验证效果）`
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>KeepAlive 的 include / exclude / max</h1>
      <p class="subtitle">
        通过配置不同的 <code>include</code>、<code>exclude</code>、<code>max</code> 来精确控制哪些组件被缓存。
        组件名匹配规则基于组件的 <code>name</code> 选项。
      </p>
    </header>

    <!-- 配置面板 -->
    <section class="config-panel">
      <h2>缓存配置</h2>

      <div class="config-row">
        <label>模式</label>
        <div class="radio-group">
          <label><input type="radio" v-model="mode" value="none" /> 全部缓存</label>
          <label><input type="radio" v-model="mode" value="include" /> 仅 include</label>
          <label><input type="radio" v-model="mode" value="exclude" /> 仅 exclude</label>
          <label><input type="radio" v-model="mode" value="both" /> include + exclude</label>
          <label><input type="radio" v-model="mode" value="max" /> max 上限</label>
        </div>
      </div>

      <!-- include 配置 -->
      <div class="config-block" v-if="mode === 'include' || mode === 'both'">
        <div class="block-title">include 配置</div>
        <div class="config-row">
          <label>格式</label>
          <div class="radio-group">
            <label><input type="radio" v-model="includeFormat" value="string" /> 字符串</label>
            <label><input type="radio" v-model="includeFormat" value="regex" /> 正则</label>
            <label><input type="radio" v-model="includeFormat" value="array" /> 数组</label>
          </div>
        </div>
        <div class="config-row" v-if="includeFormat === 'string'">
          <label>组件名（逗号分隔）</label>
          <input v-model="includeStr" type="text" placeholder="AlphaComp,BetaComp" />
        </div>
        <div class="config-row" v-if="includeFormat === 'regex'">
          <label>正则表达式</label>
          <input v-model="includeRegexStr" type="text" placeholder="^Alpha" />
        </div>
        <div class="config-row" v-if="includeFormat === 'array'">
          <label>组件名（逗号分隔）</label>
          <input v-model="includeArrStr" type="text" placeholder="AlphaComp,BetaComp,GammaComp" />
        </div>
      </div>

      <!-- exclude 配置 -->
      <div class="config-block" v-if="mode === 'exclude' || mode === 'both'">
        <div class="block-title">exclude 配置</div>
        <div class="config-row">
          <label>格式</label>
          <div class="radio-group">
            <label><input type="radio" v-model="excludeFormat" value="string" /> 字符串</label>
            <label><input type="radio" v-model="excludeFormat" value="regex" /> 正则</label>
            <label><input type="radio" v-model="excludeFormat" value="array" /> 数组</label>
          </div>
        </div>
        <div class="config-row" v-if="excludeFormat === 'string'">
          <label>组件名（逗号分隔）</label>
          <input v-model="excludeStr" type="text" placeholder="DeltaComp" />
        </div>
        <div class="config-row" v-if="excludeFormat === 'regex'">
          <label>正则表达式</label>
          <input v-model="excludeRegexStr" type="text" placeholder="Delta$" />
        </div>
        <div class="config-row" v-if="excludeFormat === 'array'">
          <label>组件名（逗号分隔）</label>
          <input v-model="excludeArrStr" type="text" placeholder="DeltaComp" />
        </div>
      </div>

      <!-- max 配置 -->
      <div class="config-block" v-if="mode === 'max'">
        <div class="block-title">max 配置（最多缓存的实例数，LRU 淘汰）</div>
        <div class="config-row">
          <label>max 数量</label>
          <input v-model.number="maxCount" type="number" min="1" max="10" />
        </div>
      </div>

      <div class="config-tip">
        当前生效配置：<code>{{ configDesc }}</code>
      </div>
      <div class="config-tip updated" v-if="configChangeTip">{{ configChangeTip }}</div>
    </section>

    <!-- 缓存状态概览 -->
    <section class="status-panel">
      <h2>缓存状态预判</h2>
      <p class="hint">根据当前配置，预判每个组件是否会被缓存：</p>
      <div class="status-grid">
        <div v-for="tab in tabs" :key="tab.name" class="status-item" :class="{ cached: isCached(tab.name), uncached: !isCached(tab.name) }">
          <span class="dot"></span>
          <span class="name">{{ tab.name }}</span>
          <span class="badge">{{ isCached(tab.name) ? '会被缓存' : '不缓存' }}</span>
        </div>
      </div>
      <div class="tip-box" v-if="mode === 'max'">
        提示：当切换的组件数量超过 <code>max={{ maxCount }}</code> 时，最久未访问的组件会被从缓存中移除（LRU 策略）。
      </div>
    </section>

    <!-- Tab 切换与组件展示 -->
    <section class="preview-panel">
      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: activeTab === tab.name, cached: isCached(tab.name) }]"
          @click="switchTab(tab.name)"
        >
          {{ tab.label }}
          <span class="cache-dot" :class="{ on: isCached(tab.name) }" :title="isCached(tab.name) ? '此组件将被缓存' : '此组件不被缓存'"></span>
        </button>
      </nav>

      <div class="config-change-banner" v-if="configChangeTip">{{ configChangeTip }}</div>

      <main class="content">
        <KeepAlive :include="includeValue" :exclude="excludeValue" :max="maxValue">
          <component :is="currentComponent" :key="activeTab" />
        </KeepAlive>
      </main>
    </section>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #2c3e50;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-header {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: #fff;
  padding: 20px 28px;
  border-radius: 12px;
}

.app-header h1 {
  font-size: 22px;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 13px;
  opacity: 0.92;
  line-height: 1.6;
}

.subtitle code {
  background: rgba(0, 0, 0, 0.25);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.config-panel,
.status-panel,
.preview-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-panel h2,
.status-panel h2,
.preview-panel > h2 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 14px;
}

.config-block {
  border-left: 3px solid #3498db;
  padding-left: 16px;
  margin: 12px 0;
  background: #f8fbfd;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 16px;
  border-radius: 0 6px 6px 0;
}

.block-title {
  font-size: 13px;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.config-row label {
  font-size: 13px;
  color: #606266;
  min-width: 130px;
  font-weight: 500;
}

.config-row input[type='text'],
.config-row input[type='number'] {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  font-family: 'Consolas', monospace;
}

.config-row input:focus {
  border-color: #3498db;
}

.radio-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 13px;
  min-width: auto;
  font-weight: normal;
  color: #2c3e50;
}

.config-tip {
  margin-top: 12px;
  padding: 10px 14px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 13px;
  color: #2c3e50;
}

.config-tip.updated {
  background: #fff8e6;
  color: #b88230;
}

.config-tip code {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.status-panel .hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.status-item.cached {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.status-item.uncached {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-item .name {
  flex: 1;
  font-family: 'Consolas', monospace;
  color: #2c3e50;
}

.status-item .badge {
  font-size: 11px;
}

.tip-box {
  margin-top: 12px;
  padding: 10px 14px;
  background: #fff8e6;
  border-radius: 6px;
  font-size: 12px;
  color: #b88230;
}

.tip-box code {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'Consolas', monospace;
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.tab {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Consolas', monospace;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab:hover {
  background: #f0f2f5;
}

.tab.active {
  background: #3498db;
  color: #fff;
  border-color: #3498db;
}

.cache-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  display: inline-block;
}

.cache-dot.on {
  background: #67c23a;
}

.tab.active .cache-dot.on {
  background: #fff;
}

.config-change-banner {
  background: #fff8e6;
  color: #b88230;
  padding: 8px 14px;
  border-radius: 6px;
  margin-bottom: 14px;
  font-size: 13px;
}

.content {
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  min-height: 260px;
}

code {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #e74c3c;
}
</style>
