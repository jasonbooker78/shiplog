import { useState } from 'react'
import { Plus } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/modals/NewProjectModal'

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

export default function Home({ projects, setProjects, tasks, setTasks }) {
  const [showNewProject, setShowNewProject] = useState(false)

  function handleDelete(projectId) {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    setTasks(prev => {
      const next = { ...prev }
      delete next[projectId]
      return next
    })
  }

  function handleSaveProject(project) {
    setProjects(prev => [...prev, project])
    setTasks(prev => ({ ...prev, [project.id]: [] }))
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
            const projectTasks = tasks[project.id] ?? []
            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={projectTasks.length}
                doneCount={projectTasks.filter(t => t.status === 'done').length}
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
