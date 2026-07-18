<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

const props = defineProps<{ tabName: string }>()
const emit = defineEmits<{ (e: 'lifecycle', payload: { tab: string; event: string }): void }>()

const form = ref({
  name: '',
  email: '',
  bio: '',
  gender: 'male' as 'male' | 'female' | 'other',
  subscribe: false,
})

onMounted(() => emit('lifecycle', { tab: props.tabName, event: 'onMounted' }))
onUnmounted(() => emit('lifecycle', { tab: props.tabName, event: 'onUnmounted' }))
onActivated(() => emit('lifecycle', { tab: props.tabName, event: 'onActivated' }))
onDeactivated(() => emit('lifecycle', { tab: props.tabName, event: 'onDeactivated' }))

function reset() {
  form.value = { name: '', email: '', bio: '', gender: 'male', subscribe: false }
}
</script>

<template>
  <div class="profile-view">
    <h2>个人资料</h2>
    <p class="desc">
      在表单中输入内容（不要提交），切到其他 Tab 后再切回，输入框中的内容会完整保留。 没有 KeepAlive
      时，未保存的表单数据会全部丢失。
    </p>

    <form class="form" @submit.prevent>
      <div class="form-row">
        <label>姓名</label>
        <input v-model="form.name" type="text" placeholder="请输入姓名" />
      </div>

      <div class="form-row">
        <label>邮箱</label>
        <input v-model="form.email" type="email" placeholder="请输入邮箱" />
      </div>

      <div class="form-row">
        <label>性别</label>
        <select v-model="form.gender">
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div class="form-row">
        <label>个人简介</label>
        <textarea v-model="form.bio" rows="3" placeholder="请输入个人简介"></textarea>
      </div>

      <div class="form-row checkbox">
        <input id="subscribe" v-model="form.subscribe" type="checkbox" />
        <label for="subscribe">订阅每周邮件推送</label>
      </div>

      <button type="button" class="reset-btn" @click="reset">重置表单</button>
    </form>
  </div>
</template>

<style scoped>
.profile-view h2 {
  margin-bottom: 12px;
  color: #2c3e50;
}

.desc {
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.form-row label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.form-row.checkbox label {
  margin: 0;
  cursor: pointer;
}

.form-row input[type='text'],
.form-row input[type='email'],
.form-row select,
.form-row textarea {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  background: #fff;
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: #42b983;
}

.reset-btn {
  align-self: flex-start;
  background: #f56c6c;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 6px;
}

.reset-btn:hover {
  background: #e64242;
}
</style>
