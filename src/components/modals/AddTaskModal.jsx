import { useState } from 'react'
import Modal from './Modal'
import { toTaskId, now } from '../../utils'

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

const focusRing = e => (e.target.style.outline = '2px solid var(--accent)')
const blurRing  = e => (e.target.style.outline = 'none')

export default function AddTaskModal({ projectId, onClose, onAdd }) {
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [priority, setPriority]   = useState('medium')
  const [status, setStatus]       = useState('todo')
  const [featureArea, setArea]    = useState('')

  function handleAdd() {
    if (!title.trim()) return
    const task = {
      id:           toTaskId(title),
      project_id:   projectId,
      title:        title.trim(),
      description:  description.trim(),
      priority,
      status,
      feature_area: featureArea.trim(),
      source:       'manual',
      notes:        '',
      created_at:   now(),
      updated_at:   now(),
    }
    onAdd(task)
    onClose()
  }

  const canSave = title.trim().length > 0

  return (
    <Modal onClose={onClose} width="520px">
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
        Add Task
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            style={inputStyle}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Navigation redesign"
            autoFocus
            onFocus={focusRing}
            onBlur={blurRing}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="What needs to be designed or built?"
            onFocus={focusRing}
            onBlur={blurRing}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={priority}
              onChange={e => setPriority(e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={status}
              onChange={e => setStatus(e.target.value)}
              onFocus={focusRing}
              onBlur={blurRing}
            >
              <option value="todo">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Shipped</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Feature Area</label>
          <input
            style={inputStyle}
            value={featureArea}
            onChange={e => setArea(e.target.value)}
            placeholder="e.g. Search, Checkout"
            onFocus={focusRing}
            onBlur={blurRing}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={onClose}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!canSave}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: canSave ? 'var(--accent)' : 'var(--border-mid)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          Add Task
        </button>
      </div>
    </Modal>
  )
}
