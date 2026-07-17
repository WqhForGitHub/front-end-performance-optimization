import { useState } from 'react'
import type { FC, ReactNode } from 'react'

/**
 * 模式 4：switch/case（抽成函数）
 *
 * 把 switch 放在组件函数体里（或子函数里），返回对应分支的 JSX。
 * 比 IIFE 更"正式"，也比三目嵌套更清晰。
 *
 * 适合：3 个以上分支的状态机式渲染。
 */
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  delivered: '已签收',
  cancelled: '已取消',
}

export const SwitchPattern: FC = () => {
  const [status, setStatus] = useState<OrderStatus>('pending')

  // 把 switch 抽成独立函数，可读性比 IIFE 更好
  const renderStatusDetail = (): ReactNode => {
    switch (status) {
      case 'pending':
        return (
          <div className="detail-card detail-pending">
            <h4>待支付</h4>
            <p>请在 30 分钟内完成支付，超时订单将自动取消。</p>
            <button className="btn-primary">立即支付</button>
          </div>
        )
      case 'paid':
        return (
          <div className="detail-card detail-paid">
            <h4>已支付</h4>
            <p>商家正在备货，预计 24 小时内发货。</p>
          </div>
        )
      case 'shipped':
        return (
          <div className="detail-card detail-shipped">
            <h4>已发货</h4>
            <p>快递运单号：SF1234567890，物流追踪中。</p>
            <button className="btn-secondary">查看物流</button>
          </div>
        )
      case 'delivered':
        return (
          <div className="detail-card detail-delivered">
            <h4>已签收</h4>
            <p>订单已完成，如需售后请点击下方按钮。</p>
            <button className="btn-secondary">申请售后</button>
          </div>
        )
      case 'cancelled':
        return (
          <div className="detail-card detail-cancelled">
            <h4>已取消</h4>
            <p>订单已取消。如需购买请重新下单。</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="page">
      <h2>模式 4 · switch/case</h2>
      <p>
        把 switch 写成独立函数（而非内联 IIFE），返回每个分支的 JSX。
        比 IIFE 更正式、更易测试，也方便加注释。
      </p>

      <pre className="code-block">{`function renderStatusDetail() {
  switch (status) {
    case 'pending':   return <PendingDetail />
    case 'paid':      return <PaidDetail />
    case 'shipped':   return <ShippedDetail />
    case 'delivered': return <DeliveredDetail />
    case 'cancelled': return <CancelledDetail />
    default:          return null
  }
}

return <div>{renderStatusDetail()}</div>`}</pre>

      <div className="demo-area">
        <div className="row">
          <span>订单状态：</span>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <button
              key={s}
              className={'btn-ghost' + (status === s ? ' active' : '')}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="result-box">
          <h4>渲染结果：</h4>
          <div className="rendered">
            {renderStatusDetail()}
          </div>
        </div>
      </div>

      <div className="note">
        <b>适用场景：</b>订单状态、请求状态、tab 切换等多分支场景。
        <b>关键：</b>记得写 <code>default: return null</code> 防止遗漏分支。
      </div>
    </div>
  )
}
