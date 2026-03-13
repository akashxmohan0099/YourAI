import { ChannelAdapter, NormalizedMessage } from '../types'

export interface TwilioSmsInput {
  From: string
  To: string
  Body: string
  MessageSid: string
  AccountSid: string
  NumMedia?: string
  MediaUrl0?: string
}

export class TwilioSmsAdapter implements ChannelAdapter {
  async normalize(rawInput: unknown, tenantId: string): Promise<NormalizedMessage> {
    const input = rawInput as TwilioSmsInput

    return {
      tenantId,
      conversationId: '',
      clientId: null,
      channel: 'sms',
      content: input.Body,
      channelMessageId: input.MessageSid,
      metadata: {
        from: input.From,
        to: input.To,
        messageSid: input.MessageSid,
        hasMedia: parseInt(input.NumMedia || '0') > 0,
        mediaUrl: input.MediaUrl0,
      },
    }
  }
}
