/**
 * 响应式图片演示数据
 * 使用 picsum.photos 提供图片，通过 URL 路径控制尺寸。
 * picsum.photos 支持 /seed/<seed>/<w>/<h> 形式，可保证同一 seed 返回同一张图。
 */

export interface ResponsiveImage {
  id: number
  seed: string
  alt: string
  /** 提供给 srcset 的不同宽度版本 */
  widths: number[]
  /** 原始宽高比（宽 / 高） */
  aspect: number
}

/**
 * 4 张演示图，每张提供 400 / 800 / 1200 / 1600 / 2000 多个宽度版本，
 * 浏览器会根据视口与 DPR 选择最合适的尺寸。
 */
export const responsiveImages: ResponsiveImage[] = [
  {
    id: 1,
    seed: 'mountain',
    alt: '山景照片',
    widths: [400, 800, 1200, 1600, 2000],
    aspect: 16 / 9,
  },
  { id: 2, seed: 'forest', alt: '森林照片', widths: [400, 800, 1200, 1600, 2000], aspect: 4 / 3 },
  { id: 3, seed: 'ocean', alt: '海洋照片', widths: [400, 800, 1200, 1600, 2000], aspect: 16 / 9 },
  { id: 4, seed: 'desert', alt: '沙漠照片', widths: [400, 800, 1200, 1600, 2000], aspect: 4 / 3 },
]

/**
 * 构造 picsum 图片 URL
 * @param seed 图片种子
 * @param width 宽度
 * @param aspect 宽高比
 */
export function buildPicUrl(seed: string, width: number, aspect: number): string {
  const height = Math.round(width / aspect)
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

/**
 * 构造 srcset 字符串
 * 形如："/seed/x/400/225 400w, /seed/x/800/450 800w, ..."
 */
export function buildSrcset(seed: string, widths: number[], aspect: number): string {
  return widths.map((w) => `${buildPicUrl(seed, w, aspect)} ${w}w`).join(', ')
}
