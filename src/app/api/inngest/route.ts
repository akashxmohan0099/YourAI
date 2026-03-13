import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { logConversationEvent } from '@/lib/inngest/functions/log-conversation'
import { handleApprovalCreated, handleApprovalResolved } from '@/lib/inngest/functions/process-approval'
import { processVapiEvent } from '@/lib/inngest/functions/process-vapi-event'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    logConversationEvent,
    handleApprovalCreated,
    handleApprovalResolved,
    processVapiEvent,
  ],
})
