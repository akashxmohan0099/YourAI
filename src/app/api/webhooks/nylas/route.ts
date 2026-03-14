import { createAdminClient } from '@/lib/supabase/admin'
import { handleNylasCalendarWebhook } from '@/lib/scheduling/calendar-sync'
import { processInboundEmail } from '@/lib/background/process-email'
import { verifyNylasWebhookRequest } from '@/lib/nylas/webhook-validator'

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
    const verification = await verifyNylasWebhookRequest(request)
    if (!verification.ok) {
      return verification.response
    }

    const payload = JSON.parse(verification.body)
    const supabase = createAdminClient()

    for (const delta of payload.deltas || [payload]) {
      const eventType = delta.type || ''

      if (eventType.startsWith('message.')) {
        // Route email events
        if (eventType === 'message.created') {
          const message = delta.data?.object || delta
          const grantId = delta.data?.grant_id || delta.grant_id

          const { data: config } = await supabase
            .from('business_config')
            .select('tenant_id')
            .eq('nylas_grant_id', grantId)
            .single()

          if (config) {
            processInboundEmail({
              tenantId: config.tenant_id,
              messageId: message.id,
              threadId: message.thread_id,
              from: message.from?.[0]?.email,
              fromName: message.from?.[0]?.name,
              subject: message.subject,
              body: message.body || message.snippet || '',
              grantId,
            }).catch(err => console.error('Email processing error:', err))
          }
        }
      } else if (eventType.startsWith('calendar.')) {
        // Route calendar events
        await handleNylasCalendarWebhook(supabase, delta)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Nylas webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
}
