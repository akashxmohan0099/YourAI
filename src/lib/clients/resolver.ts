import { SupabaseClient } from '@supabase/supabase-js'

interface ResolveClientOptions {
  tenantId: string
  channel: string
  identifier: string
  metadata?: Record<string, unknown>
}

interface ResolvedClient {
  id: string
  name: string | null
  isNew: boolean
}

export async function resolveClient(
  supabase: SupabaseClient,
  options: ResolveClientOptions
): Promise<ResolvedClient> {
  const { tenantId, channel, identifier, metadata } = options

  // Look up existing channel identity
  const { data: existing } = await supabase
    .from('channel_identities')
    .select('client_id, clients(id, name)')
    .eq('tenant_id', tenantId)
    .eq('channel', channel)
    .eq('identifier', identifier)
    .single()

  if (existing?.client_id) {
    // Update last_seen
    await supabase
      .from('clients')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existing.client_id)

    return {
      id: existing.client_id,
      name: (existing.clients as any)?.name || null,
      isNew: false,
    }
  }

  // Check if we can match by phone across channels
  const phone = extractPhone(channel, identifier, metadata)
  if (phone) {
    const { data: phoneMatch } = await supabase
      .from('clients')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .single()

    if (phoneMatch) {
      // Link this channel identity to existing client
      await supabase.from('channel_identities').insert({
        client_id: phoneMatch.id,
        tenant_id: tenantId,
        channel,
        identifier,
        metadata: metadata || {},
      })

      await supabase
        .from('clients')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', phoneMatch.id)

      return {
        id: phoneMatch.id,
        name: phoneMatch.name,
        isNew: false,
      }
    }
  }

  // Create new client
  const clientData: Record<string, unknown> = {
    tenant_id: tenantId,
    source_channel: channel,
    last_seen_at: new Date().toISOString(),
  }

  if (phone) clientData.phone = phone

  const { data: newClient } = await supabase
    .from('clients')
    .insert(clientData)
    .select('id')
    .single()

  const clientId = newClient!.id

  // Create channel identity
  await supabase.from('channel_identities').insert({
    client_id: clientId,
    tenant_id: tenantId,
    channel,
    identifier,
    metadata: metadata || {},
  })

  return {
    id: clientId,
    name: null,
    isNew: true,
  }
}

function extractPhone(
  channel: string,
  identifier: string,
  metadata?: Record<string, unknown>
): string | null {
  if (channel === 'sms') return identifier
  if (channel === 'voice') return (metadata?.customerPhone as string) || identifier
  return null
}
