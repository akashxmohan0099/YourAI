import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'

export function addClientNoteTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Add a note to a client record. Use for recording preferences, important details, follow-up items, or observations about a client.',
    inputSchema: z.object({
      clientName: z.string().describe('Name of the client'),
      note: z.string().describe('The note to add'),
      tag: z.string().optional().describe('Optional tag to add to the client (e.g., "VIP", "new", "follow-up")'),
    }),
    execute: async ({
      clientName,
      note,
      tag,
    }: {
      clientName: string
      note: string
      tag?: string
    }) => {
      // Find client
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${clientName}%`)
        .limit(1)

      if (!clients || clients.length === 0) {
        return {
          success: false,
          message: `No client found matching "${clientName}".`,
        }
      }

      const client = clients[0]

      // Add note
      const { error: noteError } = await supabase.from('client_notes').insert({
        tenant_id: tenantId,
        client_id: client.id,
        note,
        source: 'ai',
      })

      if (noteError) {
        return { success: false, message: `Failed to add note: ${noteError.message}` }
      }

      // Add tag if provided
      if (tag) {
        await supabase
          .from('client_tags')
          .upsert(
            { tenant_id: tenantId, client_id: client.id, tag: tag.toLowerCase() },
            { onConflict: 'client_id,tag' }
          )
      }

      return {
        success: true,
        message: `Note added to ${client.name}'s record${tag ? ` with tag "${tag}"` : ''}.`,
        clientId: client.id,
      }
    },
  })
}
