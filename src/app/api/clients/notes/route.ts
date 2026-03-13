import { createClient } from '@/lib/supabase/server'
import { requireTenant } from '@/lib/auth/guards'

export async function POST(request: Request) {
  try {
    const { tenantId } = await requireTenant()
    const supabase = await createClient()
    const { clientId, note } = await request.json()

    if (!clientId || !note) {
      return new Response('Missing clientId or note', { status: 400 })
    }

    const { error } = await supabase.from('client_notes').insert({
      tenant_id: tenantId,
      client_id: clientId,
      note,
      source: 'manual',
    })

    if (error) {
      return new Response(error.message, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return new Response('Internal error', { status: 500 })
  }
}
