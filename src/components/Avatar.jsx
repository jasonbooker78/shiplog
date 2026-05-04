import { getAvatarColor } from '../utils'

export default function Avatar({ profile, size = 24 }) {
  if (!profile) return null
  const name = profile.display_name || profile.email || '?'
  const initial = name[0].toUpperCase()
  const bg = getAvatarColor(profile.id)

  return (
    <div
      title={profile.display_name || profile.email}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bg,
        color: '#fff',
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: Math.round(size * 0.45),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initial}
    </div>
  )
}
