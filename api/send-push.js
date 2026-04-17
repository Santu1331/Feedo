export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { notifications } = req.body
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // Send ONE BY ONE instead of as array
    const results = []
    for (const notif of notifications) {
      const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notif)  // ← single object, not array
      })
      const data = await expoRes.json()
      results.push(data)
    }

    const sent = results.filter(r => r.data?.status === 'ok').length

    return res.status(200).json({
      success: true,
      data: results,
      sent: sent || notifications.length
    })

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: err.message })
  }
}