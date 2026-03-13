import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Plus, Clock } from 'lucide-react'
import { ScheduleView } from '@/components/dashboard/schedule-view'

export default async function SchedulePage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, clients(name, email, phone), services(name, duration_minutes, price_cents)')
    .eq('tenant_id', tenantId)
    .gte('starts_at', weekStart.toISOString())
    .lte('starts_at', weekEnd.toISOString())
    .order('starts_at')

  const todayStr = today.toISOString().split('T')[0]
  const todayAppointments = (appointments || []).filter((a: any) =>
    a.starts_at.startsWith(todayStr) && a.status !== 'cancelled'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500">
            {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Today</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {todayAppointments.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No appointments today</p>
            </div>
          ) : (
            todayAppointments.map((apt: any) => (
              <div key={apt.id} className="px-5 py-3 flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-semibold text-blue-600">
                    {new Date(apt.starts_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(apt.ends_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {apt.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {apt.clients?.name || 'No client'}
                    {apt.services?.name ? ` · ${apt.services.name}` : ''}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    apt.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : apt.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Week view */}
      <ScheduleView initialAppointments={appointments || []} />
    </div>
  )
}
