import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*, channel_identities(channel, identifier, created_at)')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!client) notFound()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, channel, status, started_at, ended_at')
    .eq('client_id', id)
    .eq('tenant_id', tenantId)
    .order('started_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{client.name || 'Anonymous'}</h1>
          <p className="text-sm text-gray-500">
            First seen {formatRelativeTime(client.first_seen_at)} — Last seen {formatRelativeTime(client.last_seen_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact</h2>
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" /> {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" /> {client.email}
            </div>
          )}
          {!client.phone && !client.email && (
            <p className="text-sm text-gray-400">No contact info</p>
          )}

          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide pt-2">Channels</h3>
          {(client.channel_identities || []).map((ci: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="capitalize text-gray-600">{ci.channel.replace('_', ' ')}</span>
              <span className="text-xs text-gray-400 font-mono">{ci.identifier}</span>
            </div>
          ))}
        </div>

        {/* Conversation history */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Conversations ({conversations?.length || 0})
          </h2>
          {(!conversations || conversations.length === 0) ? (
            <p className="text-sm text-gray-400">No conversations yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 capitalize">
                      {conv.channel.replace('_', ' ')}
                    </span>
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                      conv.status === 'active' ? 'bg-green-100 text-green-700' :
                      conv.status === 'escalated' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(conv.started_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
