import { SupabaseClient } from '@supabase/supabase-js'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/nylas/client'

export async function syncAppointmentToCalendar(
  supabase: SupabaseClient,
  tenantId: string,
  appointmentId: string
) {
  // Get tenant's Nylas config
  const { data: config } = await supabase
    .from('business_config')
    .select('nylas_grant_id, nylas_calendar_id')
    .eq('tenant_id', tenantId)
    .single()

  if (!config?.nylas_grant_id || !config?.nylas_calendar_id) {
    return // Calendar sync not configured
  }

  // Get appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, clients(name, email)')
    .eq('id', appointmentId)
    .single()

  if (!appointment) return

  const participants = appointment.clients?.email
    ? [{ email: appointment.clients.email, name: appointment.clients.name }]
    : undefined

  try {
    if (appointment.nylas_event_id) {
      // Update existing event
      if (appointment.status === 'cancelled') {
        await deleteCalendarEvent(
          config.nylas_grant_id,
          config.nylas_calendar_id,
          appointment.nylas_event_id
        )
        await supabase
          .from('appointments')
          .update({ nylas_event_id: null })
          .eq('id', appointmentId)
      } else {
        await updateCalendarEvent(
          config.nylas_grant_id,
          config.nylas_calendar_id,
          appointment.nylas_event_id,
          {
            title: appointment.title,
            startTime: new Date(appointment.starts_at),
            endTime: new Date(appointment.ends_at),
            description: appointment.notes || undefined,
          }
        )
      }
    } else if (appointment.status !== 'cancelled') {
      // Create new event
      const result = await createCalendarEvent(
        config.nylas_grant_id,
        config.nylas_calendar_id,
        {
          title: appointment.title,
          startTime: new Date(appointment.starts_at),
          endTime: new Date(appointment.ends_at),
          description: appointment.notes || undefined,
          participants,
        }
      )

      // Store Nylas event ID
      if (result?.data?.id) {
        await supabase
          .from('appointments')
          .update({ nylas_event_id: result.data.id })
          .eq('id', appointmentId)
      }
    }
  } catch (error) {
    console.error('Calendar sync error:', error)
  }
}

export async function handleNylasCalendarWebhook(
  supabase: SupabaseClient,
  payload: any
) {
  // Handle calendar events synced from external calendar
  const { type, data } = payload

  if (type === 'event.created' || type === 'event.updated') {
    const event = data.object
    const grantId = data.grant_id

    // Find tenant by grant ID
    const { data: config } = await supabase
      .from('business_config')
      .select('tenant_id')
      .eq('nylas_grant_id', grantId)
      .single()

    if (!config) return

    // Check if we already have this event
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('nylas_event_id', event.id)
      .single()

    if (existing) {
      // Update existing appointment
      await supabase
        .from('appointments')
        .update({
          title: event.title,
          starts_at: new Date(event.when.start_time * 1000).toISOString(),
          ends_at: new Date(event.when.end_time * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      // Create new appointment from external calendar
      await supabase.from('appointments').insert({
        tenant_id: config.tenant_id,
        title: event.title || 'External Event',
        starts_at: new Date(event.when.start_time * 1000).toISOString(),
        ends_at: new Date(event.when.end_time * 1000).toISOString(),
        source: 'calendar_sync',
        nylas_event_id: event.id,
        notes: event.description || null,
      })
    }
  }

  if (type === 'event.deleted') {
    const event = data.object
    await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('nylas_event_id', event.id)
  }
}
