import { useMemo } from 'react'

/** 模拟关于页 - 包含大量内容用于模拟"重"组件 */
export default function AboutPage() {
  const team = useMemo(() => {
    const members: { id: number; name: string; role: string; bio: string }[] = []
    const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八']
    const roles = ['前端工程师', '后端工程师', 'UI 设计师', '产品经理', '测试工程师', '运维工程师']
    for (let i = 0; i < names.length; i++) {
      members.push({
        id: i,
        name: names[i],
        role: roles[i],
        bio: `${names[i]}是一位经验丰富的${roles[i]}，擅长相关领域的技术和工具。`,
      })
    }
    return members
  }, [])

  return (
    <div>
      <h3 style={{ marginBottom: '12px' }}>关于我们</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        我们是一支专注于前端性能优化的技术团队，致力于为用户提供最佳的 Web 体验。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {team.map((member) => (
          <div
            key={member.id}
            style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {member.name} - <span style={{ color: '#1677ff' }}>{member.role}</span>
            </div>
            <div style={{ color: '#999' }}>{member.bio}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
