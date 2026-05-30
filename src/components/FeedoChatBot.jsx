import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

// ─── Feedo 24/7 Customer-Care Chatbot ───────────────────────────────────────
// Floating bubble in the bottom-right corner of the user dashboard. Opens
// a chat panel that talks to /api/chat (which proxies OpenRouter). The
// assistant replies in the user's chosen language (English/Hindi/Marathi)
// because we send `lang` along with each request.

const STORAGE_KEY = 'feedo_chatbot_history'

const STRINGS = {
  en: {
    title: 'Feedo Assistant',
    subtitle: '24/7 instant help',
    welcome: "Hi! I'm Feedo Assistant. How can I help you today? Ask me about orders, delivery, refunds or anything else.",
    placeholder: 'Type your message…',
    send: 'Send',
    you: 'You',
    bot: 'Feedo Assistant',
    typing: 'Typing…',
    error: "Sorry, I couldn't reach the server. Please try again.",
    clear: 'Clear chat',
    bubbleAria: 'Open Feedo customer-care chat',
    closeAria: 'Close chat',
    quick1: 'Where is my order?',
    quick2: 'How do I cancel?',
    quick3: 'Payment failed',
  },
  hi: {
    title: 'फीडो असिस्टेंट',
    subtitle: '24/7 तुरंत मदद',
    welcome: 'नमस्ते! मैं फीडो असिस्टेंट हूँ। आज मैं आपकी क्या मदद कर सकता हूँ? ऑर्डर, डिलीवरी, रिफंड या कुछ भी पूछें।',
    placeholder: 'अपना संदेश लिखें…',
    send: 'भेजें',
    you: 'आप',
    bot: 'फीडो असिस्टेंट',
    typing: 'टाइप कर रहा है…',
    error: 'क्षमा करें, सर्वर से जुड़ नहीं पाया। कृपया पुनः प्रयास करें।',
    clear: 'चैट साफ़ करें',
    bubbleAria: 'फीडो कस्टमर केयर चैट खोलें',
    closeAria: 'चैट बंद करें',
    quick1: 'मेरा ऑर्डर कहाँ है?',
    quick2: 'कैसे रद्द करें?',
    quick3: 'पेमेंट फेल हुआ',
  },
  mr: {
    title: 'फीडो असिस्टंट',
    subtitle: '24/7 त्वरित मदत',
    welcome: 'नमस्कार! मी फीडो असिस्टंट आहे. आज मी तुमची कशी मदत करू? ऑर्डर, डिलिव्हरी, रिफंड किंवा काहीही विचारा.',
    placeholder: 'तुमचा संदेश लिहा…',
    send: 'पाठवा',
    you: 'तुम्ही',
    bot: 'फीडो असिस्टंट',
    typing: 'टाइप करत आहे…',
    error: 'क्षमस्व, सर्व्हरशी कनेक्ट होऊ शकलो नाही. कृपया पुन्हा प्रयत्न करा.',
    clear: 'चॅट साफ करा',
    bubbleAria: 'फीडो कस्टमर केअर चॅट उघडा',
    closeAria: 'चॅट बंद करा',
    quick1: 'माझी ऑर्डर कुठे आहे?',
    quick2: 'कसे रद्द करायचे?',
    quick3: 'पेमेंट अयशस्वी',
  },
}

function pickStrings(lang) {
  return STRINGS[lang] || STRINGS.en
}

