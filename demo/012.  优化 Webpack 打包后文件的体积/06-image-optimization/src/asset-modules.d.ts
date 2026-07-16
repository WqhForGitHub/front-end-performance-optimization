/**
 * 资源模块类型声明
 *
 * 声明图片文件的模块类型，
 * 让 TypeScript 能够识别图片文件的导入。
 * 导入图片文件时返回图片的 URL 路径字符串。
 */
declare module '*.png' { const src: string; export default src }
declare module '*.jpg' { const src: string; export default src }
declare module '*.jpeg' { const src: string; export default src }
declare module '*.gif' { const src: string; export default src }
declare module '*.svg' { const src: string; export default src }
declare module '*.webp' { const src: string; export default src }
