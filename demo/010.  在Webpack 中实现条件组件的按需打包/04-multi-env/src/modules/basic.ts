/**
 * basic 模块 -- 基础功能（所有版本都包含）
 *
 * 例如：登录、首页、个人中心等核心功能。
 */

export interface BasicFeature {
  name: string
  description: string
}

export function getBasicFeatures(): BasicFeature[] {
  return [
    { name: '登录', description: '用户名密码登录' },
    { name: '首页', description: '应用首页' },
    { name: '个人中心', description: '基本信息管理' },
  ]
}

export function renderBasic(): string {
  const features = getBasicFeatures()
  return `[基础版] ${features.map((f) => f.name).join('、')}`
}
