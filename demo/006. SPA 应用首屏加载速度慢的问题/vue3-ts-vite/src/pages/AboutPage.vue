<template>
  <div>
    <h3 style="margin-bottom: 12px">关于我们</h3>
    <p style="color: #666; font-size: 14px; margin-bottom: 16px">
      我们是一支专注于前端性能优化的技术团队，致力于为用户提供最佳的 Web 体验。
    </p>
    <div style="display: grid; grid-template-columns: 1fr; gap: 12px">
      <div
        v-for="member in team"
        :key="member.id"
        style="padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 14px"
      >
        <div style="font-weight: 600; margin-bottom: 4px">
          {{ member.name }} - <span style="color: #1677ff">{{ member.role }}</span>
        </div>
        <div style="color: #999">{{ member.bio }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
}

const team = ref<TeamMember[]>([])

const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
const roles = ['前端工程师', '后端工程师', 'UI 设计师', '产品经理', '测试工程师', '运维工程师']
const members: TeamMember[] = []
for (let i = 0; i < names.length; i++) {
  members.push({
    id: i,
    name: names[i],
    role: roles[i],
    bio: `${names[i]}是一位经验丰富的${roles[i]}，擅长相关领域的技术和工具。`,
  })
}
team.value = members
</script>
