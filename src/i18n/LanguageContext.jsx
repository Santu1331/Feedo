import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations'

const STORAGE_KEY = 'feedo_lang'
const DEFAULT_LANG = 'en'

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  languages: SUPPORTED_LANGUAGES,
})

function detectInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && TRANSLATIONS[stored]) return stored
  } catch {}
  // Try to match the browser's language to one we support
  try {
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase()
    if (nav.startsWith('mr')) return 'mr'
    if (nav.startsWith('hi')) return 'hi'
  } catch {}
  return DEFAULT_LANG
}

// ─── Google Translate driver ─────────────────────────────────────────────────
// Toggles the hidden Google Translate widget so the entire page (including
// dynamic database content like vendor names, addresses, item descriptions)
// gets auto-translated client-side.
function applyGoogleTranslate(targetLang) {
  // Helper: set a cookie at the right scope so Google Translate picks it up
  // on every page load. Format: /<src>/<dest> (e.g., "/en/mr").
  const setCookie = (value) => {
    try {
      const host = window.location.hostname
      // Set on current host
      document.cookie = `googtrans=${value}; path=/`
      // Also set on parent domain (helps when running on subdomains)
      const parent = host.split('.').slice(-2).join('.')
      if (parent && parent !== host) {
        document.cookie = `googtrans=${value}; domain=.${parent}; path=/`
      }
    } catch {}
  }

  if (targetLang === 'en' || !targetLang) {
    // Reset to source language
    setCookie('/en/en')
    // Also clear so fresh visits default to English
    try { document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' } catch {}
  } else {
    setCookie(`/en/${targetLang}`)
  }

  // Try to drive the hidden widget without a full page reload first.
  const trigger = () => {
    const select = document.querySelector('select.goog-te-combo')
    if (!select) return false
    select.value = targetLang === 'en' ? '' : targetLang
    select.dispatchEvent(new Event('change'))
    return true
  }

  // If the widget hasn't initialized yet, queue and retry briefly.
  if (!trigger()) {
    let tries = 0
    const id = setInterval(() => {
      tries += 1
      if (trigger() || tries > 25) clearInterval(id)
    }, 200)

    // As a final fallback (e.g., very slow network), reload the page.
    // The cookie is set, so Google Translate will pick it up on reload.
    setTimeout(() => {
      const stillNotApplied = !document.querySelector('html.translated-ltr, html.translated-rtl')
      const wantedTranslate = targetLang && targetLang !== 'en'
      if (wantedTranslate && stillNotApplied && tries > 25) {
        try { window.location.reload() } catch {}
      }
    }, 6000)
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang)

  // Keep <html lang="..."> in sync so screen readers + browser get the right hint
  useEffect(() => {
    try { document.documentElement.lang = lang } catch {}
  }, [lang])

  // Whenever the language changes (and on first mount), tell Google Translate.
  useEffect(() => {
    applyGoogleTranslate(lang)
  }, [lang])

  // Listen for an init-complete event so a queued language gets applied.
  useEffect(() => {
    const handler = (e) => applyGoogleTranslate(e.detail || lang)
    window.addEventListener('feedo-apply-language', handler)
    return () => window.removeEventListener('feedo-apply-language', handler)
  }, [lang])

  const setLang = (code) => {
    if (!TRANSLATIONS[code]) return
    setLangState(code)
    try { localStorage.setItem(STORAGE_KEY, code) } catch {}
    // Queue for any later widget init (e.g., script still loading)
    if (!window.__googleTranslateReady) window.__pendingTranslateLang = code
  }

  // t(key, vars?) — looks up the key, falls back to English, finally to the key
  const t = useMemo(() => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG]
    const fallback = TRANSLATIONS[DEFAULT_LANG]
    return (key, vars) => {
      let raw = dict[key] ?? fallback[key] ?? key
      if (vars && typeof raw === 'string') {
        Object.keys(vars).forEach(k => {
          raw = raw.replace(new RegExp(`{${k}}`, 'g'), vars[k])
        })
      }
      return raw
    }
  }, [lang])

  const value = useMemo(
    () => ({ lang, setLang, t, languages: SUPPORTED_LANGUAGES }),
    [lang, t]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useT() {
  return useContext(LanguageContext).t
}
