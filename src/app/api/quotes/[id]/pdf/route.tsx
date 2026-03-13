import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePDF } from '@/lib/billing/pdf/quote-template'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get tenant
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return new Response('Tenant not found', { status: 403 })
  }

  const tenantId = profile.tenant_id

  // Fetch quote with tenant check
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (quoteError || !quote) {
    return new Response('Quote not found', { status: 404 })
  }

  // Fetch business config
  const { data: config } = await supabase
    .from('business_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  // Fetch client details if client_id exists
  let client: { name: string; email?: string; phone?: string } | undefined
  if (quote.client_id) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', quote.client_id)
      .single()

    if (clientData) {
      client = {
        name: clientData.name,
        email: clientData.email || undefined,
        phone: clientData.phone || undefined,
      }
    }
  }

  // Build props
  const props = {
    quoteNumber: quote.quote_number,
    date: quote.created_at
      ? new Date(quote.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '--',
    validUntil: quote.valid_until
      ? new Date(quote.valid_until).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '--',
    business: {
      name: config?.business_name || 'Business',
      phone: config?.phone || undefined,
      email: config?.email || undefined,
      website: config?.website || undefined,
      address: config?.address || undefined,
    },
    client,
    lineItems: (quote.line_items as any[]) || [],
    subtotalCents: quote.subtotal_cents || 0,
    taxCents: quote.tax_cents || 0,
    taxRate: quote.tax_rate || config?.default_tax_rate || 0,
    totalCents: quote.total_cents || 0,
    notes: quote.notes || undefined,
  }

  // Render PDF
  const buffer = await renderToBuffer(<QuotePDF {...props} />)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.quote_number}.pdf"`,
    },
  })
}
