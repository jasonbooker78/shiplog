import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/modals/NewProjectModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const btnAccent = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '13px',
  fontWeight: 600,
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

export default function Home() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({}) // { [project_id]: { total, done } }
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user])

  async function fetchProjects() {
    setLoading(true)
    const { data: projectData, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      setLoading(false)
      return
    }

    setProjects(projectData ?? [])

    // Fetch task counts for all projects
    if (projectData && projectData.length > 0) {
      const projectIds = projectData.map(p => p.id)
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, project_id, status')
        .in('project_id', projectIds)

      if (taskError) {
        console.error('Error fetching task counts:', taskError)
      } else {
        const counts = {}
        for (const t of taskData ?? []) {
          if (!counts[t.project_id]) counts[t.project_id] = { total: 0, done: 0 }
          counts[t.project_id].total++
          if (t.status === 'done') counts[t.project_id].done++
        }
        setTaskCounts(counts)
      }
    }

    setLoading(false)
  }

  async function handleDelete(projectId) {
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== projectId))
    setTaskCounts(prev => {
      const next = { ...prev }
      delete next[projectId]
      return next
    })

    const { error } = await supabase.from('projects').delete().eq('id', projectId)
    if (error) {
      console.error('Error deleting project:', error)
      // Re-fetch to restore correct state
      fetchProjects()
    }
  }

  async function handleSaveProject(projectFields) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...projectFields, owner_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return
    }

    setProjects(prev => [data, ...prev])
    setTaskCounts(prev => ({ ...prev, [data.id]: { total: 0, done: 0 } }))
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', fontFamily: 'Syne, sans-serif', color: 'var(--text-dim)' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Projects
        </h1>
        <button style={btnAccent} onClick={() => setShowNewProject(true)}>
          <Plus size={14} strokeWidth={2} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', color: 'var(--text-dim)', marginBottom: '16px' }}>
            No projects yet. Create one to get started.
          </p>
          <button style={btnAccent} onClick={() => setShowNewProject(true)}>
            New Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {projects.map(project => {
            const counts = taskCounts[project.id] ?? { total: 0, done: 0 }
            return (
              <ProjectCard
                key={project.id}
                project={project}
                counts={counts}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  )
}
