import { useState } from 'react'
import { Clipboard, Check } from 'lucide-react'
import Modal from './Modal'
import { now } from '../../utils'

const LLM_PROMPT = `Export this PRD as a Shiplog task JSON. For each task include: a stable kebab-case id derived from the title (e.g. user-auth-login-flow), title, description (full detail of the work to be done), priority (critical / high / medium / low), feature_area (the feature group this belongs to), and status set to todo. Wrap everything in: { "project": { "name": "...", "description": "..." }, "tasks": [...] }. Return only the JSON with no markdown wrapper.`

const SCHEMA_EXAMPLE = `{
  "project": { "name": "Project name", "description": "Optional" },
  "tasks": [
    {
      "id": "kebab-slug-id",
      "title": "Task title",
      "description": "Full description of the work",
      "priority": "high",
      "feature_area": "Authentication",
      "status": "todo",
      "notes": ""
    }
  ]
}`

export default function ImportModal({ projectId, existingTasks, onClose, onImport }) {
  const [json, setJson]           = useState('')
  const [mode, setMode]           = useState('merge')
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const [targetStatus, setTargetStatus] = useState('as-is')
  const [showSchema, setShowSchema] = useState(false)

  const hasTasks = existingTasks.length > 0

  function handleCopyPrompt() {
    function markCopied() {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }

    function execFallback() {
      const el = document.createElement('textarea')
      el.value = LLM_PROMPT
      el.setAttribute('readonly', '')
      el.style.cssText = 'position:absolute;left:-9999px;top:-9999px'
      document.body.appendChild(el)
      el.select()
      if (document.execCommand('copy')) markCopied()
      document.body.removeChild(el)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(LLM_PROMPT).then(markCopied).catch(execFallback)
    } else {
      execFallback()
    }
  }

  function handleImport() {
    setError('')
    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      setError('Invalid JSON — check for missing brackets, commas, or quotes.')
      return
    }

    if (!Array.isArray(parsed?.tasks)) {
      setError('JSON must have a "tasks" array at the top level.')
      return
    }

    const incoming = parsed.tasks.map(t => ({
      id:           t.id ?? '',
      project_id:   projectId,
      title:        t.title ?? '(untitled)',
      description:  t.description ?? '',
      priority:     t.priority ?? 'medium',
      feature_area: t.feature_area ?? '',
      status:       targetStatus === 'as-is' ? (t.status ?? 'todo') : targetStatus,
      source:       'imported',
      notes:        t.notes ?? '',
      created_at:   now(),
      updated_at:   now(),
    }))

    onImport(incoming, mode)
    onClose()
  }

  return (
    <Modal onClose={onClose} width="600px">
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
        Import Tasks
      </h2>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text-dim)', margin: '0 0 16px' }}>
        Paste LLM-generated PRD JSON below. Tasks will be added to this board.
      </p>

      {/* LLM prompt copy */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '10px 14px',
        marginBottom: '20px',
        gap: '12px',
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>Already have a PRD?</span>
          Copy this prompt into your LLM to generate the JSON.
        </span>
        <button
          onClick={handleCopyPrompt}
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            fontWeight: 500,
            color: copied ? 'var(--col-done, #3dab7a)' : 'var(--text-secondary)',
            backgroundColor: 'var(--bg-surface)',
            border: `1px solid ${copied ? '#3dab7a' : 'var(--border-mid)'}`,
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {copied ? <Check size={12} strokeWidth={2.5} /> : <Clipboard size={12} strokeWidth={2} />}
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>

      {/* Schema reference — collapsible */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setShowSchema(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500,
            color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}
        >
          <span style={{ fontSize: '9px' }}>{showSchema ? '▾' : '▸'}</span>
          Expected format
        </button>
        {showSchema && (
          <pre style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px',
            margin: '6px 0 0',
            overflow: 'auto',
            lineHeight: 1.6,
          }}>
            {SCHEMA_EXAMPLE}
          </pre>
        )}
      </div>

      {/* JSON textarea */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          Paste JSON
        </div>
        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setError('') }}
          placeholder='{ "tasks": [ ... ] }'
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface)',
            border: `1px solid ${error ? 'var(--priority-critical)' : 'var(--border-mid)'}`,
            borderRadius: '6px',
            padding: '10px 12px',
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            minHeight: '140px',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
          onBlur={e => (e.target.style.outline = 'none')}
          autoFocus
        />
        {error && (
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--priority-critical)', margin: '6px 0 0' }}>
            {error}
          </p>
        )}
      </div>

      {/* Target status override */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          Import tasks into column
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={targetStatus}
            onChange={e => setTargetStatus(e.target.value)}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '13px',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: '6px',
              padding: '7px 10px',
              width: '50%',
              flexShrink: 0,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="as-is">Use status from JSON</option>
            <option value="todo">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Shipped</option>
          </select>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Already implemented this PRD? Add tasks directly into the Shipped column! ✅
          </span>
        </div>
      </div>

      {/* Mode selector — only when board already has tasks */}
      {hasTasks && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Import mode
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'merge',   label: 'Merge',   desc: 'Add new, skip duplicates' },
              { value: 'replace', label: 'Replace', desc: 'Remove all existing tasks' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                style={{
                  flex: 1,
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: mode === opt.value ? '2px solid var(--accent)' : '1px solid var(--border-mid)',
                  backgroundColor: mode === opt.value ? 'rgba(196,151,58,0.06)' : 'var(--bg-surface)',
                  color: mode === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 400, color: 'var(--text-dim)', marginTop: '2px' }}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600,
            backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-mid)', borderRadius: '6px',
            padding: '8px 16px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!json.trim()}
          style={{
            fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600,
            backgroundColor: json.trim() ? 'var(--accent)' : 'var(--border-mid)',
            color: '#fff', border: 'none', borderRadius: '6px',
            padding: '8px 16px', cursor: json.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Import
        </button>
      </div>
    </Modal>
  )
}
