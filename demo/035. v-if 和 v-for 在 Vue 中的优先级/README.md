# v-if 和 v-for 在 Vue 中的优先级

本目录通过 **Vue3 + TS + Vite** 与 **Vue2 + Vite(模拟 vue-cli 体验)** 两个独立项目，演示 `v-if` 与 `v-for` 同时使用的优先级问题及优化方案。

## 核心知识点

### Vue2 中的优先级

- **v-for 优先级高于 v-if**：先循环再判断
- 即使 `v-if` 为 `false`，`v-for` 仍会遍历整个列表
- 每次循环都会执行 `v-if` 判断，造成性能浪费

### Vue3 中的优先级

- **v-if 优先级高于 v-for**：先判断再循环
- `v-if` 无法访问 `v-for` 中的变量（如 `item`），会抛错或行为异常
- 官方强烈不推荐同时使用

### 优化方案

1. **使用 computed 预先过滤**：在 computed 中过滤数据，模板中只渲染过滤后的列表
2. **外层 v-if 控制整体显隐**：将 `v-if` 放到外层元素上，`v-for` 放到内层元素上
3. **使用 `<template>` 包裹 v-for**：在 template 上写 v-for，内部元素再写 v-if
4. **将条件过滤逻辑移到 methods/computed 中**：避免在模板中执行复杂判断

## 子项目一览

| 子项目         | 端口 | 技术栈                  | 说明                                              |
| -------------- | ---- | ----------------------- | ------------------------------------------------- |
| `01-vue3-vite` | 5301 | Vue3 + TS + Vite        | 演示 Vue3 中 v-if 高于 v-for 的行为与正确写法     |
| `02-vue2-cli`  | 5302 | Vue2 + Vite(vue2 插件)  | 演示 Vue2 中 v-for 高于 v-if 的行为与 computed 优化 |

## 快速开始

```bash
# 进入任一子项目
cd "demo/035. v-if 和 v-for 在 Vue 中的优先级/01-vue3-vite"

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

---

## 一、Vue3 项目（`01-vue3-vite`）

### 演示内容

- **BadPractice.vue**：v-if 与 v-for 同元素使用，Vue3 中 v-if 先执行，无法访问 v-for 的 item 变量
- **GoodPractice.vue**：三种优化方案
  - 方案一：外层 `v-if` 控制整体显隐，内层 `v-for` 渲染列表
  - 方案二：`<template v-for>` 包裹，内部元素再 `v-if`
  - 方案三：父组件使用 `computed` 提前过滤
- 实时切换显示全部/仅成年激活用户，对比两种写法的渲染次数

### 关键代码

```vue
<!-- 反例：Vue3 中 v-if 高于 v-for，访问 user 会异常 -->
<li v-for="user in users" :key="user.id" v-if="user.active"></li>

<!-- 正例：computed 过滤 -->
<script setup lang="ts">
const activeAdults = computed(() =>
  users.value.filter((u) => u.active && u.age >= 18)
)
</script>
<template>
  <li v-for="user in activeAdults" :key="user.id"></li>
</template>
```

---

## 二、Vue2 项目（`02-vue2-cli`）

### 演示内容

- **反例区域**：`v-for` 与 `v-if` 同元素使用，Vue2 中 v-for 先执行，每次循环都判断 v-if
- **正例区域**：通过 `computed` 的 `filteredUsers` 预先过滤，模板中只渲染过滤后的列表
- 切换显示全部/仅成年激活用户，对比两种写法的渲染次数

### 关键代码

```vue
<!-- 反例：Vue2 中 v-for 先执行，浪费性能 -->
<li v-for="user in users" v-if="user.active" :key="user.id"></li>

<!-- 正例：computed 预先过滤 -->
<script>
export default {
  computed: {
    filteredUsers() {
      return this.users.filter((u) => u.active && u.age >= 18)
    },
  },
}
</script>
<template>
  <li v-for="user in filteredUsers" :key="user.id"></li>
</template>
```

---

## 性能对比

| 场景                       | Vue2 反例                | Vue2 正例              | Vue3 反例                | Vue3 正例                |
| -------------------------- | ------------------------ | ---------------------- | ------------------------ | ------------------------ |
| 1000 条数据，过滤后 10 条  | 循环 1000 次每次判断 v-if | 只循环 10 次            | 编译报错或行为异常       | 只循环 10 次            |
| 渲染性能                   | O(n) 全量遍历            | O(n) 过滤 + O(m) 渲染  | -                        | O(n) 过滤 + O(m) 渲染   |
| 代码可读性                 | 差                       | 好                     | 差且可能报错             | 好                      |

## 最佳实践总结

1. **永远不要在同一元素上同时使用 v-if 和 v-for**
2. **使用 computed 替代模板内的过滤逻辑**
3. **需要整体显隐时，把 v-if 移到外层元素**
4. **需要单项条件渲染时，使用 `<template v-for>` 包裹**
5. **复杂条件拆分为 computed 或 methods**

## 目录结构

```
035. v-if 和 v-for 在 Vue 中的优先级/
├── README.md
├── 01-vue3-vite/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── env.d.ts
│       ├── main.ts
│       ├── App.vue
│       └── components/
│           ├── BadPractice.vue
│           └── GoodPractice.vue
└── 02-vue2-cli/
    ├── package.json
    ├── jsconfig.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        └── App.vue
```

## 技术栈

- Vue 3.4+ / Vue 2.7+
- TypeScript 5.5+
- Vite 5.3+ / Vite 4.5+ (Vue2)
- `vite-plugin-vue2` 2.0+
