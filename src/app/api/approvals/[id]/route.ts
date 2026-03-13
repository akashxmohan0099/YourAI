import { createClient } from '@/lib/supabase/server'
import { resolveApproval } from '@/lib/approvals/engine'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { decision } = await request.json()

    if (!['approved', 'denied'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await resolveApproval(
      supabase,
      id,
      decision,
      user.id,
      'dashboard'
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Approval not found or already resolved' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approval update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
