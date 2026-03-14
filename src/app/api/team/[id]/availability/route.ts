import { requireTenant } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId } = await requireTenant()
  const { id } = await params
  const supabase = createAdminClient()
  const body = await request.json()

  // Merge new availability into existing
  const { data: member } = await supabase
    .from('team_members')
    .select('availability')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const merged = { ...((member.availability as Record<string, unknown>) || {}), ...body.availability }

  const { error } = await supabase
    .from('team_members')
    .update({ availability: merged, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
