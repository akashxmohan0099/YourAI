import { inngest } from '../client'
import { createAdminClient } from '@/lib/supabase/admin'

export const processVapiEvent = inngest.createFunction(
  { id: 'process-vapi-event' },
  { event: 'vapi/event' },
  async ({ event }) => {
    const { type, callId, payload } = event.data

    const supabase = createAdminClient()

    // Log the event
    await supabase.from('ai_audit_log').insert({
      tenant_id: null as any, // Will be resolved if possible
      event_type: 'tool_call',
      tool_name: `vapi:${type}`,
      tool_input: { callId, type },
      tool_output: payload,
    })

    return { processed: true, type, callId }
  }
)
