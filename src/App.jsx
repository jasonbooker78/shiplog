import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Board from './pages/Board'
import { MOCK_PROJECTS, MOCK_TASKS } from './mockData'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (user === null) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const location = useLocation()
  const { user } = useAuth()
  const showHeader = location.pathname !== '/'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {showHeader && <AppHeader projects={projects} />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/projects" replace /> : <Landing />}
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Home
                  projects={projects}
                  setProjects={setProjects}
                  tasks={tasks}
                  setTasks={setTasks}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:slug"
            element={
              <ProtectedRoute>
                <Board
                  projects={projects}
                  setProjects={setProjects}
                  tasks={tasks}
                  setTasks={setTasks}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
