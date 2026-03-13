export interface NormalizedMessage {
  tenantId: string
  conversationId: string
  clientId: string | null
  channel: 'web_chat' | 'voice' | 'sms' | 'whatsapp' | 'email'
  content: string
  channelMessageId?: string
  metadata: Record<string, unknown>
}

export interface ChannelResponse {
  content: string
  metadata?: Record<string, unknown>
}

export interface ChannelAdapter {
  normalize(rawInput: unknown, tenantId: string): Promise<NormalizedMessage>
}

export interface ChannelResponder {
  send(conversationId: string, response: ChannelResponse): Promise<void>
}
