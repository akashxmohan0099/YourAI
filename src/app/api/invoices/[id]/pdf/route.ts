import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF, type InvoicePDFProps } from '@/lib/billing/pdf/invoice-template'
import React from 'react'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  /* ---- Auth ---- */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return new Response('Tenant not found', { status: 403 })
  }

  const tenantId = profile.tenant_id

  /* ---- Fetch invoice ---- */
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !invoice) {
    return new Response('Invoice not found', { status: 404 })
  }

  /* ---- Fetch business config ---- */
  const { data: config } = await supabase
    .from('business_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  /* ---- Fetch client ---- */
  let client: { name: string; email?: string; phone?: string } | undefined
  if (invoice.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', invoice.client_id)
      .single()
    if (clientData) {
      client = {
        name: clientData.name,
        email: clientData.email || undefined,
        phone: clientData.phone || undefined,
      }
    }
  }

  /* ---- Fetch Stripe payment URL (best effort) ---- */
  let paymentUrl: string | undefined
  if (invoice.stripe_invoice_id) {
    try {
      const { getStripe } = await import('@/lib/stripe/client')
      const stripe = getStripe()
      const stripeInvoice = await stripe.invoices.retrieve(
        invoice.stripe_invoice_id
      )
      paymentUrl = stripeInvoice.hosted_invoice_url || undefined
    } catch {
      // Stripe may not be configured — continue without payment URL
    }
  }

  /* ---- Build props ---- */
  const address = config?.address as
    | { street?: string; city?: string; state?: string; zip?: string }
    | undefined

  const lineItems = (invoice.line_items as any[]) || []
  const subtotalCents = invoice.subtotal_cents ?? 0
  const taxCents = invoice.tax_cents ?? 0
  const totalCents = invoice.total_cents ?? 0

  // Derive tax rate from subtotal and tax (it is not stored as a column)
  let taxRate = 0
  if (subtotalCents > 0 && taxCents > 0) {
    taxRate = Math.round((taxCents / subtotalCents) * 10000) / 100
  }

  const invoiceDate =
    invoice.created_at?.split('T')[0] ||
    new Date().toISOString().split('T')[0]

  const pdfProps: InvoicePDFProps = {
    invoiceNumber: invoice.invoice_number,
    date: invoiceDate,
    dueDate: invoice.due_date || invoiceDate,
    status: invoice.status || 'draft',
    business: {
      name: config?.business_name || 'Business',
      phone: config?.phone || undefined,
      email: config?.email || undefined,
      website: config?.website || undefined,
      address,
    },
    client,
    lineItems: lineItems.map((item: any) => ({
      description: item.description || '',
      quantity: item.quantity ?? 1,
      unitPriceCents: item.unitPriceCents ?? 0,
      totalCents: item.totalCents ?? 0,
    })),
    subtotalCents,
    taxCents,
    taxRate,
    totalCents,
    notes: invoice.notes || undefined,
    paymentUrl,
  }

  /* ---- Render PDF ---- */
  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, pdfProps) as any
  )

  return new Response(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
