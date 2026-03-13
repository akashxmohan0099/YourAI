import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Send to Inngest for async processing
    await inngest.send({
      name: 'vapi/event',
      data: {
        type: body.message?.type || 'unknown',
        callId: body.message?.call?.id,
        payload: body,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
