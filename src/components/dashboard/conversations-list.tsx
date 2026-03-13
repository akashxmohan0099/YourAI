'use client'

import { useEffect, useState, type ElementType } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, Phone, Mail, Smartphone, PhoneCall, FileText } from 'lucide-react'

interface Conversation {
  id: string
  channel: string
  status: string
  subject?: string
  metadata?: Record<string, unknown>
  started_at: string
  updated_at: string
  ended_at?: string
  clients?: { name?: string; email?: string; phone?: string }
}

interface ConversationsListProps {
  conversations: Conversation[]
  tenantId: string
}

const channelIcons: Record<string, ElementType> = {
  web_chat: MessageSquare,
  voice: Phone,
  email: Mail,
  sms: Smartphone,
}

const channelLabels: Record<string, string> = {
  web_chat: 'Web Chat',
  voice: 'Phone Call',
  sms: 'Text',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

const channelBadgeStyles: Record<string, string> = {
  web_chat: 'bg-blue-50 text-blue-700 border border-blue-100',
  voice: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  sms: 'bg-amber-50 text-amber-700 border border-amber-100',
  email: 'bg-purple-50 text-purple-700 border border-purple-100',
  whatsapp: 'bg-green-50 text-green-700 border border-green-100',
}

const channelIconColors: Record<string, string> = {
  web_chat: 'bg-blue-50 text-blue-600',
  voice: 'bg-emerald-50 text-emerald-600',
  email: 'bg-purple-50 text-purple-600',
  sms: 'bg-amber-50 text-amber-600',
}

const filterTabs = [
  { key: 'all', label: 'All', icon: MessageSquare },
  { key: 'voice', label: 'Phone', icon: Phone },
  { key: 'sms', label: 'Text', icon: Smartphone },
  { key: 'web_chat', label: 'Web Chat', icon: MessageSquare },
  { key: 'email', label: 'Email', icon: Mail },
]

export function ConversationsList({
  conversations: initialConversations,
  tenantId,
}: ConversationsListProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeFilter, setActiveFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        async () => {
          const { data } = await supabase
            .from('conversations')
            .select('*, clients(name, email, phone)')
            .eq('tenant_id', tenantId)
            .order('updated_at', { ascending: false })
            .limit(50)
          if (data) setConversations(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, supabase])

  const filtered =
    activeFilter === 'all'
      ? conversations
      : conversations.filter((c) => c.channel === activeFilter)

  const channelCounts = conversations.reduce<Record<string, number>>((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1
    return acc
  }, {})

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm p-12 text-center">
        <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-7 h-7 text-[#86868b]" />
        </div>
        <p className="text-[#424245] font-medium text-base">No conversations yet</p>
        <p className="text-sm text-[#86868b] mt-1">
          They&apos;ll appear here once customers start chatting, calling, or texting
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Channel filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const count = tab.key === 'all' ? conversations.length : (channelCounts[tab.key] || 0)
          const isActive = activeFilter === tab.key
          if (tab.key !== 'all' && count === 0) return null
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-white text-[#424245] border border-[#d2d2d7] hover:bg-[#f5f5f7]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs ${isActive ? 'text-white/70' : 'text-[#86868b]'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Conversations list */}
      <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm divide-y divide-[#f5f5f7]">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[#86868b] text-sm">No conversations in this channel</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const ChannelIcon = channelIcons[conv.channel] || MessageSquare
            const iconColor = channelIconColors[conv.channel] || 'bg-[#f5f5f7] text-[#424245]'
            const badgeStyle = channelBadgeStyles[conv.channel] || 'bg-[#f5f5f7] text-[#424245]'
            const label = channelLabels[conv.channel] || conv.channel
            const metadata = conv.metadata || {}
            const hasSummary = conv.channel === 'voice' && !!metadata.summary
            const duration = metadata.durationSeconds as number | undefined

            return (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#f5f5f7] transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${iconColor}`}>
                  <ChannelIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="text-sm font-semibold text-[#1d1d1f]">
                      {conv.clients?.name || 'Anonymous'}
                    </p>
                    {/* Channel badge */}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyle}`}>
                      {label}
                    </span>
                    {/* Status badge */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        conv.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : conv.status === 'escalated'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-[#f5f5f7] text-[#424245]'
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-[#86868b]">
                      {formatRelativeTime(conv.updated_at)}
                    </p>
                    {conv.channel === 'voice' && duration && (
                      <span className="text-xs text-[#86868b]">
                        · {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} call
                      </span>
                    )}
                    {hasSummary && (
                      <span className="flex items-center gap-1 text-xs text-[#86868b]">
                        · <FileText className="w-3 h-3" /> Summary
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
