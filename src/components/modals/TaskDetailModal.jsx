import { useState } from 'react'
import Modal from './Modal'
import { now } from '../../utils'

const PRIORITY_STYLES = {
  critical: { color: '#fff', background: 'var(--priority-critical)' },
  high:     { color: '#fff', background: 'var(--priority-high)' },
  medium:   { color: '#fff', background: 'var(--priority-medium)' },
  low:      { color: 'var(--text-secondary)', background: 'var(--bg-base)', border: '1px solid var(--border-mid)' },
}

const STATUS_LABELS = { todo: 'Backlog', in_progress: 'In Progress', done: 'Shipped' }
const STATUS_COLORS = { todo: '#4a90d9', in_progress: '#9b72cf', done: '#3dab7a' }

const labelStyle = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '6px',
}

const inputStyle = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '14px',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-mid)',
  borderRadius: '6px',
  padding: '8px 12px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

const btnDefault = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  backgroundColor: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-mid)',
  borderRadius: '6px',
  padding: '7px 14px',
  cursor: 'pointer',
}

const btnAccent = { ...btnDefault, backgroundColor: 'var(--accent)', color: '#fff', border: 'none' }
const btnDanger = { ...btnDefault, color: 'var(--priority-critical)', borderColor: 'var(--priority-critical)' }

function Chip({ label, style }) {
  return (
    <span style={{
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '11px',
      fontWeight: 500,
      padding: '3px 9px',
      borderRadius: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      ...style,
    }}>
      {label}
    </span>
  )
}

export default function TaskDetailModal({ task, onClose, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editTitle, setEditTitle]           = useState(task.title)
  const [editDesc, setEditDesc]             = useState(task.description)
  const [editPriority, setEditPriority]     = useState(task.priority)
  const [editStatus, setEditStatus]         = useState(task.status)
  const [editArea, setEditArea]             = useState(task.feature_area)
  const [editNotes, setEditNotes]           = useState(task.notes)

  function handleSave() {
    onSave({
      ...task,
      title: editTitle.trim() || task.title,
      description: editDesc,
      priority: editPriority,
      status: editStatus,
      feature_area: editArea,
      notes: editNotes,
      updated_at: now(),
    })
    setEditing(false)
  }

  function handleCancelEdit() {
    setEditTitle(task.title)
    setEditDesc(task.description)
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setEditArea(task.feature_area)
    setEditNotes(task.notes)
    setEditing(false)
  }

  function handleDelete() {
    if (confirmDelete) {
      onDelete(task.id)
      onClose()
    } else {
      setConfirmDelete(true)
    }
  }

  const focusRing = e => (e.target.style.outline = '2px solid var(--accent)')
  const blurRing  = e => (e.target.style.outline = 'none')

  return (
    <Modal onClose={onClose} width="560px">
      {editing ? (
        /* ── EDIT MODE ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Edit Task
          </h2>

          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={editTitle} onChange={e => setEditTitle(e.target.value)} onFocus={focusRing} onBlur={blurRing} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} value={editDesc} onChange={e => setEditDesc(e.target.value)} onFocus={focusRing} onBlur={blurRing} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={editPriority} onChange={e => setEditPriority(e.target.value)} onFocus={focusRing} onBlur={blurRing}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={editStatus} onChange={e => setEditStatus(e.target.value)} onFocus={focusRing} onBlur={blurRing}>
                <option value="todo">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Shipped</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Feature Area</label>
            <input style={inputStyle} value={editArea} onChange={e => setEditArea(e.target.value)} onFocus={focusRing} onBlur={blurRing} />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={editNotes} onChange={e => setEditNotes(e.target.value)} onFocus={focusRing} onBlur={blurRing} />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button style={btnDefault} onClick={handleCancelEdit}>Cancel</button>
            <button style={btnAccent} onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        /* ── VIEW MODE ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {task.title}
          </h2>

          {/* Status / priority / area row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <Chip label={task.priority} style={PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.low} />
            <Chip
              label={STATUS_LABELS[task.status] ?? task.status}
              style={{ color: STATUS_COLORS[task.status] ?? 'var(--text-dim)', background: 'transparent', border: `1px solid ${STATUS_COLORS[task.status] ?? 'var(--border-mid)'}` }}
            />
            {task.feature_area && (
              <Chip label={task.feature_area} style={{ color: 'var(--text-dim)', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }} />
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              {task.description}
            </p>
          )}

          {/* Notes */}
          {task.notes && (
            <div style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ ...labelStyle, marginBottom: '6px' }}>Notes</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {task.notes}
              </p>
            </div>
          )}

          {/* Meta footer */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', gap: '16px' }}>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
              id: {task.id}
            </span>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
              source: {task.source}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              style={confirmDelete ? { ...btnDanger, backgroundColor: 'var(--priority-critical)', color: '#fff' } : btnDanger}
              onClick={handleDelete}
            >
              {confirmDelete ? 'Confirm delete?' : 'Delete'}
            </button>
            <button style={btnDefault} onClick={() => { setConfirmDelete(false); setEditing(true) }}>Edit</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
