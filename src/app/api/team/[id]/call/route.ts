import { requireTenant } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildVapiServerFields } from '@/lib/vapi/server-auth'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { tenantId } = await requireTenant()
  const { id } = await params
  const supabase = createAdminClient()

  // Get team member
  const { data: member } = await supabase
    .from('team_members')
    .select('id, name, phone')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .single()

  if (!member) return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  if (!member.phone) return NextResponse.json({ error: 'No phone number set' }, { status: 400 })

  // Normalise Australian numbers to E.164 (e.g. 0466931772 → +61466931772)
  let phoneNumber = member.phone.replace(/\s+/g, '')
  if (phoneNumber.startsWith('0') && !phoneNumber.startsWith('+')) {
    phoneNumber = `+61${phoneNumber.slice(1)}`
  } else if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+${phoneNumber}`
  }

  // Get Vapi config
  const { data: config } = await supabase
    .from('business_config')
    .select('business_name, vapi_phone_number_id, voice_enabled')
    .eq('tenant_id', tenantId)
    .single()

  if (!config?.voice_enabled || !config?.vapi_phone_number_id) {
    return NextResponse.json({ error: 'Voice not configured. Enable voice in Your AI → Channels.' }, { status: 400 })
  }

  // Calculate the upcoming week (next Monday → Sunday, or this week if today is Mon)
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntilMonday)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const weekStart = weekDates[0]
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dateList = weekDates.map((d, i) => `${dayNames[i]} ${d}`).join(', ')

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
  const serverFields = buildVapiServerFields(`${appUrl}/api/voice/respond`)

  // Create outbound call with inline assistant
  const vapiRes = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumberId: config.vapi_phone_number_id,
      customer: { number: phoneNumber },
      assistant: {
        name: 'Availability Checker',
        firstMessage: `Hi ${member.name}! This is the AI assistant from ${config.business_name}. I'm calling to check your availability for the week starting ${weekStart}. What days and times can you work?`,
        model: {
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          messages: [
            {
              role: 'system',
              content: `You are calling ${member.name} to check their work availability for the upcoming week.

The dates are: ${dateList}

Your job:
1. Ask what days and times they can work this week
2. Go through each day if needed — but be conversational, not robotic
3. Confirm the full schedule back to them before ending the call
4. Keep it brief and friendly

CONVERSATION RULES:
- Ask one question at a time
- Keep responses short (1-2 sentences)
- Use natural language — "What about Thursday?" not "Please state your availability for Thursday"
- If they give a range like "Monday to Wednesday, 9 to 5", accept that — don't ask each day separately
- Confirm the full week at the end: "So just to confirm — Mon-Wed 9-5, Thu off, Fri 9-3, Sat-Sun off. Is that right?"

This is a phone call. Be natural and concise.`,
            },
          ],
        },
        voice: { provider: 'vapi', voiceId: 'Elliot' },
        ...serverFields,
        transcriber: { provider: 'deepgram', model: 'nova-3', language: 'en' },
      },
      metadata: {
        type: 'availability_check',
        teamMemberId: id,
        tenantId,
        weekStart,
        weekDates,
      },
    }),
  })

  if (!vapiRes.ok) {
    const errText = await vapiRes.text()
    console.error('Vapi availability call error:', vapiRes.status, errText)
    return NextResponse.json({ error: `Failed to initiate call: ${errText}` }, { status: 500 })
  }

  const call = await vapiRes.json()
  return NextResponse.json({ callId: call.id, status: 'calling' })
  } catch (err) {
    console.error('Team call error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
