import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { updateQuoteStatus } from '@/lib/billing/quotes'
import { sendSms } from '@/lib/twilio/client'
import { sendEmail } from '@/lib/nylas/client'

export function sendQuoteTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Send a previously created quote to a client via SMS or email. Use after creating a quote when the owner wants to deliver it.',
    inputSchema: z.object({
      quoteNumber: z.string().describe('The quote number (e.g., Q-0001)'),
      via: z
        .enum(['sms', 'email', 'both'])
        .describe('How to deliver the quote: sms, email, or both'),
    }),
    execute: async ({ quoteNumber, via }: { quoteNumber: string; via: 'sms' | 'email' | 'both' }) => {
      // Look up the quote
      const { data: quote } = await supabase
        .from('quotes')
        .select('*, clients(name, phone, email)')
        .eq('tenant_id', tenantId)
        .eq('quote_number', quoteNumber)
        .single()

      if (!quote) {
        return { success: false, message: `Quote ${quoteNumber} not found.` }
      }

      const client = quote.clients as any
      if (!client) {
        return { success: false, message: `No client linked to quote ${quoteNumber}.` }
      }

      // Get business config for email
      const { data: config } = await supabase
        .from('business_config')
        .select('business_name, nylas_grant_id')
        .eq('tenant_id', tenantId)
        .single()

      const businessName = config?.business_name || 'Our business'
      const totalFormatted = `$${(quote.total_cents / 100).toFixed(2)}`
      const lineItemsSummary = (quote.line_items as any[])
        .map((li) => `- ${li.description}: $${(li.totalCents / 100).toFixed(2)}`)
        .join('\n')

      const results: string[] = []

      // Send via SMS
      if ((via === 'sms' || via === 'both') && client.phone) {
        try {
          const smsBody = [
            `${businessName} — Quote ${quoteNumber}`,
            '',
            lineItemsSummary,
            '',
            `Total: ${totalFormatted}`,
            quote.valid_until ? `Valid until: ${quote.valid_until}` : '',
            '',
            'Reply to accept or ask questions.',
          ].filter(Boolean).join('\n')

          await sendSms(client.phone, smsBody)
          results.push(`SMS sent to ${client.phone}`)
        } catch (err: any) {
          results.push(`SMS failed: ${err.message}`)
        }
      } else if ((via === 'sms' || via === 'both') && !client.phone) {
        results.push(`No phone number on file for ${client.name}`)
      }

      // Send via email
      if ((via === 'email' || via === 'both') && client.email && config?.nylas_grant_id) {
        try {
          const emailBody = `
<h2>Quote ${quoteNumber} from ${businessName}</h2>
<p>Hi ${client.name},</p>
<p>Here's your quote:</p>
<table style="border-collapse:collapse;width:100%;max-width:500px">
  <thead>
    <tr style="border-bottom:2px solid #eee">
      <th style="text-align:left;padding:8px">Item</th>
      <th style="text-align:right;padding:8px">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${(quote.line_items as any[]).map((li) => `
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:8px">${li.description} (x${li.quantity})</td>
      <td style="text-align:right;padding:8px">$${(li.totalCents / 100).toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
  <tfoot>
    ${quote.tax_cents > 0 ? `
    <tr><td style="padding:8px">Subtotal</td><td style="text-align:right;padding:8px">$${(quote.subtotal_cents / 100).toFixed(2)}</td></tr>
    <tr><td style="padding:8px">Tax</td><td style="text-align:right;padding:8px">$${(quote.tax_cents / 100).toFixed(2)}</td></tr>` : ''}
    <tr style="border-top:2px solid #333">
      <td style="padding:8px;font-weight:bold">Total</td>
      <td style="text-align:right;padding:8px;font-weight:bold">${totalFormatted}</td>
    </tr>
  </tfoot>
</table>
${quote.valid_until ? `<p style="color:#666;font-size:14px">This quote is valid until ${quote.valid_until}.</p>` : ''}
${quote.notes ? `<p style="color:#666;font-size:14px">Note: ${quote.notes}</p>` : ''}
<p>Please reply to this email to accept or if you have any questions.</p>
<p>Thank you,<br>${businessName}</p>`

          await sendEmail(config.nylas_grant_id, {
            to: [{ email: client.email, name: client.name }],
            subject: `Quote ${quoteNumber} from ${businessName} — ${totalFormatted}`,
            body: emailBody,
          })
          results.push(`Email sent to ${client.email}`)
        } catch (err: any) {
          results.push(`Email failed: ${err.message}`)
        }
      } else if ((via === 'email' || via === 'both') && !client.email) {
        results.push(`No email address on file for ${client.name}`)
      } else if ((via === 'email' || via === 'both') && !config?.nylas_grant_id) {
        results.push('Email not configured. Connect email in Settings > Channels.')
      }

      // Mark quote as sent
      if (results.some((r) => r.startsWith('SMS sent') || r.startsWith('Email sent'))) {
        await updateQuoteStatus(supabase, tenantId, quote.id, 'sent')
      }

      return {
        success: results.some((r) => r.includes('sent')),
        message: results.join('. '),
        quoteNumber,
        total: totalFormatted,
        client: client.name,
      }
    },
  })
}
