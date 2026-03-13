import { ChannelAdapter, NormalizedMessage } from '../types'

interface WebChatInput {
  message: string
  conversationId?: string
  sessionId?: string
  tenantId: string
}

export class WebChatAdapter implements ChannelAdapter {
  async normalize(rawInput: unknown, tenantId: string): Promise<NormalizedMessage> {
    const input = rawInput as WebChatInput
    return {
      tenantId,
      conversationId: input.conversationId || '',
      clientId: null,
      channel: 'web_chat',
      content: input.message,
      channelMessageId: undefined,
      metadata: {
        sessionId: input.sessionId,
      },
    }
  }
}
