import { NormalizedMessage, ChannelAdapter } from './types'
import { WebChatAdapter } from './adapters/web-chat'
import { VapiAdapter } from './adapters/vapi'
import { TwilioSmsAdapter } from './adapters/twilio-sms'
import { resolveClient } from '../clients/resolver'
import { createAdminClient } from '../supabase/admin'

const adapters: Record<string, ChannelAdapter> = {
  web_chat: new WebChatAdapter(),
  voice: new VapiAdapter(),
  sms: new TwilioSmsAdapter(),
}

export async function normalizeIncomingMessage(
  channel: string,
  rawInput: unknown,
  tenantId: string
): Promise<NormalizedMessage> {
  const adapter = adapters[channel]
  if (!adapter) {
    throw new Error(`Unsupported channel: ${channel}`)
  }

  const normalized = await adapter.normalize(rawInput, tenantId)

  // Resolve client identity
  const supabase = createAdminClient()
  const identifier = getIdentifierFromMessage(normalized)

  if (identifier) {
    const client = await resolveClient(supabase, {
      tenantId,
      channel: normalized.channel,
      identifier,
      metadata: normalized.metadata,
    })
    normalized.clientId = client.id
  }

  // Ensure conversation exists
  if (!normalized.conversationId) {
    const { data: conv } = await supabase
      .from('conversations')
      .insert({
        tenant_id: tenantId,
        client_id: normalized.clientId,
        channel: normalized.channel,
        status: 'active',
      })
      .select('id')
      .single()

    normalized.conversationId = conv?.id || ''
  }

  return normalized
}

function getIdentifierFromMessage(msg: NormalizedMessage): string | null {
  switch (msg.channel) {
    case 'voice':
      return (msg.metadata.customerPhone as string) || null
    case 'sms':
      return (msg.metadata.from as string) || null
    case 'web_chat':
      return (msg.metadata.sessionId as string) || null
    default:
      return null
  }
}

export async function resolveTenantFromChannel(
  channel: string,
  rawInput: unknown
): Promise<string | null> {
  const supabase = createAdminClient()

  if (channel === 'voice') {
    const input = rawInput as { call?: { phoneNumberId?: string } }
    if (input.call?.phoneNumberId) {
      const { data } = await supabase
        .from('business_config')
        .select('tenant_id')
        .eq('vapi_phone_number_id', input.call.phoneNumberId)
        .single()
      return data?.tenant_id || null
    }
  }

  if (channel === 'sms') {
    const input = rawInput as { To?: string }
    if (input.To) {
      const { data } = await supabase
        .from('business_config')
        .select('tenant_id')
        .eq('twilio_phone_number', input.To)
        .single()
      return data?.tenant_id || null
    }
  }

  return null
}
