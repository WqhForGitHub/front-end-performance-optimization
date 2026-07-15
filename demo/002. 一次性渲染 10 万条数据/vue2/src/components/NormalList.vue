<template>
  <div class="list-container">
    <div v-for="item in data" :key="item.id" class="list-item">
      <span class="idx">#{{ item.id + 1 }}</span>
      <span class="content"> {{ item.name }} - 值: {{ item.value }} - {{ item.desc }} </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NormalList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
