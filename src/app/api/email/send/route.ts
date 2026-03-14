import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/nylas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenant()
    const supabase = await createClient()

    const { data: config } = await supabase
      .from('business_config')
      .select('nylas_grant_id')
      .eq('tenant_id', tenantId)
      .single()

    if (!config?.nylas_grant_id) {
      return NextResponse.json({ error: 'Email not connected' }, { status: 400 })
    }

    const body = await request.json()

    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
    }

    const result = await sendEmail(config.nylas_grant_id, {
      to: Array.isArray(body.to) ? body.to : [{ email: body.to }],
      subject: body.subject,
      body: body.body,
      replyToMessageId: body.replyToMessageId,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
