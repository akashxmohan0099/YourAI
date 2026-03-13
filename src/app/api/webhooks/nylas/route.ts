import { createAdminClient } from '@/lib/supabase/admin'
import { handleNylasCalendarWebhook } from '@/lib/scheduling/calendar-sync'

export async function GET(request: Request) {
  // Nylas webhook verification (challenge response)
  const url = new URL(request.url)
  const challenge = url.searchParams.get('challenge')
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('OK', { status: 200 })
}

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-nylas-signature')
      if (!signature) {
        return new Response('Missing signature', { status: 401 })
      }

      const body = await request.text()
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const sig = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(body)
      )
      const expectedSig = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      if (expectedSig !== signature) {
        return new Response('Invalid signature', { status: 401 })
      }

      const payload = JSON.parse(body)
      const supabase = createAdminClient()

      for (const delta of payload.deltas || [payload]) {
        await handleNylasCalendarWebhook(supabase, delta)
      }
    } else {
      const payload = await request.json()
      const supabase = createAdminClient()

      for (const delta of payload.deltas || [payload]) {
        await handleNylasCalendarWebhook(supabase, delta)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Nylas webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
}
