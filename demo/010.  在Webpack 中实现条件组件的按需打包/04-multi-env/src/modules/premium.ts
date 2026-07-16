/**
 * premium 模块 -- 旗舰功能（仅 premium 版本包含）
 *
 * 例如：AI 助手、高级报表、白标定制等。
 * 当版本为 basic / full 时，本模块通过 DefinePlugin 死代码消除被移除。
 */

export interface PremiumFeature {
  name: string
  description: string
}

export function getPremiumFeatures(): PremiumFeature[] {
  return [
    { name: 'AI 助手', description: '智能问答与自动补全' },
    { name: '高级报表', description: '自定义报表设计器' },
    { name: '白标定制', description: '品牌定制与主题引擎' },
  ]
}

export function renderPremium(): string {
  const features = getPremiumFeatures()
  return `[旗舰版] ${features.map((f) => f.name).join('、')}`
}

/** 模拟一个体积较大的旗舰功能实现 */
export function runAiAssistant(prompt: string): string {
  const steps: string[] = []
  for (let i = 0; i < 30; i++) {
    steps.push(`[AI] 步骤 ${i + 1}：分析 "${prompt}" 的第 ${i + 1} 个维度`)
  }
  return steps.join('\n')
}
