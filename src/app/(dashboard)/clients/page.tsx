import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Phone, Mail, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default async function ClientsPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*, channel_identities(channel, identifier)')
    .eq('tenant_id', tenantId)
    .order('last_seen_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clients</h1>

      {(!clients || clients.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No clients yet</p>
          <p className="text-sm text-gray-400 mt-1">Clients are created automatically when they contact you</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {clients.map((client: any) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {(client.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {client.name || 'Anonymous'}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {client.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" /> {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" /> {client.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-1">
                  {(client.channel_identities || []).map((ci: any, i: number) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {ci.channel.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(client.last_seen_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
