import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { listEmailMessages } from '@/lib/nylas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25')
    const unread = searchParams.get('unread')
    const folder = searchParams.get('folder')

    const result = await listEmailMessages(config.nylas_grant_id, {
      limit,
      unread: unread === 'true' ? true : unread === 'false' ? false : undefined,
      in: folder || undefined,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list emails' }, { status: 500 })
  }
}
