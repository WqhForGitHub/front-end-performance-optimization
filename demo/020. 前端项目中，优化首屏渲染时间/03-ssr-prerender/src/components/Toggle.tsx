import type { CSSProperties, MouseEvent } from 'react'

interface ToggleOption {
  value: string
  label: string
}

interface ToggleProps {
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
}

const wrapperStyle: CSSProperties = {
  display: 'inline-flex',
  background: '#0f1115',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: 4,
  gap: 4,
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const v = e.currentTarget.dataset.value
    if (v) onChange(v)
  }

  return (
    <div style={wrapperStyle}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            data-value={opt.value}
            onClick={handleClick}
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#0f1115' : 'var(--muted)',
              border: 'none',
              borderRadius: 7,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
