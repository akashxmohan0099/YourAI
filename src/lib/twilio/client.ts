const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01'

export async function sendSms(to: string, body: string, from?: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = from || process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio credentials')
  }

  const params = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: body,
  })

  const res = await fetch(
    `${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Twilio API error: ${error.message || res.status}`)
  }

  const data = await res.json()
  return {
    sid: data.sid,
    status: data.status,
  }
}

export async function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  // Sort params and build validation string
  const sortedKeys = Object.keys(params).sort()
  let dataString = url
  for (const key of sortedKeys) {
    dataString += key + params[key]
  }

  // HMAC-SHA1
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(authToken),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(dataString))
  const computed = Buffer.from(sig).toString('base64')

  return computed === signature
}
