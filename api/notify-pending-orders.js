export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const secret = req.query.secret || req.headers['x-cron-secret']
  if (secret !== 'feedozone_cron_2025') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const projectId = 'feedozone'

    // Fetch vendors with auth bypass using ?key= (public API key)
    // First get vendors
    const vendorUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/vendors`
    const vendorRes = await fetch(vendorUrl)

    if (!vendorRes.ok) {
      const text = await vendorRes.text()
      return res.status(500).json({ error: 'Firestore fetch failed', details: text })
    }

    const vendorData = await vendorRes.json()

    if (!vendorData.documents) {
      return res.status(200).json({ message: 'No vendors found', sent: 0 })
    }

    const notifications = []

    for (const vendorDoc of vendorData.documents) {
      const fields = vendorDoc.fields || {}
      const token = fields.expoPushToken?.stringValue
      const isOpen = fields.isOpen?.booleanValue

      if (!token || !token.startsWith('ExponentPushToken')) continue
      if (!isOpen) continue

      notifications.push({
        to: token,
        title: '🔔 Pending Orders',
        body: 'You may have pending orders. Check your dashboard!',
        sound: 'default',
        priority: 'high',
        channelId: 'default',
      })
    }

    if (notifications.length === 0) {
      return res.status(200).json({ 
        message: 'No open vendors with tokens', 
        sent: 0,
        totalVendors: vendorData.documents.length
      })
    }

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications)
    })

    const expoData = await expoRes.json()
    return res.status(200).json({ sent: notifications.length, expoData })

  } catch (err) {
    console.error('notify-pending-orders error:', err)
    return res.status(500).json({ error: err.message })
  }
}