<template>
  <div class="list-container">
    <div v-for="item in data" :key="item.id" class="list-item">
      <span class="idx">#{{ item.id + 1 }}</span>
      <span class="content"> {{ item.name }} - 值: {{ item.value }} - {{ item.desc }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ListItem } from '../utils/data'

defineProps<{
  data: ListItem[]
}>()
</script>
