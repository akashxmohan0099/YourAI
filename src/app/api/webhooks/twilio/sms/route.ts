import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { runAgentSync } from '@/lib/ai/agent'
import { normalizeIncomingMessage, resolveTenantFromChannel } from '@/lib/channels/normalizer'
import { sendSms } from '@/lib/twilio/client'
import { handleApprovalSmsReply } from '@/lib/approvals/engine'
import { ModelMessage } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    const from = body.From
    const to = body.To
    const messageBody = body.Body
    const messageSid = body.MessageSid

    if (!from || !messageBody) {
      return twimlResponse('Missing required fields')
    }

    // Resolve tenant from To number
    const tenantId = await resolveTenantFromChannel('sms', body)
    if (!tenantId) {
      return twimlResponse("Sorry, this number isn't configured.")
    }

    const supabase = createAdminClient()

    // Check if this is an approval reply (YES/NO)
    const approvalHandled = await handleApprovalSmsReply(supabase, tenantId, from, messageBody)
    if (approvalHandled) {
      return twimlResponse('') // Empty TwiML - we send our own response via API
    }

    // Normalize incoming message
    const normalized = await normalizeIncomingMessage('sms', body, tenantId)

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: normalized.conversationId,
      tenant_id: tenantId,
      role: 'user',
      content: messageBody,
      channel_message_id: messageSid,
      metadata: { channel: 'sms', from, to },
    })

    // Get conversation history
    const { data: prevMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', normalized.conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    const messages: ModelMessage[] = (prevMessages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })) as ModelMessage[]

    // Build context and run agent
    const context = await buildBusinessContext(supabase, tenantId)
    const response = await runAgentSync(messages, {
      tenantId,
      conversationId: normalized.conversationId,
      mode: 'customer',
      context,
      supabase,
    })

    // Save assistant response
    await supabase.from('messages').insert({
      conversation_id: normalized.conversationId,
      tenant_id: tenantId,
      role: 'assistant',
      content: response,
      metadata: { channel: 'sms', to: from },
    })

    // Send SMS reply via Twilio API (more reliable than TwiML for longer messages)
    await sendSms(from, response, to)

    return twimlResponse('') // Empty TwiML since we sent via API
  } catch (error) {
    console.error('SMS webhook error:', error)
    return twimlResponse("Sorry, I'm having trouble right now. Please try again later.")
  }
}

function twimlResponse(message: string): NextResponse {
  const twiml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
