import { useEffect, useRef, useState } from 'react'
import { useLanguage } from './LanguageContext'

// Variants:
//   variant="pill"  → red pill (default, for header)
//   variant="dark"  → dark pill (for dark vendor header)
//   variant="ghost" → light text-only chip (for white surfaces)
export default function LanguageSwitcher({ variant = 'pill' }) {
  const { lang, setLang, languages, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('touchstart', onClick)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('touchstart', onClick)
    }
  }, [open])

  const current = languages.find(l => l.code === lang) || languages[0]

  const triggerStyles = {
    pill: { background: 'rgba(255,255,255,0.18)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' },
    dark: { background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.18)' },
    ghost: { background: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' },
  }
  const ts = triggerStyles[variant] || triggerStyles.pill

  return (
    <div ref={wrapRef} style={{ position: 'relative', fontFamily: 'Poppins, sans-serif' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t('lang.switch')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: ts.background, color: ts.color,
          borderWidth: 1, borderStyle: 'solid', borderColor: ts.borderColor,
          borderRadius: 20, padding: '5px 11px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
          letterSpacing: 0.2,
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>🌐</span>
        <span style={{ lineHeight: 1 }}>{current.short}</span>
        <span style={{ fontSize: 9, opacity: 0.7, lineHeight: 1 }}>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop on mobile keeps the sheet feeling tappable */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 6000 }}
          />
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              minWidth: 180, background: '#fff', borderRadius: 14,
              boxShadow: '0 12px 32px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.06)',
              borderWidth: 1, borderStyle: 'solid', borderColor: '#f3f4f6',
              padding: 6, zIndex: 6001, overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, padding: '6px 10px 4px' }}>
              {t('lang.choose').toUpperCase()}
            </div>
            {languages.map(l => {
              const active = l.code === lang
              return (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 10px',
                    border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                    background: active ? '#fff5f5' : 'transparent',
                    color: active ? '#E24B4A' : '#1f2937',
                    borderRadius: 9, fontSize: 13, fontWeight: active ? 700 : 500,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {active && <span style={{ fontSize: 12, color: '#E24B4A' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
