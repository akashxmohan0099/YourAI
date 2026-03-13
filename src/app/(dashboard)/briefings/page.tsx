import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { Newspaper, Calendar } from 'lucide-react'

export default async function BriefingsPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: briefings } = await supabase
    .from('briefings')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('briefing_date', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daily Briefings</h1>
        <p className="text-gray-500">Your AI-generated morning updates</p>
      </div>

      {!briefings || briefings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
          <Newspaper className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">No briefings yet</p>
          <p className="text-sm text-gray-400">
            Enable daily briefings in Settings to get AI-generated morning updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {briefings.map((briefing: any) => (
            <div
              key={briefing.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date(briefing.briefing_date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {briefing.delivered_via?.length > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    via {briefing.delivered_via.join(', ')}
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {briefing.content?.text || JSON.stringify(briefing.content)}
                </p>
                {briefing.content?.data && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-semibold text-blue-700">
                        {briefing.content.data.appointments?.length || 0}
                      </p>
                      <p className="text-xs text-blue-500">Appointments</p>
                    </div>
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-semibold text-green-700">
                        {briefing.content.data.overnightConversations?.length || 0}
                      </p>
                      <p className="text-xs text-green-500">Conversations</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-semibold text-orange-700">
                        {briefing.content.data.pendingApprovals?.length || 0}
                      </p>
                      <p className="text-xs text-orange-500">Approvals</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-semibold text-purple-700">
                        {briefing.content.data.newClients?.length || 0}
                      </p>
                      <p className="text-xs text-purple-500">New Leads</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
