import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'

export function searchClientsTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Search for clients by name, email, or phone number. Returns matching client profiles with their history.',
    inputSchema: z.object({
      query: z.string().describe('Search query — name, email, or phone number'),
      limit: z.number().optional().describe('Max results to return (default 5)'),
    }),
    execute: async ({ query, limit }: { query: string; limit?: number }) => {
      const maxResults = limit || 5

      // Search across name, email, phone
      const { data: clients } = await supabase
        .from('clients')
        .select(
          `id, name, email, phone, first_seen_at, last_seen_at, source_channel,
           client_notes(note, source, created_at),
           client_tags(tag),
           conversations(id, channel, status, started_at)`
        )
        .eq('tenant_id', tenantId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('last_seen_at', { ascending: false })
        .limit(maxResults)

      if (!clients || clients.length === 0) {
        return {
          success: true,
          count: 0,
          message: `No clients found matching "${query}".`,
          clients: [],
        }
      }

      const formatted = clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        firstSeen: c.first_seen_at,
        lastSeen: c.last_seen_at,
        sourceChannel: c.source_channel,
        tags: (c.client_tags || []).map((t: any) => t.tag),
        notesCount: (c.client_notes || []).length,
        recentNotes: (c.client_notes || [])
          .slice(0, 3)
          .map((n: any) => ({ note: n.note, source: n.source })),
        conversationsCount: (c.conversations || []).length,
      }))

      return {
        success: true,
        count: formatted.length,
        clients: formatted,
      }
    },
  })
}
