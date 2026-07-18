import type { FC } from 'react'

/**
 * PatternCompare -- 5 种条件渲染模式对比表
 */
export const PatternCompare: FC = () => {
  const rows: Array<{
    pattern: string
    syntax: string
    scene: string
    pros: string
    cons: string
  }> = [
    {
      pattern: '&& 短路',
      syntax: '{cond && <Comp/>}',
      scene: '单条件显示/隐藏',
      pros: '简洁直观',
      cons: '0 陷阱；无法表达"否则"',
    },
    {
      pattern: '三目运算符',
      syntax: '{cond ? <A/> : <B/>}',
      scene: '二选一',
      pros: '一行表达两分支',
      cons: '嵌套可读性差',
    },
    {
      pattern: 'IIFE',
      syntax: '{(() => { ... })()}',
      scene: '内联多分支 + 局部变量',
      pros: '可声明临时变量',
      cons: '语法噪音大；不推荐长逻辑',
    },
    {
      pattern: 'switch/case',
      syntax: 'function render() { switch... }',
      scene: '3+ 分支状态机',
      pros: '正式、可测试、可加注释',
      cons: '样板代码较多',
    },
    {
      pattern: 'enum map',
      syntax: 'MAP[status].render()',
      scene: '状态多、配置可动态',
      pros: '配置与渲染分离，易扩展',
      cons: '每个分支渲染差异大时不适合',
    },
  ]

  return (
    <div className="page">
      <h2>5 种模式对比</h2>
      <p>
        实际项目中往往组合使用：简单显隐用 <code>&&</code>，二选用三目，多分支用 switch 或 enum
        map。
      </p>
      <div className="table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>模式</th>
              <th>语法</th>
              <th>适用场景</th>
              <th>优点</th>
              <th>缺点</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.pattern}>
                <td className="col-pattern">
                  <b>{r.pattern}</b>
                </td>
                <td>
                  <code>{r.syntax}</code>
                </td>
                <td>{r.scene}</td>
                <td className="col-pros">{r.pros}</td>
                <td className="col-cons">{r.cons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="note">
        <b>选择建议：</b>分支数 &lt;= 2 用 <code>&&</code> 或三目；3-5 分支用
        switch；分支多且配置化用 enum map。 任何模式超过 20 行都应该抽子组件。
      </div>
    </div>
  )
}
