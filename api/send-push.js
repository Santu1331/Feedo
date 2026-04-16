export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Parse body manually if needed
    let body = req.body
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }

    const { notifications } = body

    if (!notifications || notifications.length === 0) {
      return res.status(400).json({ error: 'No notifications provided' })
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications)
    })

    const data = await response.json()
    return res.status(200).json(data)

  } catch (err) {
    console.error('send-push error:', err)
    return res.status(500).json({ error: err.message })
  }
}