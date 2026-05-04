import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUSES = ['todo', 'in_progress', 'done']

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

const PRIORITY_DOT = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#c4973a',
  low: '#6b7f5e',
}

function ReadOnlyCard({ task }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
          backgroundColor: PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium,
        }} />
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px',
          color: 'var(--text-primary)', lineHeight: 1.35, flex: 1,
        }}>
          {task.title}
        </span>
      </div>
      {task.feature_area && (
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px',
          color: 'var(--text-dim)', letterSpacing: '0.04em',
          alignSelf: 'flex-start',
        }}>
          {task.feature_area}
        </span>
      )}
      {task.description && (
        <p style={{
          fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-secondary)',
          margin: 0, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}
    </div>
  )
}

function ReadOnlyColumn({ status, tasks }) {
  return (
    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', fontWeight: 600,
          color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {STATUS_LABELS[status]}
        </span>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px',
          color: 'var(--text-dim)', backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: '4px',
          padding: '1px 6px',
        }}>
          {tasks.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map(t => <ReadOnlyCard key={t.id} task={t} />)}
        {tasks.length === 0 && (
          <div style={{
            border: '1px dashed var(--border-subtle)', borderRadius: '8px',
            padding: '24px 12px', textAlign: 'center',
            fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-dim)',
          }}>
            Empty
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewBoard() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: projects, error: projErr } = await supabase
        .rpc('get_project_by_share_token', { p_token: token })

      if (projErr || !projects?.length) {
        setInvalid(true)
        setLoading(false)
        return
      }

      setProject(projects[0])

      const { data: taskData, error: taskErr } = await supabase
        .rpc('get_tasks_by_share_token', { p_token: token })

      if (!taskErr) setTasks(taskData ?? [])
      setLoading(false)
    }
    load()
  }, [token])

  const tasksByStatus = useMemo(() => {
    const map = {}
    STATUSES.forEach(s => { map[s] = [] })
    tasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t)
    })
    return map
  }, [tasks])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Slim header */}
      <header style={{
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/shiplog-logo.svg" alt="Shiplog" style={{ height: '30px', width: 'auto', display: 'block', opacity: 0.8 }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
            shiplog
          </span>
        </button>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500,
          color: 'var(--text-dim)', backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: '4px',
          padding: '3px 8px', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          View only
        </span>
      </header>

      {loading && (
        <div style={{ padding: '60px 24px', fontFamily: 'Syne, sans-serif', color: 'var(--text-dim)', fontSize: '14px' }}>
          Loading board…
        </div>
      )}

      {!loading && invalid && (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', color: 'var(--text-dim)', marginBottom: '16px' }}>
            This link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600,
              backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-mid)', borderRadius: '6px',
              padding: '8px 16px', cursor: 'pointer',
            }}
          >
            Go to Shiplog
          </button>
        </div>
      )}

      {!loading && project && (
        <>
          {/* Board sub-header */}
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '14px 24px',
          }}>
            {project.client_name && (
              <div style={{
                fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500,
                color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '2px',
              }}>
                {project.client_name}
              </div>
            )}
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px',
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}>
              {project.name}
            </div>
          </div>

          {/* Board */}
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '28px 24px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Syne, sans-serif', fontSize: '15px', color: 'var(--text-dim)' }}>
                This board has no tasks yet.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', minWidth: 'fit-content' }}>
                {STATUSES.map(s => (
                  <ReadOnlyColumn key={s} status={s} tasks={tasksByStatus[s]} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
