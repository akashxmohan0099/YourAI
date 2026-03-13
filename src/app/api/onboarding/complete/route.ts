import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated and owns this tenant
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId } = await request.json()

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    // Verify ownership
    const { data: profile } = await userSupabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('auth_user_id', user.id)
      .eq('tenant_id', tenantId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('tenants')
      .update({ status: 'active' })
      .eq('id', tenantId)

    if (error) throw error

    // Insert default business rules
    await supabase.from('business_rules').insert([
      {
        tenant_id: tenantId,
        rule_type: 'hard_boundary',
        category: 'pricing',
        rule: 'Never offer discounts or free services without owner approval',
        tool_scope: ['getPricing', 'getServices'],
      },
      {
        tenant_id: tenantId,
        rule_type: 'soft_guideline',
        category: 'communication',
        rule: 'If a customer seems upset or dissatisfied, offer to connect them with the owner',
        tool_scope: [],
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding complete error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
