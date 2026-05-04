import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FEATURES = [
  {
    icon: '🪵',
    title: 'Import from any PRD',
    desc: 'Paste an LLM-generated task JSON and your board populates instantly. Use the built-in LLM prompt to convert any existing PRD.',
  },
  {
    icon: '⚙️',
    title: 'Kanban built for design teams',
    desc: 'Backlog, In Progress, Shipped. Drag tasks across columns, filter by feature area, and add notes without leaving the board.',
  },
  {
    icon: '🚢',
    title: 'Export shipped work to Jira',
    desc: 'One click to export completed tasks as a Jira-compatible CSV — priority, labels, and descriptions included.',
  },
]

const inputStyle = {
  width: '100%',
  fontFamily: 'Syne, sans-serif',
  fontSize: '14px',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--border-mid)',
  borderRadius: '8px',
  padding: '10px 14px',
  boxSizing: 'border-box',
  outline: 'none',
}

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message)
      } else {
        navigate('/projects')
      }
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
      } else {
        setSuccessMsg('Check your email to confirm your account.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav strip */}
      <nav style={{
        height: '52px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/shiplog-logo.svg" alt="Shiplog" style={{ height: '28px', width: 'auto', opacity: 0.85 }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
            shiplog
          </span>
        </div>
      </nav>

      {/* Hero + auth */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          maxWidth: '960px',
          width: '100%',
          alignItems: 'center',
        }}>

          {/* Left: copy */}
          <div>
            <div style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>
              For agentic design teams
            </div>

            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '44px',
              color: 'var(--text-primary)',
              margin: '0 0 20px',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}>
              Track design work.<br />Ship with confidence.
            </h1>

            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 40px',
            }}>
              Shiplog is a lightweight kanban board for agentic design teams, designed to track what you create without slowing you down.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {f.title}
                    </div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: auth card */}
          <div>
            <div style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '36px 32px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              <h2 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: 'var(--text-primary)',
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
              }}>
                {mode === 'signin' ? 'Sign in to Shiplog' : 'Create your account'}
              </h2>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '13px',
                color: 'var(--text-dim)',
                margin: '0 0 28px',
              }}>
                {mode === 'signin' ? 'Welcome back. Enter your credentials to continue.' : 'Get started — it only takes a moment.'}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoFocus
                    style={inputStyle}
                    onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
                    onBlur={e => (e.target.style.outline = 'none')}
                  />
                </div>

                <div>
                  <label style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'block',
                    marginBottom: '6px',
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      onFocus={e => (e.target.style.outline = '2px solid var(--accent)')}
                      onBlur={e => (e.target.style.outline = 'none')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-dim)', padding: 0, lineHeight: 1,
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Syne, sans-serif', fontSize: '12px',
                      color: 'var(--accent)', padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '12px',
                    color: 'var(--priority-critical)',
                    margin: '0',
                  }}>
                    {error}
                  </p>
                )}
                {successMsg && (
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '12px',
                    color: 'var(--col-done, #3dab7a)',
                    margin: '0',
                  }}>
                    {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '14px',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px 0',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    width: '100%',
                    marginTop: '4px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: 'var(--text-dim)' }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                </div>

                {/* Google SSO — simulated */}
                <button
                  type="button"
                  disabled
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '9px 0',
                    cursor: 'not-allowed',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#9c9690"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#9c9690"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#9c9690"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#9c9690"/>
                  </svg>
                  Continue with Google
                </button>
                <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', margin: '-4px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
                  SSO available in Phase 2
                </p>
              </form>

              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '12px',
                color: 'var(--text-dim)',
                margin: '20px 0 0',
                textAlign: 'center',
              }}>
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('signup'); setError(''); setSuccessMsg('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--accent)', padding: 0, fontWeight: 600 }}
                    >
                      Get started
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(''); setSuccessMsg('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--accent)', padding: 0, fontWeight: 600 }}
                  >
                    Back to sign in
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
          Shiplog — Phase 1
        </span>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
          Phase 2: auth &amp; real-time collaboration coming soon
        </span>
      </footer>
    </div>
  )
}
