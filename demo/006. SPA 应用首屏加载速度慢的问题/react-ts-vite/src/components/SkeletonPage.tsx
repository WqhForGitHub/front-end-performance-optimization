/** 骨架屏组件 - 在页面懒加载期间显示 */
export default function SkeletonPage() {
  return (
    <div>
      <div
        style={{
          height: '24px',
          width: '120px',
          background: '#f0f0f0',
          borderRadius: '4px',
          marginBottom: '16px',
          animation: 'skeleton-shimmer 1.5s infinite',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                height: '14px',
                width: '60%',
                background: '#e0e0e0',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'skeleton-shimmer 1.5s infinite',
              }}
            />
            <div
              style={{
                height: '12px',
                width: '40%',
                background: '#e0e0e0',
                borderRadius: '4px',
                animation: 'skeleton-shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background: #e0e0e0; }
          50% { background: #d0d0d0; }
          100% { background: #e0e0e0; }
        }
      `}</style>
    </div>
  )
}
