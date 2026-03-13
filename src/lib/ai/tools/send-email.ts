import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/nylas/client'

export function sendEmailTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Send an email to a client. Use when the owner asks to email someone, send a follow-up, or deliver information by email.',
    inputSchema: z.object({
      clientName: z.string().describe('Name of the client to email'),
      subject: z.string().describe('Email subject line'),
      body: z.string().describe('Email body text (plain text or simple HTML)'),
    }),
    execute: async ({
      clientName,
      subject,
      body,
    }: {
      clientName: string
      subject: string
      body: string
    }) => {
      // Get Nylas grant ID for this tenant
      const { data: config } = await supabase
        .from('business_config')
        .select('nylas_grant_id')
        .eq('tenant_id', tenantId)
        .single()

      if (!config?.nylas_grant_id) {
        return { success: false, message: 'Email is not configured yet. Connect your email in Settings > Channels.' }
      }

      // Find client by name to get email
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${clientName}%`)
        .limit(3)

      if (!clients || clients.length === 0) {
        return { success: false, message: `No client found matching "${clientName}". Try searching for them first.` }
      }

      const client = clients[0]
      if (!client.email) {
        return { success: false, message: `${client.name} doesn't have an email address on file.` }
      }

      try {
        await sendEmail(config.nylas_grant_id, {
          to: [{ email: client.email, name: client.name }],
          subject,
          body,
        })

        return {
          success: true,
          message: `Email sent to ${client.name} at ${client.email}`,
          recipientName: client.name,
          recipientEmail: client.email,
        }
      } catch (err: any) {
        return { success: false, message: `Failed to send email: ${err.message}` }
      }
    },
  })
}
