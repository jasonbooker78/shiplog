import { useState } from 'react'

const PRIORITY_STYLES = {
  critical: { color: '#fff', background: 'var(--priority-critical)' },
  high:     { color: '#fff', background: 'var(--priority-high)' },
  medium:   { color: '#fff', background: 'var(--priority-medium)' },
  low:      { color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border-mid)' },
}

const COL_COLORS = {
  todo:        '#9c9690',
  in_progress: '#9b72cf',
  done:        '#3dab7a',
}

export default function TaskCard({ task, onClick, onDragStart }) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const colColor = COL_COLORS[task.status] ?? '#d4cfc6'
  const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low

  function handleDragStart(e) {
    setDragging(true)
    onDragStart(e)
  }

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: task.status === 'done' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'grab',
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.1s',
        opacity: dragging ? 0.5 : 1,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: '2px', backgroundColor: colColor }} />

      <div style={{ padding: '12px' }}>
        {/* Title */}
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: '13px',
            color: task.status === 'done' ? 'var(--text-dim)' : 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: task.status === 'done' ? 0 : '10px',
          }}
        >
          {task.title}
        </div>

        {/* Chips row — hidden for shipped cards */}
        {task.status !== 'done' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {/* Priority badge */}
            <span
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 7px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                ...priorityStyle,
              }}
            >
              {task.priority}
            </span>

            {/* Feature area */}
            {task.feature_area && (
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                }}
              >
                {task.feature_area}
              </span>
            )}

            {/* Source indicator */}
            {task.source === 'imported' && (
              <span
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  marginLeft: 'auto',
                }}
              >
                ⟳ import
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
