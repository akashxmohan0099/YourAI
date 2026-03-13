import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendInvoice } from '@/lib/billing/invoices'
import { sendSms } from '@/lib/twilio/client'
import { sendEmail } from '@/lib/nylas/client'

export function sendInvoiceTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Send a previously created invoice to a client. Sends via Stripe (if connected), and optionally notifies by SMS or email.',
    inputSchema: z.object({
      invoiceNumber: z.string().describe('The invoice number (e.g., INV-0001)'),
      notifyVia: z
        .enum(['sms', 'email', 'both', 'none'])
        .optional()
        .describe('Additionally notify the client via SMS, email, or both. Stripe email is sent automatically if connected.'),
    }),
    execute: async ({
      invoiceNumber,
      notifyVia = 'none',
    }: {
      invoiceNumber: string
      notifyVia?: 'sms' | 'email' | 'both' | 'none'
    }) => {
      // Look up the invoice
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, clients(name, phone, email)')
        .eq('tenant_id', tenantId)
        .eq('invoice_number', invoiceNumber)
        .single()

      if (!invoice) {
        return { success: false, message: `Invoice ${invoiceNumber} not found.` }
      }

      const client = invoice.clients as any
      const totalFormatted = `$${(invoice.total_cents / 100).toFixed(2)}`
      const results: string[] = []

      // Send via Stripe (marks as sent, gets payment URL)
      const sendResult = await sendInvoice(supabase, tenantId, invoice.id)
      if (sendResult.success) {
        results.push('Invoice sent via Stripe')
        if (sendResult.paymentUrl) {
          results.push(`Payment link: ${sendResult.paymentUrl}`)
        }
      } else if (sendResult.error) {
        results.push(`Stripe: ${sendResult.error}`)
      }

      // Get business config
      const { data: config } = await supabase
        .from('business_config')
        .select('business_name, nylas_grant_id')
        .eq('tenant_id', tenantId)
        .single()

      const businessName = config?.business_name || 'Our business'

      // Notify via SMS
      if ((notifyVia === 'sms' || notifyVia === 'both') && client?.phone) {
        try {
          const smsLines = [
            `${businessName} — Invoice ${invoiceNumber}`,
            '',
            `Amount due: ${totalFormatted}`,
            invoice.due_date ? `Due by: ${invoice.due_date}` : '',
          ].filter(Boolean)

          if (sendResult.paymentUrl) {
            smsLines.push('', `Pay online: ${sendResult.paymentUrl}`)
          }

          smsLines.push('', 'Reply with any questions.')
          await sendSms(client.phone, smsLines.join('\n'))
          results.push(`SMS notification sent to ${client.phone}`)
        } catch (err: any) {
          results.push(`SMS notification failed: ${err.message}`)
        }
      }

      // Notify via email
      if ((notifyVia === 'email' || notifyVia === 'both') && client?.email && config?.nylas_grant_id) {
        try {
          const paymentLink = sendResult.paymentUrl
            ? `<p><a href="${sendResult.paymentUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:bold">Pay Now — ${totalFormatted}</a></p>`
            : ''

          const emailBody = `
<h2>Invoice ${invoiceNumber}</h2>
<p>Hi ${client.name},</p>
<p>Please find your invoice from ${businessName}.</p>
<p><strong>Amount due: ${totalFormatted}</strong></p>
${invoice.due_date ? `<p>Due by: ${invoice.due_date}</p>` : ''}
${paymentLink}
<p>Thank you,<br>${businessName}</p>`

          await sendEmail(config.nylas_grant_id, {
            to: [{ email: client.email, name: client.name }],
            subject: `Invoice ${invoiceNumber} from ${businessName} — ${totalFormatted}`,
            body: emailBody,
          })
          results.push(`Email notification sent to ${client.email}`)
        } catch (err: any) {
          results.push(`Email notification failed: ${err.message}`)
        }
      }

      return {
        success: true,
        message: results.join('. '),
        invoiceNumber,
        total: totalFormatted,
        paymentUrl: sendResult.paymentUrl,
        client: client?.name,
      }
    },
  })
}
