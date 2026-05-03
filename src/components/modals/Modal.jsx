import { useEffect } from 'react'

export default function Modal({ onClose, children, width = '480px' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          borderRadius: '10px',
          width: '100%',
          maxWidth: width,
          padding: '28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
