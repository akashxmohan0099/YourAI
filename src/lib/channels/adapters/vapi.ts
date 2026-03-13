import { ChannelAdapter, NormalizedMessage } from '../types'

export interface VapiMessage {
  type: string
  call?: {
    id: string
    customer?: {
      number?: string
    }
    phoneNumberId?: string
  }
  message?: {
    role: string
    content: string
  }
  transcript?: string
}

export class VapiAdapter implements ChannelAdapter {
  async normalize(rawInput: unknown, tenantId: string): Promise<NormalizedMessage> {
    const input = rawInput as VapiMessage

    const content = input.message?.content
      || input.transcript
      || ''

    return {
      tenantId,
      conversationId: input.call?.id || '',
      clientId: null,
      channel: 'voice',
      content,
      channelMessageId: input.call?.id,
      metadata: {
        callId: input.call?.id,
        customerPhone: input.call?.customer?.number,
        phoneNumberId: input.call?.phoneNumberId,
        messageType: input.type,
      },
    }
  }
}
