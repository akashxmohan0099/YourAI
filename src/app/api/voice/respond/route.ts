import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { runAgentSync } from '@/lib/ai/agent'
import { normalizeIncomingMessage, resolveTenantFromChannel } from '@/lib/channels/normalizer'
import type { VapiServerMessage, VapiServerResponse } from '@/lib/vapi/types'
import { ModelMessage } from 'ai'

export const maxDuration = 10 // Voice requires fast responses

export async function POST(request: NextRequest) {
  try {
    const body: VapiServerMessage = await request.json()
    const messageType = body.message?.type

    // Handle different message types
    if (messageType === 'status-update') {
      return NextResponse.json({})
    }

    if (messageType === 'end-of-call-report') {
      // Save call summary in background
      await handleEndOfCall(body)
      return NextResponse.json({})
    }

    if (messageType === 'transcript' || messageType === 'conversation-update') {
      // These are informational, no response needed
      return NextResponse.json({})
    }

    // Handle tool calls from Vapi
    if (messageType === 'tool-calls' && body.message?.toolCallList) {
      return await handleToolCalls(body)
    }

    // For voice-input or function-call, run through our agent
    if (messageType === 'voice-input' || messageType === 'function-call') {
      return await handleVoiceInput(body)
    }

    return NextResponse.json({})
  } catch (error) {
    console.error('Voice respond error:', error)
    return NextResponse.json(
      { messageResponse: { assistantMessage: { role: 'assistant', content: "I'm sorry, I'm having trouble right now. Please try again." } } },
      { status: 200 } // Always return 200 to Vapi
    )
  }
}

async function handleVoiceInput(body: VapiServerMessage): Promise<NextResponse> {
  const supabase = createAdminClient()

  // Resolve tenant from phone number
  const tenantId = await resolveTenantFromChannel('voice', body.message)
  if (!tenantId) {
    return NextResponse.json({
      messageResponse: {
        assistantMessage: {
          role: 'assistant',
          content: "I'm sorry, this number isn't configured yet. Please contact the business directly.",
        },
      },
    })
  }

  // Get transcript/content
  const content = body.message?.functionCall?.parameters?.userMessage as string
    || body.message?.transcript
    || ''

  if (!content) {
    return NextResponse.json({})
  }

  // Normalize the message
  const normalized = await normalizeIncomingMessage('voice', body.message, tenantId)

  // Save user message
  await supabase.from('messages').insert({
    conversation_id: normalized.conversationId,
    tenant_id: tenantId,
    role: 'user',
    content,
    metadata: { channel: 'voice', callId: body.message?.call?.id },
  })

  // Build context and get conversation history
  const context = await buildBusinessContext(supabase, tenantId)

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

  // Run agent (sync mode - voice needs immediate response)
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
    metadata: { channel: 'voice', callId: body.message?.call?.id },
  })

  const vapiResponse: VapiServerResponse = {
    messageResponse: {
      assistantMessage: {
        role: 'assistant',
        content: response,
      },
    },
  }

  return NextResponse.json(vapiResponse)
}

async function handleToolCalls(body: VapiServerMessage): Promise<NextResponse> {
  // Vapi sends tool calls that we need to resolve
  const toolCalls = body.message?.toolCallList || []
  const results = toolCalls.map((tc) => ({
    toolCallId: tc.id,
    result: JSON.stringify({ message: 'Tool not implemented yet' }),
  }))

  return NextResponse.json({ messageResponse: { toolResults: results } })
}

async function handleEndOfCall(body: VapiServerMessage) {
  const supabase = createAdminClient()
  const callId = body.message?.call?.id
  if (!callId) return

  const tenantId = await resolveTenantFromChannel('voice', body.message)
  if (!tenantId) return

  // Find and close the conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('metadata->>callId', callId)
    .single()

  if (conv) {
    await supabase
      .from('conversations')
      .update({
        status: 'resolved',
        ended_at: new Date().toISOString(),
        metadata: {
          callId,
          endedReason: body.message?.endedReason,
          summary: body.message?.summary,
          recordingUrl: body.message?.recordingUrl,
        },
      })
      .eq('id', conv.id)
  }
}
