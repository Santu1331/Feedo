// api/send-push.js
// Sends push notifications to Expo tokens (ExponentPushToken[...]).
// Used for Expo React Native mobile app notifications.
// All fields including categoryId are forwarded to Expo's relay.

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n')
      initializeApp({ credential: cert(sa) })
    } else {
      initializeApp({ credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })})
    }
  } catch (e) { console.error('Firebase Admin init failed:', e) }
}

// ── Send to Expo Push relay (for ExponentPushToken[...] tokens) ──────────────
export async function sendExpoNotifications(notifications) {
  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

  const messages = notifications.map(n => ({
    to:          n.to,
    title:       n.title   || 'FeedoZone',
    body:        n.body    || '',
    sound:       n.sound   || 'default',
    priority:    n.priority || 'high',
    channelId:   n.channelId || 'default',
    badge:       n.badge   ?? 1,
    data:        n.data    || {},
    // ✅ Bug #5 fix — forward categoryId so Expo action buttons work
    ...(n.categoryId ? { categoryId: n.categoryId } : {}),
  }))

  const batches = []
  for (let i = 0; i < messages.length; i += 100) batches.push(messages.slice(i, i + 100))

  const allResults = []
  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method:  'POST',
        headers: {
          'Accept':       'application/json',
          'Content-Type': 'application/json',
          ...(process.env.EXPO_ACCESS_TOKEN
            ? { 'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(batch),
      })
      const result = await response.json()
      if (result.data) {
        result.data.forEach((r, i) => allResults.push({
          success: r.status === 'ok',
          token:   batch[i].to,
          error:   r.status !== 'ok' ? r.message : undefined,
        }))
      }
    } catch (err) {
      batch.forEach(b => allResults.push({ success: false, token: b.to, error: err.message }))
    }
  }
  return allResults
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

    const decoded     = await getAuth().verifyIdToken(authHeader.split('Bearer ')[1])
    const founderEmail = process.env.FOUNDER_EMAIL || 'feedoadmin@gmail.com'
    if (decoded.email !== founderEmail) return res.status(403).json({ error: 'Founder only' })

    const { notifications } = req.body
    if (!Array.isArray(notifications) || notifications.length === 0)
      return res.status(400).json({ error: 'No notifications provided' })

    const valid = notifications.filter(n => n.to && typeof n.to === 'string' && n.to.trim())
    if (valid.length === 0) return res.status(400).json({ error: 'No valid tokens' })

    const results  = await sendExpoNotifications(valid)
    const sentCount = results.filter(r => r.success).length

    return res.status(200).json({ success: true, data: results, sent: sentCount, total: valid.length })
  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: 'Internal Server Error', details: err.message })
  }
}
