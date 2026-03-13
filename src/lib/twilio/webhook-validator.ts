import { validateTwilioSignature } from './client'

export async function validateTwilioWebhook(
  request: Request,
  body: Record<string, string>
): Promise<boolean> {
  const signature = request.headers.get('x-twilio-signature')
  if (!signature) return false

  return validateTwilioSignature(request.url, body, signature)
}
