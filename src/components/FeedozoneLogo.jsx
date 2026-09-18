// ============================================================
// FILE: src/components/FeedozoneLogo.jsx
// The official FeedoZone brand logo component.
// Matches the brand image: lowercase "feedozone" bold white text
// on the brand red (#E24B4A) background — clean, modern, minimal.
//
// Props:
//   size:    'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
//   variant: 'full' | 'icon' | 'text'   (default: 'full')
//   dark:    bool — dark mode text for light backgrounds
//   className: extra CSS class
// ============================================================

export default function FeedozoneLogo({ size = 'md', variant = 'full', dark = false, className = '', style = {} }) {
  const sizes = {
    sm:  { icon: 28, iconR: 8,  text: 16, gap: 6 },
    md:  { icon: 36, iconR: 11, text: 20, gap: 8 },
    lg:  { icon: 48, iconR: 14, text: 26, gap: 10 },
    xl:  { icon: 64, iconR: 18, text: 34, gap: 12 },
  }
  const s = sizes[size] || sizes.md

  // ── Icon — red square with food emoji ──────────────────────────────────
  const Icon = () => (
    <div style={{
      width:          s.icon,
      height:         s.icon,
      borderRadius:   s.iconR,
      background:     'linear-gradient(135deg, #E24B4A 0%, #FF6B6A 60%, #C73232 100%)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      flexShrink:     0,
      boxShadow:      '0 4px 14px rgba(226,75,74,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
      position:       'relative',
      overflow:       'hidden',
    }}>
      {/* Shine overlay */}
      <div style={{
        position:     'absolute',
        top:          0,
        left:         0,
        right:        0,
        height:       '45%',
        borderRadius: `${s.iconR}px ${s.iconR}px 50% 50%`,
        background:   'linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)',
        pointerEvents:'none',
      }} />
      {/* Food emoji — scaled to icon size */}
      <span style={{ fontSize: s.icon * 0.52, lineHeight: 1, position: 'relative', zIndex: 1 }}>🍽️</span>
    </div>
  )

  // ── Text — lowercase "feedozone" matching brand image ─────────────────
  const Text = () => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
      {/* "feedo" in brand red gradient */}
      <span style={{
        fontSize:             s.text,
        fontWeight:           900,
        letterSpacing:        -0.5,
        fontFamily:           "'Poppins', sans-serif",
        background:           dark
          ? 'linear-gradient(135deg, #E24B4A, #C73232)'
          : 'linear-gradient(135deg, #FFFFFF, rgba(255,255,255,0.92))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor:  'transparent',
        backgroundClip:       'text',
      }}>feedo</span>
      {/* "zone" in slightly different weight */}
      <span style={{
        fontSize:           s.text,
        fontWeight:         800,
        letterSpacing:      -0.5,
        fontFamily:         "'Poppins', sans-serif",
        color:              dark ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
        WebkitTextFillColor: dark ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
      }}>zone</span>
    </div>
  )

  if (variant === 'icon') {
    return (
      <div className={className} style={style}>
        <Icon />
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={className} style={style}>
        <Text />
      </div>
    )
  }

  // Full: icon + text side by side
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: s.gap, ...style }}
    >
      <Icon />
      <Text />
    </div>
  )
}

// ── Standalone logo pill (used on splash/login screens) ──────────────────
// A full red pill with "feedozone" in white — matches the brand image exactly
export function FeedozonePill({ size = 'md', style = {} }) {
  const sizes = {
    sm: { px: 14, py: 8,  text: 18, r: 12 },
    md: { px: 20, py: 12, text: 24, r: 16 },
    lg: { px: 28, py: 16, text: 32, r: 20 },
    xl: { px: 36, py: 20, text: 42, r: 24 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div style={{
      display:        'inline-flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'linear-gradient(135deg, #E24B4A 0%, #FF5555 50%, #C73232 100%)',
      borderRadius:   s.r,
      padding:        `${s.py}px ${s.px}px`,
      boxShadow:      '0 6px 24px rgba(226,75,74,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
      position:       'relative',
      overflow:       'hidden',
      ...style,
    }}>
      {/* Shine */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', pointerEvents:'none', borderRadius:`${s.r}px ${s.r}px 50% 50%` }} />
      <span style={{
        fontSize:           s.text,
        fontWeight:         900,
        color:              '#FFFFFF',
        letterSpacing:      -0.5,
        fontFamily:         "'Poppins', sans-serif",
        position:           'relative',
        zIndex:             1,
        textShadow:         '0 1px 4px rgba(0,0,0,0.15)',
      }}>feedozone</span>
    </div>
  )
}
