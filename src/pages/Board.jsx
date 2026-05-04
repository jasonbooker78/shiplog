import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, Plus } from 'lucide-react'
import KanbanColumn from '../components/KanbanColumn'
import TaskDetailModal from '../components/modals/TaskDetailModal'
import AddTaskModal from '../components/modals/AddTaskModal'
import ImportModal from '../components/modals/ImportModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
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

export default function Board() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [projectTasks, setProjectTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const [filterArea, setFilterArea] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // Fetch project by slug
  useEffect(() => {
    async function fetchProject() {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching project:', error)
        setProject(null)
        setLoading(false)
        return
      }
      setProject(data)
    }
    fetchProject()
  }, [slug])

  // Fetch tasks (with assignees) + members, then subscribe to realtime
  useEffect(() => {
    if (!project) return

    async function fetchTasksAndMembers() {
      // Tasks with nested assignee profiles
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, task_assignees(user_id, profiles(id, display_name, email))')
        .eq('project_id', project.id)
        .order('created_at')

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else {
        setProjectTasks(tasksData ?? [])
      }

      // Owner profile
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project.owner_id)
        .single()

      // Member profiles via project_members join
      const { data: memberRows } = await supabase
        .from('project_members')
        .select('profiles(*)')
        .eq('project_id', project.id)

      const allMembers = [ownerProfile, ...(memberRows ?? []).map(r => r.profiles)].filter(Boolean)
      setMembers(allMembers)

      setLoading(false)
    }

    fetchTasksAndMembers()

    // Realtime subscription
    const channel = supabase.channel(`board:${project.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${project.id}` }, payload => {
        if (payload.eventType === 'INSERT') {
          setProjectTasks(prev =>
            prev.some(t => t.id === payload.new.id)
              ? prev
              : [...prev, { ...payload.new, task_assignees: [] }]
          )
        } else if (payload.eventType === 'UPDATE') {
          setProjectTasks(prev =>
            prev.map(t =>
              t.id === payload.new.id
                ? { ...payload.new, task_assignees: t.task_assignees ?? [] }
                : t
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setProjectTasks(prev => prev.filter(t => t.id !== payload.old.id))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignees' }, async payload => {
        if (payload.eventType === 'INSERT') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()
          if (profile) {
            setProjectTasks(prev => prev.map(t =>
              t.id === payload.new.task_id
                ? {
                    ...t,
                    task_assignees: [
                      ...(t.task_assignees ?? []).filter(a => a.user_id !== profile.id),
                      { user_id: profile.id, profiles: profile },
                    ],
                  }
                : t
            ))
          }
        } else if (payload.eventType === 'DELETE') {
          setProjectTasks(prev => prev.map(t =>
            t.id === payload.old.task_id
              ? { ...t, task_assignees: (t.task_assignees ?? []).filter(a => a.user_id !== payload.old.user_id) }
              : t
          ))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [project])

  const featureAreas = useMemo(() => {
    const areas = [...new Set(projectTasks.map(t => t.feature_area).filter(Boolean))]
    return areas.sort()
  }, [projectTasks])

  const visibleTasks = filterArea === 'all'
    ? projectTasks
    : projectTasks.filter(t => t.feature_area === filterArea)

  async function handleDrop(taskId, newStatus) {
    const updated_at = now()
    // Optimistic update
    setProjectTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updated_at } : t
    ))
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at })
      .eq('id', taskId)
    if (error) console.error('Error updating task status:', error)
  }

  function handleCardClick(task) { setSelectedTask(task) }

  async function handleTaskSave(updated) {
    const updated_at = now()
    const payload = { ...updated, updated_at }
    // Optimistic update
    setProjectTasks(prev => prev.map(t => t.id === updated.id ? payload : t))
    setSelectedTask(null)
    const { error } = await supabase
      .from('tasks')
      .update({ ...payload })
      .eq('id', updated.id)
    if (error) console.error('Error saving task:', error)
  }

  async function handleTaskDelete(taskId) {
    // Optimistic update
    setProjectTasks(prev => prev.filter(t => t.id !== taskId))
    setSelectedTask(null)
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) console.error('Error deleting task:', error)
  }

  async function handleAddTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()
    if (error) {
      console.error('Error adding task:', error)
      return
    }
    setProjectTasks(prev => [data, ...prev])
  }

  async function handleImport(newTasks, mode) {
    if (mode === 'replace') {
      // Delete all existing tasks first
      const { error: delError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id)
      if (delError) {
        console.error('Error clearing tasks for replace:', delError)
        return
      }
      const { error } = await supabase.from('tasks').insert(newTasks)
      if (error) console.error('Error inserting imported tasks:', error)
    } else {
      // Merge — upsert on id
      const { error } = await supabase
        .from('tasks')
        .upsert(newTasks, { onConflict: 'id' })
      if (error) console.error('Error upserting imported tasks:', error)
    }

    // Refetch tasks after import
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*, task_assignees(user_id, profiles(id, display_name, email))')
      .eq('project_id', project.id)
      .order('created_at')
    if (fetchError) {
      console.error('Error refetching tasks after import:', fetchError)
    } else {
      setProjectTasks(data ?? [])
    }
  }

  function handleExport() {
    const shipped = projectTasks.filter(t => t.status === 'done')
    if (shipped.length > 0) {
      downloadCSV(`${project.slug}-jira.csv`, buildJiraCSV(shipped))
    }
    return shipped.length > 0
  }

  async function handleAssigneeAdd(taskId, userId) {
    const profile = members.find(m => m.id === userId)
    if (profile) {
      setProjectTasks(prev => prev.map(t =>
        t.id === taskId && !(t.task_assignees ?? []).some(a => a.user_id === userId)
          ? { ...t, task_assignees: [...(t.task_assignees ?? []), { user_id: userId, profiles: profile }] }
          : t
      ))
    }
    const { error } = await supabase.from('task_assignees').insert({ task_id: taskId, user_id: userId })
    if (error) console.error('Error adding assignee:', error)
  }

  async function handleAssigneeRemove(taskId, userId) {
    setProjectTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, task_assignees: (t.task_assignees ?? []).filter(a => a.user_id !== userId) }
        : t
    ))
    const { error } = await supabase.from('task_assignees').delete().eq('task_id', taskId).eq('user_id', userId)
    if (error) console.error('Error removing assignee:', error)
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', fontFamily: 'Syne, sans-serif', color: 'var(--text-dim)' }}>
        Loading...
      </div>
    )
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
          Import PRD
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
          onImport={handleImport}
        />
      )}
      {showAddTask && (
        <AddTaskModal
          projectId={project.id}
          onClose={() => setShowAddTask(false)}
          onAdd={handleAddTask}
        />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={projectTasks.find(t => t.id === selectedTask.id) ?? selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          members={members}
          currentUser={user}
          onAssigneeAdd={handleAssigneeAdd}
          onAssigneeRemove={handleAssigneeRemove}
        />
      )}
    </div>
  )
}
