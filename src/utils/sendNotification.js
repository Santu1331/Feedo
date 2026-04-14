// Expo Push Notification sender — works from browser/frontend
export async function sendPushNotification({ expoPushToken, title, body, data = {} }) {
  if (!expoPushToken) return
  if (!expoPushToken.startsWith('ExponentPushToken')) return

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        badge: 1,
      }),
    })
  } catch (err) {
    console.error('Push notification failed:', err)
  }
}