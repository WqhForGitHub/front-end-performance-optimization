/**
 * advanced 模块 -- 高级功能（full / premium 版本包含）
 *
 * 例如：数据分析、批量操作、协同编辑等进阶功能。
 * 当版本为 basic 时，本模块通过 DefinePlugin 死代码消除被移除。
 */

export interface AdvancedFeature {
  name: string
  description: string
}

export function getAdvancedFeatures(): AdvancedFeature[] {
  return [
    { name: '数据分析', description: '多维度数据看板' },
    { name: '批量操作', description: '批量导入导出' },
    { name: '协同编辑', description: '多人实时协作' },
  ]
}

export function renderAdvanced(): string {
  const features = getAdvancedFeatures()
  return `[高级版] ${features.map((f) => f.name).join('、')}`
}

/** 一个较大的辅助函数，用来让 advanced 模块的体积更明显 */
export function buildAdvancedDashboard(): string {
  const lines: string[] = []
  for (let i = 0; i < 50; i++) {
    lines.push(`[看板] 第 ${i + 1} 行数据：指标 ${i * 10}`)
  }
  return lines.join('\n')
}
