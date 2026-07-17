import { useState } from 'react'
import type { FC, ReactNode } from 'react'

/**
 * 模式 5：enum map（状态到 UI 的数据化映射）
 *
 * 把"状态 -> 渲染什么"抽成一张表（对象/Map），用查表替代 switch。
 *
 * 优势：
 *   - 配置与渲染分离，新增状态只需加一行配置
 *   - 配置可以放到外部文件，甚至由接口下发
 *   - 对纯展示型状态机最优雅
 *
 * 适合：状态多、每个状态渲染逻辑相对独立、配置可能动态变化的场景。
 */
type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked'

interface StatusConfig {
  label: string
  color: string
  icon: string
  hint: string
  render: () => ReactNode
}

export const EnumMapPattern: FC = () => {
  const [status, setStatus] = useState<TaskStatus>('todo')

  // 状态 -> 渲染 的映射表
  const STATUS_MAP: Record<TaskStatus, StatusConfig> = {
    todo: {
      label: '待办',
      color: '#6b7280',
      icon: '○',
      hint: '任务尚未开始',
      render: () => (
        <div className="task-card">
          <span className="task-icon">○</span>
          <div>
            <div className="task-title">待办</div>
            <div className="task-desc">任务尚未开始，点击"开始"进入进行中</div>
          </div>
          <button className="btn-primary">开始</button>
        </div>
      ),
    },
    doing: {
      label: '进行中',
      color: '#3b82f6',
      icon: '◐',
      hint: '任务进行中',
      render: () => (
        <div className="task-card">
          <span className="task-icon">◐</span>
          <div>
            <div className="task-title">进行中</div>
            <div className="task-desc">正在处理任务，完成后请点击"完成"</div>
          </div>
          <button className="btn-primary">完成</button>
        </div>
      ),
    },
    done: {
      label: '已完成',
      color: '#10b981',
      icon: '●',
      hint: '任务已完成',
      render: () => (
        <div className="task-card">
          <span className="task-icon">●</span>
          <div>
            <div className="task-title">已完成</div>
            <div className="task-desc">任务已圆满完成</div>
          </div>
          <button className="btn-secondary">归档</button>
        </div>
      ),
    },
    blocked: {
      label: '已阻塞',
      color: '#ef4444',
      icon: '✕',
      hint: '任务被阻塞',
      render: () => (
        <div className="task-card">
          <span className="task-icon">✕</span>
          <div>
            <div className="task-title">已阻塞</div>
            <div className="task-desc">任务遇到阻碍，请处理后重试</div>
          </div>
          <button className="btn-danger">解除阻塞</button>
        </div>
      ),
    },
  }

  const config = STATUS_MAP[status]

  return (
    <div className="page">
      <h2>模式 5 · enum map 状态映射</h2>
      <p>
        把"状态 -&gt; 渲染"关系做成一张表，用查表替代 switch。
        新增状态时只需加一行配置，无需改渲染逻辑。
      </p>

      <pre className="code-block">{`const STATUS_MAP: Record<Status, Config> = {
  todo:   { label: '待办',   render: () => <TodoCard/> },
  doing:  { label: '进行中', render: () => <DoingCard/> },
  done:   { label: '已完成', render: () => <DoneCard/> },
  blocked:{ label: '已阻塞', render: () => <BlockedCard/> },
}

const config = STATUS_MAP[status]
return config.render()`}</pre>

      <div className="demo-area">
        <div className="row">
          <span>任务状态：</span>
          {(Object.keys(STATUS_MAP) as TaskStatus[]).map((s) => (
            <button
              key={s}
              className={'btn-ghost' + (status === s ? ' active' : '')}
              onClick={() => setStatus(s)}
            >
              {STATUS_MAP[s].icon} {STATUS_MAP[s].label}
            </button>
          ))}
        </div>

        <div className="result-box">
          <h4>渲染结果（查表渲染）：</h4>
          <div className="rendered">
            {config.render()}
          </div>
          <div className="hint">
            当前配置: label={config.label}, color={config.color}, hint={config.hint}
          </div>
        </div>
      </div>

      <div className="note">
        <b>适用场景：</b>任务看板、订单流程、审批流等多状态展示。
        <b>优势：</b>配置与渲染分离，新增状态只加一行；配置甚至可由后端下发。
      </div>
    </div>
  )
}
