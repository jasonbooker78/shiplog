import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Board from './pages/Board'
import { MOCK_PROJECTS, MOCK_TASKS } from './mockData'

export default function App() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const location = useLocation()
  const showHeader = location.pathname !== '/'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {showHeader && <AppHeader projects={projects} />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/projects"
            element={
              <Home
                projects={projects}
                setProjects={setProjects}
                tasks={tasks}
                setTasks={setTasks}
              />
            }
          />
          <Route
            path="/project/:slug"
            element={
              <Board
                projects={projects}
                setProjects={setProjects}
                tasks={tasks}
                setTasks={setTasks}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}
