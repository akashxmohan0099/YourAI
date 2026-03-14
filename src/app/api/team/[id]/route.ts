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

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.name !== undefined) updates.name = body.name
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.email !== undefined) updates.email = body.email

  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select('id, name, phone, email, availability')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId } = await requireTenant()
  const { id } = await params
  const supabase = createAdminClient()

  await supabase
    .from('team_members')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId)

  return NextResponse.json({ success: true })
}
