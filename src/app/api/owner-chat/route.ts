import { createClient } from '@/lib/supabase/server'
import { buildBusinessContext } from '@/lib/ai/context-builder'
import { runAgentStream } from '@/lib/ai/agent'
import { convertToModelMessages } from 'ai'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get tenant from user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tenant_id, role')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || !['owner', 'admin'].includes(profile.role)) {
      return new Response('Forbidden', { status: 403 })
    }

    const tenantId = profile.tenant_id
    const { messages, conversationId } = await request.json()

    const context = await buildBusinessContext(supabase, tenantId)

    // Ensure conversation exists
    let convId = conversationId
    if (!convId) {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          tenant_id: tenantId,
          channel: 'web_chat',
          status: 'active',
          metadata: { type: 'owner_chat' },
        })
        .select('id')
        .single()
      convId = conv?.id
    }

    // Save user message
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      const content =
        typeof lastMessage.content === 'string'
          ? lastMessage.content
          : lastMessage.content?.[0]?.text || ''
      await supabase.from('messages').insert({
        conversation_id: convId,
        tenant_id: tenantId,
        role: 'user',
        content,
      })
    }

    const modelMessages = await convertToModelMessages(messages)

    const result = await runAgentStream(modelMessages, {
      tenantId,
      conversationId: convId,
      mode: 'owner',
      context,
      supabase,
    })

    // Save assistant response in background
    Promise.resolve(result.text)
      .then(async (text: string) => {
        if (text) {
          await supabase.from('messages').insert({
            conversation_id: convId,
            tenant_id: tenantId,
            role: 'assistant',
            content: text,
          })
        }
      })
      .catch(console.error)

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Owner chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
