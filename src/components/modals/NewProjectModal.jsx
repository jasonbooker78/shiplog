import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { toSlug } from '../../utils'

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

export default function NewProjectModal({ onClose, onSave }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim() || saving) return
    const slug = toSlug(name)
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), client_name: clientName.trim(), description: description.trim(), slug })
      navigate(`/project/${slug}`)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: 'var(--text-primary)',
          margin: '0 0 24px',
          letterSpacing: '-0.02em',
        }}
      >
        New Project
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Project Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Getaways Rapid Prototype"
            autoFocus
            onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
            onBlur={e => (e.target.style.outline = 'none')}
          />
        </div>

        <div>
          <label style={labelStyle}>Client Name</label>
          <input
            style={inputStyle}
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Southwest Airlines"
            onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
            onBlur={e => (e.target.style.outline = 'none')}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the engagement"
            onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
            onBlur={e => (e.target.style.outline = 'none')}
          />
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--priority-critical)', margin: '16px 0 0' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
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
          onClick={handleSave}
          disabled={!name.trim() || saving}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: name.trim() && !saving ? 'var(--accent)' : 'var(--border-mid)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'Creating…' : 'Create Project'}
        </button>
      </div>
    </Modal>
  )
}
