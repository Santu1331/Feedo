// ─── Feedo Customer Care Chatbot (server-side proxy) ────────────────────────
// Why this is a server endpoint:
//   • OpenRouter API keys must NEVER ship to the browser.
//   • Vercel injects `process.env.OPENROUTER_API_KEY` at runtime so the key
//     stays secret, while the client just POSTs messages to /api/chat.
//
// Setup (one-time on Vercel):
//   1. Project → Settings → Environment Variables
//   2. Add: OPENROUTER_API_KEY = <your-rotated-key>
//   3. Re-deploy.

const SYSTEM_PROMPT = `You are "Feedo Assistant", the friendly 24/7 customer-care
chatbot for FeedoZone — a food-delivery app serving Warananagar, Kolhapur,
Maharashtra, India.

Your job: help customers with order issues, refunds, delivery delays, payment
questions, account problems, vendor info, and how to use the app.

Guidelines:
- Be warm, concise, and human. Use short sentences and bullet points.
- Reply in the SAME LANGUAGE the user wrote in (English, Hindi, or Marathi).
  If the user mixes Hindi/Marathi with English (Hinglish/Marathi-Roman), match
  that style.
- Keep answers under ~120 words unless the user asks for detail.
- If a question needs human help (refund decisions, escalations, fraud,
  legal matters, account takeover) tell the user politely that you'll
  connect them to the Feedo support team and ask them to tap
  "Contact Support" inside the Profile tab to start a live chat with a human.
- Never invent order numbers, refund timelines, prices, or vendor names you
  haven't been told. If you don't know, say so and offer to escalate.
- Never share or ask for passwords, OTPs, card numbers, or CVVs.
- For delivery delays: typical Feedo delivery is 25-45 minutes depending on
  vendor prep time and distance (max 4 km radius).
- For payments: Feedo supports UPI and Cash on Delivery.
- For cancellations: orders can be cancelled before the vendor accepts; once
  preparing, the user must contact support.
- App download (if asked): https://play.google.com/store/apps/details?id=com.feedozone.app2024

Greeting (only on the FIRST message of a conversation): introduce yourself
briefly as "Feedo Assistant" and ask how you can help today.`

export default async function handler(req, res) {
  // CORS — same pattern the rest of the API uses.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'Chatbot is not configured. Missing OPENROUTER_API_KEY on the server.',
    })
  }

  try {
    const { messages, lang } = req.body || {}
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' })
    }

    // Trim history to last 16 turns to keep prompts cheap and snappy.
    const recent = messages.slice(-16).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 2000), // hard cap per turn
    }))

    // Hint the model about the user's preferred language so it answers in it
    // even if the user is silent or just sends an emoji.
    const langLabel = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'
    const systemMsg = {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\nUser's preferred language: ${langLabel}. Answer in that language unless the user explicitly switches.`,
    }

    const payload = {
      // Free, fast, multilingual model on OpenRouter. Change in env if needed.
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
      messages: [systemMsg, ...recent],
      temperature: 0.4,
      max_tokens: 350,
    }

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter recommends these for attribution / rate limits.
        'HTTP-Referer': process.env.OPENROUTER_REFERER || 'https://feedozone.app',
        'X-Title': 'FeedoZone Customer Care',
      },
      body: JSON.stringify(payload),
    })

    if (!orRes.ok) {
      const text = await orRes.text()
      console.error('OpenRouter error:', orRes.status, text)
      return res.status(502).json({ error: 'Chat service is temporarily unavailable. Please try again.' })
    }

    const data = await orRes.json()
    const reply = data?.choices?.[0]?.message?.content?.trim() || ''
    if (!reply) {
      return res.status(502).json({ error: 'Empty reply from the chat model.' })
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('Chat handler error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}
