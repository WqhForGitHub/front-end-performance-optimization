import type { FC, ReactNode } from 'react'

/**
 * PermissionGated -- 权限受控组件
 *
 * 当当前角色不满足要求时，直接 return null。
 * 与 CSS 隐藏（display:none）的区别：
 *   - display:none 仍然把 DOM 渲染出来，只是不可见，敏感文案仍可被审查工具看到
 *   - return null 则完全不渲染，DOM 中没有任何痕迹
 *
 * 角色等级：guest(0) < user(1) < admin(2)
 *
 * 注意：env.d.ts 中 Fragment 被声明为 unknown，无法直接作为 JSX 元素使用，
 * 所以这里直接返回 children（ReactNode），语义等同于 <Fragment>{children}</Fragment>。
 */
type Role = 'guest' | 'user' | 'admin'

const ROLE_LEVEL: Record<Role, number> = {
  guest: 0,
  user: 1,
  admin: 2,
}

interface PermissionGatedProps {
  role: Role
  require: Role
  children?: ReactNode
}

export const PermissionGated: FC<PermissionGatedProps> = ({ role, require, children }) => {
  if (ROLE_LEVEL[role] < ROLE_LEVEL[require]) {
    // 无权限：完全不渲染，DOM 中不留痕迹
    return null
  }
  // 有权限：直接返回 children，不额外包裹 DOM 节点
  return children
}
