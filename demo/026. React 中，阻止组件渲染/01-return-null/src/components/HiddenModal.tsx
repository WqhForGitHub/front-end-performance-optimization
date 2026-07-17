import type { FC, ReactNode, MouseEvent } from 'react'

/**
 * HiddenModal -- 隐藏的 Modal
 *
 * 当 open=false 时，组件直接 return null，DOM 中不会出现任何节点。
 * 这比"渲染 + display:none"更干净：
 *   1. DOM 体积更小
 *   2. 不会触发 modal 内部子组件的挂载（包括副作用、网络请求）
 *   3. 无障碍工具不会读到隐藏内容
 *
 * 注意：children 始终在父组件构造时被创建（JSX 已展开），
 * 但因为本组件 return null 时不会把 children 放进 React 树，
 * 所以 children 内部组件的 hooks/副作用不会执行。
 */
interface HiddenModalProps {
  open: boolean
  onClose: () => void
  children?: ReactNode
}

export const HiddenModal: FC<HiddenModalProps> = ({ open, onClose, children }) => {
  // 核心阻止渲染：open=false 时直接 return null
  if (!open) return null

  // 点击遮罩本身时关闭；点击 modal 内部不关闭。
  // 用 target === currentTarget 判断，避免 stopPropagation
  // （env.d.ts 中的 MouseEvent 类型未声明 stopPropagation）
  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        {children}
      </div>
    </div>
  )
}
