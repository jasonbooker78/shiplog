import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProjectCard({ project, taskCount, doneCount, onDelete }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete(e) {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(project.id)
    } else {
      setConfirmDelete(true)
    }
  }

  function handleMouseLeave() {
    setHovered(false)
    setConfirmDelete(false)
  }

  return (
    <div
      onClick={() => navigate(`/project/${project.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-mid)'}`,
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        title={confirmDelete ? 'Click again to confirm' : 'Delete project'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: confirmDelete ? 'var(--priority-critical)' : 'var(--text-dim)',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '13px',
          padding: '2px 6px',
          borderRadius: '4px',
          lineHeight: 1,
        }}
      >
        {confirmDelete ? 'confirm?' : '×'}
      </button>

      {/* Client name */}
      {project.client_name && (
        <div
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {project.client_name}
        </div>
      )}

      {/* Project name */}
      <div
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '17px',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          paddingRight: '24px',
        }}
      >
        {project.name}
      </div>

      {/* Description */}
      {project.description && (
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </div>
      )}

      {/* Chips row */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            color: 'var(--text-dim)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '2px 8px',
          }}
        >
          {taskCount} tasks
        </span>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            color: 'var(--col-done, #3dab7a)',
            backgroundColor: 'rgba(61,171,122,0.08)',
            border: '1px solid rgba(61,171,122,0.2)',
            borderRadius: '4px',
            padding: '2px 8px',
          }}
        >
          {doneCount} done
        </span>
      </div>
    </div>
  )
}