export default function FeedoChatBot() {
  const { lang } = useLanguage()
  const s = pickStrings(lang)

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return [{ role: 'assistant', content: STRINGS.en.welcome }]
  })

  const scrollerRef = useRef(null)
  const inputRef = useRef(null)

  // Persist conversation locally so users don't lose context on reload.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))) } catch {}
  }, [messages])

  // Refresh the welcome message when the user changes language and the
  // conversation is still empty.
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: s.welcome }]
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // Auto-scroll to the bottom whenever a new message arrives.
  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending, open])

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(id)
    }
  }, [open])

  // Allow other parts of the app (e.g., the Profile menu's "Chat with AI"
  // entry) to pop the chatbot open with a custom event.
  useEffect(() => {
    const openIt = () => setOpen(true)
    window.addEventListener('feedo-open-chatbot', openIt)
    return () => window.removeEventListener('feedo-open-chatbot', openIt)
  }, [])

  // ─── Send a message ──────────────────────────────────────────────────────
  // Production path: POST /api/chat (the Vercel serverless proxy).
  // Dev fallback: if /api/chat returns 404 (Vite dev server doesn't run
  // serverless functions) and a `VITE_OPENROUTER_API_KEY` is configured in
  // `.env.local`, call OpenRouter directly so you can test locally.
  async function callBackend(history) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, lang }),
    })
    // Vite dev returns text/html (the index page) for unknown routes — that
    // shows up as a non-JSON response. Treat that as "endpoint missing".
    const ctype = res.headers.get('content-type') || ''
    if (res.status === 404 || !ctype.includes('application/json')) {
      const e = new Error('endpoint-missing'); e.code = 'NO_ENDPOINT'; throw e
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data.reply
  }

  async function callOpenRouterDirect(history) {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!key) {
      const e = new Error('no-dev-key'); e.code = 'NO_DEV_KEY'; throw e
    }
    const langLabel = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'
    const systemMsg = {
      role: 'system',
      content:
        'You are "Feedo Assistant", the friendly 24/7 customer-care chatbot for FeedoZone (a food-delivery app in Warananagar, Kolhapur). ' +
        'Help with orders, delivery, refunds, payments, and app usage. Be concise and warm. ' +
        'For sensitive issues (refund decisions, fraud, account takeover) tell the user to tap "Contact Support" in the Profile tab. ' +
        'Never ask for passwords, OTPs, or card numbers. Delivery radius is 4 km, typical time 25-45 min, payments via UPI or COD. ' +
        `Reply in ${langLabel} unless the user clearly switches.`,
    }
    const recent = history.slice(-16).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 2000),
    }))
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'FeedoZone Customer Care (dev)',
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        messages: [systemMsg, ...recent],
        temperature: 0.4,
        max_tokens: 350,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error?.message || data?.error || 'OpenRouter request failed')
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) throw new Error('Empty reply')
    return reply
  }

  async function send(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending) return
    setInput('')

    const next = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setSending(true)

    try {
      let reply
      try {
        reply = await callBackend(next)
      } catch (e) {
        // In dev (or if the server function is missing) fall back to a direct
        // OpenRouter call using a Vite-time public key. Only enabled when
        // VITE_OPENROUTER_API_KEY is set.
        if (e?.code === 'NO_ENDPOINT' || e?.code === 'NO_DEV_KEY' || /Failed to fetch|NetworkError/i.test(e?.message || '')) {
          reply = await callOpenRouterDirect(next)
        } else {
          throw e
        }
      }
      setMessages(curr => [...curr, { role: 'assistant', content: reply }])
    } catch (err) {
      console.warn('Chatbot error:', err)
      setMessages(curr => [...curr, { role: 'assistant', content: s.error }])
    } finally {
      setSending(false)
    }
  }

  function clearChat() {
    const fresh = [{ role: 'assistant', content: s.welcome }]
    setMessages(fresh)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)) } catch {}
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // ─── Floating bubble ──────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={s.bubbleAria}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 92, // sits above the bottom nav (≈64px) with breathing room
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E24B4A 0%, #c93a39 100%)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(226,75,74,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5000,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        💬
      </button>
    )
  }

  // ─── Chat panel ───────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        width: 'min(380px, calc(100vw - 24px))',
        height: 'min(560px, calc(100vh - 24px))',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5001,
        overflow: 'hidden',
        fontFamily: 'Poppins, sans-serif',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#f3f4f6',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #E24B4A 0%, #c93a39 100%)',
          color: '#fff',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🤖
        </div>
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
          <div style={{ fontSize: 11, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            {s.subtitle}
          </div>
        </div>
        <button
          onClick={clearChat}
          title={s.clear}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            width: 30,
            height: 30,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🗑
        </button>
        <button
          onClick={() => setOpen(false)}
          aria-label={s.closeAria}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            width: 30,
            height: 30,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 14,
          background: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? '#E24B4A' : '#fff',
              color: m.role === 'user' ? '#fff' : '#1f2937',
              padding: '9px 12px',
              borderRadius: 14,
              borderBottomRightRadius: m.role === 'user' ? 4 : 14,
              borderBottomLeftRadius: m.role === 'user' ? 14 : 4,
              fontSize: 13,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              boxShadow: m.role === 'user' ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
              borderWidth: m.role === 'user' ? 0 : 1,
              borderStyle: 'solid',
              borderColor: '#f3f4f6',
            }}
          >
            {m.content}
          </div>
        ))}

        {sending && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#fff',
              color: '#9ca3af',
              padding: '9px 12px',
              borderRadius: 14,
              borderBottomLeftRadius: 4,
              fontSize: 12,
              fontStyle: 'italic',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: '#f3f4f6',
            }}
          >
            {s.typing}
          </div>
        )}
      </div>

      {/* Quick suggestions (shown only on a fresh conversation) */}
      {messages.length <= 1 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '8px 10px 0',
            flexWrap: 'wrap',
            background: '#f9fafb',
          }}
        >
          {[s.quick1, s.quick2, s.quick3].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={sending}
              style={{
                fontSize: 11,
                padding: '6px 10px',
                borderRadius: 14,
                background: '#fff',
                color: '#E24B4A',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#fee2e2',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 10,
          background: '#fff',
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: '#f3f4f6',
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={s.placeholder}
          disabled={sending}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#e5e7eb',
            borderRadius: 12,
            fontSize: 13,
            fontFamily: 'Poppins, sans-serif',
            outline: 'none',
            background: '#f9fafb',
          }}
        />
        <button
          onClick={() => send()}
          disabled={sending || !input.trim()}
          style={{
            background: sending || !input.trim() ? '#f3a5a4' : '#E24B4A',
            color: '#fff',
            border: 'none',
            padding: '0 16px',
            borderRadius: 12,
            cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {s.send}
        </button>
      </div>
    </div>
  )
}
