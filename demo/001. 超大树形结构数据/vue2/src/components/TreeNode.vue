<template>
  <div>
    <div
      :style="{
        paddingLeft: depth * 20 + 8 + 'px',
        lineHeight: '32px',
        cursor: hasChildren ? 'pointer' : 'default',
      }"
      @click="toggle"
    >
      <span style="display: inline-block; width: 20px">
        {{ hasChildren ? (expanded ? '▼' : '▶') : '' }}
      </span>
      {{ node.name }}
    </div>
    <div v-if="expanded && hasChildren">
      <tree-node
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded-keys="expandedKeys"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script>
// 递归树节点组件 - 通过 name 实现自引用
export default {
  name: 'TreeNode',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 },
    expandedKeys: { type: Set, required: true },
  },
  computed: {
    expanded() {
      return this.expandedKeys.has(this.node.id)
    },
    hasChildren() {
      return !!(this.node.children && this.node.children.length > 0)
    },
  },
  methods: {
    toggle() {
      if (this.hasChildren) {
        this.$emit('toggle', this.node.id)
      }
    },
  },
}
</script>
