import { useState, useRef, useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { Users, Link2, Check, X, UserPlus, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SIMULATED_MEMBERS = [
  { initials: 'JB', color: '#c4973a' },
  { initials: 'MR', color: '#6b7f5e' },
]

function Avatar({ initials, color, size = 26 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, color: '#fff',
      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: '1.5px solid var(--bg-elevated)',
    }}>
      {initials}
    </div>
  )
}

function CollaboratorsPopover({ onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: '260px',
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-mid)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      zIndex: 200,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
          Collaborators
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 0, lineHeight: 1 }}>
          <X size={14} />
        </button>
      </div>

      {/* Current members */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Current members
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SIMULATED_MEMBERS.map(m => (
            <div key={m.initials} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar initials={m.initials} color={m.color} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {m.initials === 'JB' ? 'Jason Booker (you)' : 'Maria Reyes'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div style={{ padding: '8px 14px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Invite by email
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            disabled
            placeholder="colleague@company.com"
            style={{
              flex: 1, fontFamily: 'Syne, sans-serif', fontSize: '12px',
              color: 'var(--text-dim)', backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)', borderRadius: '6px',
              padding: '6px 10px', outline: 'none', cursor: 'not-allowed',
            }}
          />
          <button disabled style={{
            fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 600,
            backgroundColor: 'var(--border-mid)', color: 'var(--text-dim)',
            border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'not-allowed',
            display: 'inline-flex', alignItems: 'center', gap: '4px',
          }}>
            <UserPlus size={12} />
            Invite
          </button>
        </div>
        <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', margin: '8px 0 0', lineHeight: 1.5 }}>
          Live collaboration available in Phase 2.
        </p>
      </div>
    </div>
  )
}

export default function AppHeader({ projects = [] }) {
  const match = useMatch('/project/:slug')
  const navigate = useNavigate()
  const slug = match?.params?.slug ?? null
  const project = slug ? projects.find(p => p.slug === slug) : null

  const [showCollaborators, setShowCollaborators] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  function handleCopyLink() {
    const url = `https://shiplog.app/view/${slug}`

    function markCopied() {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(markCopied).catch(() => {
        const el = document.createElement('textarea')
        el.value = url
        el.setAttribute('readonly', '')
        el.style.cssText = 'position:absolute;left:-9999px;top:-9999px'
        document.body.appendChild(el)
        el.select()
        if (document.execCommand('copy')) markCopied()
        document.body.removeChild(el)
      })
    } else {
      const el = document.createElement('textarea')
      el.value = url
      el.setAttribute('readonly', '')
      el.style.cssText = 'position:absolute;left:-9999px;top:-9999px'
      document.body.appendChild(el)
      el.select()
      if (document.execCommand('copy')) markCopied()
      document.body.removeChild(el)
    }
  }

  const shareBtn = {
    fontFamily: 'Syne, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-mid)',
    borderRadius: '6px',
    padding: '5px 11px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'color 0.15s, border-color 0.15s',
  }

  return (
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/shiplog-logo.svg"
          alt="Shiplog"
          style={{ height: '30px', width: 'auto', display: 'block', opacity: 0.8 }}
        />
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '17px',
          color: 'var(--text-dim)',
          letterSpacing: '-0.01em',
        }}>
          shiplog
        </span>
      </div>

      {/* Right side: sharing controls + sign-out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Sharing controls — only on board pages */}
      {project && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Avatar stack */}
          <div style={{ display: 'flex', marginRight: '4px' }}>
            {SIMULATED_MEMBERS.map((m, i) => (
              <div key={m.initials} style={{ marginLeft: i === 0 ? 0 : '-6px', zIndex: SIMULATED_MEMBERS.length - i }}>
                <Avatar initials={m.initials} color={m.color} />
              </div>
            ))}
          </div>

          {/* Invite collaborators */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCollaborators(v => !v)}
              style={{
                ...shareBtn,
                color: showCollaborators ? 'var(--accent)' : 'var(--text-secondary)',
                borderColor: showCollaborators ? 'var(--accent)' : 'var(--border-mid)',
                backgroundColor: showCollaborators ? 'rgba(196,151,58,0.06)' : 'var(--bg-surface)',
              }}
              title="Manage collaborators"
            >
              <Users size={13} strokeWidth={2} />
              Share
            </button>
            {showCollaborators && (
              <CollaboratorsPopover onClose={() => setShowCollaborators(false)} />
            )}
          </div>

          {/* Copy view-only link */}
          <button
            onClick={handleCopyLink}
            style={{
              ...shareBtn,
              color: linkCopied ? 'var(--col-done, #3dab7a)' : 'var(--text-secondary)',
              borderColor: linkCopied ? '#3dab7a' : 'var(--border-mid)',
            }}
            title="Copy view-only link for stakeholders"
          >
            {linkCopied ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} strokeWidth={2} />}
            {linkCopied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}

      <button
        onClick={handleSignOut}
        title="Sign out"
        style={{
          ...shareBtn,
          padding: '5px 9px',
        }}
      >
        <LogOut size={13} strokeWidth={2} />
        Sign out
      </button>
      </div>
    </header>
  )
}
