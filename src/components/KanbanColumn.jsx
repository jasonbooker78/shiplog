import { useState } from 'react'
import TaskCard from './TaskCard'

const COLUMNS = {
  todo:        { label: 'Backlog',     color: '#4a90d9', icon: '/icon_log.svg'  },
  in_progress: { label: 'In Progress', color: '#9b72cf', icon: '/icon_saw.svg'  },
  done:        { label: 'Shipped',     color: '#3dab7a', icon: '/icon_ship.svg' },
}

export default function KanbanColumn({ status, tasks, onCardClick, onDrop, onExport }) {
  const [dragOver, setDragOver] = useState(false)
  const [noShippedNotice, setNoShippedNotice] = useState(false)
  const col = COLUMNS[status]

  function handleExportClick() {
    const hasResults = onExport()
    if (!hasResults) {
      setNoShippedNotice(true)
      setTimeout(() => setNoShippedNotice(false), 3000)
    }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(status, e) }}
      style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}
    >
      {/* Column header — icon + label inline, export button right-aligned for done */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
          padding: '0 2px',
        }}
      >
        <img
          src={col.icon}
          alt=""
          style={{ width: '48px', height: '48px', opacity: 0.65, flexShrink: 0 }}
        />
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '17px',
          color: 'var(--text-dim)',
          letterSpacing: '-0.01em',
        }}>
          {col.label}
        </span>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '11px',
          color: 'var(--text-dim)',
          backgroundColor: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '1px 6px',
        }}>
          {tasks.length}
        </span>

        {/* Jira CSV — only on Shipped column, pushed right */}
        {onExport && (
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              onClick={handleExportClick}
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--text-dim)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Jira CSV ↓
            </button>
            {noShippedNotice && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                whiteSpace: 'nowrap',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-mid)',
                borderRadius: '6px',
                padding: '5px 10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                zIndex: 10,
              }}>
                No shipped tasks yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drop zone + cards */}
      <div
        style={{
          flex: 1,
          minHeight: '120px',
          border: dragOver ? '2px dashed var(--accent)' : '2px dashed transparent',
          borderRadius: '8px',
          padding: dragOver ? '6px' : '0',
          transition: 'border-color 0.15s, padding 0.15s',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onCardClick(task)}
            onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
          />
        ))}
      </div>
    </div>
  )
}
