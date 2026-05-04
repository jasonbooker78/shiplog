import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Board from './pages/Board'
import ViewBoard from './pages/ViewBoard'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (user === null) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const { user } = useAuth()
  const showHeader = location.pathname !== '/' && !location.pathname.startsWith('/view/')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {showHeader && <AppHeader />}
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
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:slug"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route path="/view/:token" element={<ViewBoard />} />
        </Routes>
      </main>
    </div>
  )
}
