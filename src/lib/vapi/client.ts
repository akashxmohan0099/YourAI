const VAPI_API_BASE = 'https://api.vapi.ai'

export class VapiClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VAPI_API_KEY || ''
  }

  async getCall(callId: string) {
    const res = await fetch(`${VAPI_API_BASE}/call/${callId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) throw new Error(`Vapi API error: ${res.status}`)
    return res.json()
  }

  async createPhoneCall(options: {
    assistantId: string
    phoneNumberId: string
    customerNumber: string
    firstMessage?: string
  }) {
    const res = await fetch(`${VAPI_API_BASE}/call/phone`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: options.assistantId,
        phoneNumberId: options.phoneNumberId,
        customer: { number: options.customerNumber },
        firstMessage: options.firstMessage,
      }),
    })
    if (!res.ok) throw new Error(`Vapi API error: ${res.status}`)
    return res.json()
  }

  async transferCall(callId: string, destination: { number: string; message?: string }) {
    const res = await fetch(`${VAPI_API_BASE}/call/${callId}/transfer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination }),
    })
    if (!res.ok) throw new Error(`Vapi API error: ${res.status}`)
    return res.json()
  }
}

export function getVapiClient() {
  return new VapiClient()
}
