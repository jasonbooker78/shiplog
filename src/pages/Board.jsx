import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, Plus } from 'lucide-react'
import KanbanColumn from '../components/KanbanColumn'
import TaskDetailModal from '../components/modals/TaskDetailModal'
import AddTaskModal from '../components/modals/AddTaskModal'
import ImportModal from '../components/modals/ImportModal'
import { now, buildJiraCSV, downloadCSV } from '../utils'

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
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

const STATUSES = ['todo', 'in_progress', 'done']

export default function Board({ projects, tasks, setTasks }) {
  const { slug } = useParams()
  const navigate = useNavigate()

  const project = projects.find(p => p.slug === slug)
  const projectTasks = project ? (tasks[project.id] ?? []) : []

  const [filterArea, setFilterArea] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const featureAreas = useMemo(() => {
    const areas = [...new Set(projectTasks.map(t => t.feature_area).filter(Boolean))]
    return areas.sort()
  }, [projectTasks])

  const visibleTasks = filterArea === 'all'
    ? projectTasks
    : projectTasks.filter(t => t.feature_area === filterArea)

  function handleDrop(taskId, newStatus) {
    if (!project) return
    setTasks(prev => ({
      ...prev,
      [project.id]: prev[project.id].map(t =>
        t.id === taskId ? { ...t, status: newStatus, updated_at: now() } : t
      ),
    }))
  }

  function handleCardClick(task) { setSelectedTask(task) }

  function handleTaskSave(updated) {
    setTasks(prev => ({
      ...prev,
      [project.id]: prev[project.id].map(t => t.id === updated.id ? updated : t),
    }))
    setSelectedTask(null)
  }

  function handleTaskDelete(taskId) {
    setTasks(prev => ({
      ...prev,
      [project.id]: prev[project.id].filter(t => t.id !== taskId),
    }))
    setSelectedTask(null)
  }

  function handleExport() {
    const shipped = projectTasks.filter(t => t.status === 'done')
    if (shipped.length > 0) {
      downloadCSV(`${project.slug}-jira.csv`, buildJiraCSV(shipped))
    }
    return shipped.length > 0
  }

  if (!project) {
    return (
      <div style={{ padding: '40px 24px', color: 'var(--text-dim)', fontFamily: 'Syne, sans-serif' }}>
        Project not found.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>
      {/* Board header */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '16px', padding: '0', lineHeight: 1, flexShrink: 0,
          }}
          title="Back to projects"
        >
          ←
        </button>

        {/* Project identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
          {project.client_name && (
            <span style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {project.client_name}
            </span>
          )}
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.name}
          </span>
        </div>

        {/* Feature area filter */}
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            padding: '7px 10px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All areas</option>
          {featureAreas.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <button style={btnDefault} onClick={() => setShowImport(true)}>
          <Upload size={14} strokeWidth={2} />
          Import
        </button>
        <button style={btnDefault} onClick={() => setShowAddTask(true)}>
          <Plus size={14} strokeWidth={2} />
          Add Task
        </button>
      </div>

      {/* Board body */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: '28px 24px' }}>
        {projectTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', color: 'var(--text-dim)', marginBottom: '16px' }}>
              This board is empty. Import a PRD JSON or add a task to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', minWidth: 'fit-content' }}>
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={visibleTasks.filter(t => t.status === status)}
                onCardClick={handleCardClick}
                onDrop={(newStatus, e) => {
                  const taskId = e.dataTransfer.getData('taskId')
                  if (taskId) handleDrop(taskId, newStatus)
                }}
                onExport={status === 'done' ? handleExport : null}
              />
            ))}
          </div>
        )}
      </div>

      {showImport && (
        <ImportModal
          projectId={project.id}
          existingTasks={projectTasks}
          onClose={() => setShowImport(false)}
          onImport={newTasks => setTasks(prev => ({ ...prev, [project.id]: newTasks }))}
        />
      )}
      {showAddTask && (
        <AddTaskModal
          projectId={project.id}
          onClose={() => setShowAddTask(false)}
          onAdd={task => setTasks(prev => ({
            ...prev,
            [project.id]: [...(prev[project.id] ?? []), task],
          }))}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  )
}
