import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { getEmailMessage } from '@/lib/nylas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

    const result = await getEmailMessage(config.nylas_grant_id, id)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get email' }, { status: 500 })
  }
}
