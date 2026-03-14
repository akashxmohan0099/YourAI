import { requireTenant } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const { tenantId } = await requireTenant()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, phone, email, availability')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { tenantId } = await requireTenant()
  const supabase = createAdminClient()
  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      tenant_id: tenantId,
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
    })
    .select('id, name, phone, email, availability')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
