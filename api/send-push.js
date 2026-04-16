// api/send-push.js
// Called by FounderApp to send push notifications to USERS

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { notifications } = req.body

    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    // Forward to Expo push service
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications)
    })

    const expoData = await expoRes.json()

    return res.status(200).json({
      success: true,
      data: expoData.data || [],
      sent: notifications.length
    })

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: err.message })
  }
}