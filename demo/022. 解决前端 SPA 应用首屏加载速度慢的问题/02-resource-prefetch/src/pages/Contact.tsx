import type { FC } from 'react'

export const Contact: FC = () => {
  return (
    <div>
      <h2>联系我们 Contact</h2>
      <p>该页面同样通过 lazy + prefetch 加载，访问时近乎零等待。</p>
      <form
        style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}
      >
        <input
          type="text"
          placeholder="你的称呼"
          style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4 }}
        />
        <input
          type="email"
          placeholder="邮箱"
          style={{ padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 4 }}
        />
        <textarea
          placeholder="留言内容"
          rows={3}
          style={{
            padding: '8px 10px',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            fontFamily: 'inherit',
          }}
        />
        <button type="button" className="btn">
          提交
        </button>
      </form>
    </div>
  )
}

export default Contact
