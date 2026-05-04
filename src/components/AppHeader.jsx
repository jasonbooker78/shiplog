import { useState, useRef, useEffect, useCallback } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'
import { Users, Link2, Check, X, UserPlus, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getAvatarColor } from '../utils'

function getInitials(profile) {
  const name = profile?.display_name || profile?.email || '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function MiniAvatar({ profile, size = 26 }) {
  if (!profile) return null
  return (
    <div
      title={profile.display_name || profile.email}
      style={{
        width: size, height: size, borderRadius: '50%',
        backgroundColor: getAvatarColor(profile.id),
        color: '#fff',
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, border: '1.5px solid var(--bg-elevated)',
        userSelect: 'none',
      }}
    >
      {getInitials(profile)}
    </div>
  )
}

const STATUS_MSGS = {
  not_found: 'No Shiplog account found with that email.',
  already_member: 'That person is already a collaborator.',
  error: 'Something went wrong. Try again.',
  success: 'Collaborator added!',
}

function CollaboratorsPopover({ onClose, members, projectId, isOwner }) {
  const ref = useRef(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  async function handleInvite() {
    if (!email.trim() || status === 'loading') return
    setStatus('loading')

    const { data: profiles, error } = await supabase
      .rpc('find_profile_by_email', { p_email: email.trim().toLowerCase() })

    if (error || !profiles?.length) {
      setStatus(error ? 'error' : 'not_found')
      return
    }

    const profile = profiles[0]

    if (members.some(m => m.id === profile.id)) {
      setStatus('already_member')
      return
    }

    const { error: insertErr } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: profile.id, role: 'editor' })

    if (insertErr) {
      setStatus('error')
      return
    }

    setEmail('')
    setStatus('success')
    setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: '280px',
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-mid)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
      zIndex: 200,
      overflow: 'hidden',
    }}>
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

      <div style={{ padding: '10px 14px' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Members
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {members.length === 0 ? (
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-dim)' }}>Loading…</span>
          ) : members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MiniAvatar profile={m} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {m.display_name || m.email}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '8px 14px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Invite by email
        </div>
        {isOwner ? (
          <>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus(null) }}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="colleague@company.com"
                disabled={status === 'loading' || status === 'success'}
                style={{
                  flex: 1, fontFamily: 'Syne, sans-serif', fontSize: '12px',
                  color: 'var(--text-primary)', backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-mid)', borderRadius: '6px',
                  padding: '6px 10px', outline: 'none',
                }}
              />
              <button
                onClick={handleInvite}
                disabled={!email.trim() || status === 'loading' || status === 'success'}
                style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 600,
                  backgroundColor: email.trim() && status !== 'loading' && status !== 'success'
                    ? 'var(--accent)' : 'var(--border-mid)',
                  color: email.trim() && status !== 'loading' && status !== 'success'
                    ? '#fff' : 'var(--text-dim)',
                  border: 'none', borderRadius: '6px', padding: '6px 10px',
                  cursor: !email.trim() || status === 'loading' || status === 'success' ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  transition: 'background-color 0.15s',
                }}
              >
                <UserPlus size={12} />
                {status === 'loading' ? '…' : 'Invite'}
              </button>
            </div>
            {status && status !== 'loading' && (
              <p style={{
                fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px',
                color: status === 'success' ? '#3dab7a' : 'var(--text-dim)',
                margin: '6px 0 0', lineHeight: 1.5,
              }}>
                {STATUS_MSGS[status]}
              </p>
            )}
          </>
        ) : (
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
            Only the project owner can invite collaborators.
          </p>
        )}
      </div>
    </div>
  )
}

function fallbackCopy(text) {
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.cssText = 'position:absolute;left:-9999px;top:-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export default function AppHeader() {
  const match = useMatch('/project/:slug')
  const navigate = useNavigate()
  const { user } = useAuth()
  const slug = match?.params?.slug ?? null

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const fetchMembers = useCallback(async (proj) => {
    if (!proj) return
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', proj.owner_id)
      .single()

    const { data: memberRows } = await supabase
      .from('project_members')
      .select('profiles(*)')
      .eq('project_id', proj.id)

    const all = [ownerProfile, ...(memberRows ?? []).map(r => r.profiles)].filter(Boolean)
    setMembers(all)
  }, [])

  useEffect(() => {
    if (!slug) {
      setProject(null)
      setMembers([])
      return
    }
    supabase
      .from('projects')
      .select('id, slug, owner_id')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (!data) return
        setProject(data)
        fetchMembers(data)
      })
  }, [slug, fetchMembers])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function handleCopyLink() {
    if (!project || !user) return

    let url = `https://shiplog-kanban.vercel.app/project/${project.slug}`

    const { data, error } = await supabase
      .from('project_share_tokens')
      .insert({ project_id: project.id, created_by: user.id })
      .select('token')
      .single()

    if (!error && data?.token) {
      url = `https://shiplog-kanban.vercel.app/view/${data.token}`
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }

    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const isOwner = !!(project && user && project.owner_id === user.id)
  const visibleStack = members.slice(0, 3)
  const overflow = members.length - 3

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
      <button
        onClick={() => navigate('/projects')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <img src="/shiplog-logo.svg" alt="Shiplog" style={{ height: '30px', width: 'auto', display: 'block', opacity: 0.8 }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
          shiplog
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {project && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Avatar stack */}
            {visibleStack.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                {visibleStack.map((m, i) => (
                  <div key={m.id} style={{ marginLeft: i === 0 ? 0 : '-6px', zIndex: visibleStack.length - i }}>
                    <MiniAvatar profile={m} />
                  </div>
                ))}
                {overflow > 0 && (
                  <div style={{
                    marginLeft: '-6px', zIndex: 0,
                    width: 26, height: 26, borderRadius: '50%',
                    backgroundColor: 'var(--border-mid)', color: 'var(--text-dim)',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--bg-elevated)', userSelect: 'none',
                  }}>
                    +{overflow}
                  </div>
                )}
              </div>
            )}

            {/* Share / collaborators */}
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
                <CollaboratorsPopover
                  onClose={() => {
                    setShowCollaborators(false)
                    fetchMembers(project)
                  }}
                  members={members}
                  projectId={project.id}
                  isOwner={isOwner}
                />
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

        {user && (
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{ ...shareBtn, padding: '5px 9px' }}
          >
            <LogOut size={13} strokeWidth={2} />
            Sign out
          </button>
        )}
      </div>
    </header>
  )
}
