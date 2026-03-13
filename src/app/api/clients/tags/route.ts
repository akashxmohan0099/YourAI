import { createClient } from '@/lib/supabase/server'
import { requireTenant } from '@/lib/auth/guards'

export async function POST(request: Request) {
  try {
    const { tenantId } = await requireTenant()
    const supabase = await createClient()
    const { clientId, tag } = await request.json()

    if (!clientId || !tag) {
      return new Response('Missing clientId or tag', { status: 400 })
    }

    const { error } = await supabase.from('client_tags').upsert(
      {
        tenant_id: tenantId,
        client_id: clientId,
        tag: tag.toLowerCase(),
      },
      { onConflict: 'client_id,tag' }
    )

    if (error) {
      return new Response(error.message, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return new Response('Internal error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { tenantId } = await requireTenant()
    const supabase = await createClient()
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new Response('Missing tag id', { status: 400 })
    }

    const { error } = await supabase
      .from('client_tags')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      return new Response(error.message, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return new Response('Internal error', { status: 500 })
  }
}
