'use client'

import { useEffect, useState, useRef, type ElementType } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Bot,
  User,
  MessageSquare,
  Phone,
  Mail,
  Smartphone,
  Clock,
  FileText,
  Play,
  PhoneCall,
  PhoneOff,
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: string
  content: string
  created_at: string
  metadata?: Record<string, unknown>
}

interface ConversationDetailProps {
  conversation: any
  initialMessages: Message[]
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
  sms: 'Text Message',
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export function ConversationDetail({
  conversation,
  initialMessages,
  tenantId,
}: ConversationDetailProps) {
  const [messages, setMessages] = useState(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ChannelIcon = channelIcons[conversation.channel] || MessageSquare
  const channelLabel = channelLabels[conversation.channel] || conversation.channel
  const badgeStyle = channelBadgeStyles[conversation.channel] || 'bg-[#f5f5f7] text-[#424245]'
  const metadata = conversation.metadata || {}
  const isVoice = conversation.channel === 'voice'
  const callSummary = metadata.summary as string | undefined
  const callTranscript = metadata.transcript as string | undefined
  const recordingUrl = metadata.recordingUrl as string | undefined
  const durationSeconds = metadata.durationSeconds as number | undefined
  const endedReason = metadata.endedReason as string | undefined
  const callerNumber = metadata.callerNumber as string | undefined

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/conversations"
            className="p-2.5 hover:bg-[#d2d2d7] bg-white border border-[#d2d2d7] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#424245]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#1d1d1f]">
              {conversation.clients?.name || 'Anonymous'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              {/* Channel badge */}
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badgeStyle}`}>
                <ChannelIcon className="w-3.5 h-3.5" />
                {channelLabel}
              </span>
              {/* Status badge */}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  conversation.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : conversation.status === 'escalated'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-[#f5f5f7] text-[#424245]'
                }`}
              >
                {conversation.status}
              </span>
              {/* Duration for voice calls */}
              {isVoice && durationSeconds && (
                <span className="flex items-center gap-1 text-xs text-[#86868b]">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(durationSeconds)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Voice call summary banner */}
        {isVoice && callSummary && (
          <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl flex-shrink-0">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">Call Summary</h3>
                <p className="text-sm text-[#424245] leading-relaxed">{callSummary}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages / Transcript */}
          <div className="lg:col-span-3 space-y-6">
            {/* Live messages */}
            <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm p-6 space-y-5 max-h-[600px] overflow-y-auto">
              {messages.length === 0 && !callTranscript && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-[#86868b]" />
                  </div>
                  <p className="text-[#424245] font-medium">No messages yet</p>
                </div>
              )}
              {messages.map((msg) => {
                const isCustomer = msg.role === 'user'
                const msgChannel = (msg.metadata?.channel as string) || conversation.channel
                const isVoiceMsg = msgChannel === 'voice'
                return (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f5f5f7]">
                      {isCustomer ? (
                        <User className="w-4 h-4 text-[#424245]" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#424245]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1d1d1f]">
                          {isCustomer ? 'Customer' : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-[#86868b]">
                          {formatDateTime(msg.created_at)}
                        </span>
                        {isVoiceMsg && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Phone className="w-3 h-3" />
                            voice
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#424245] mt-1 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Full call transcript (from end-of-call report) */}
            {isVoice && callTranscript && (
              <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm">
                <div className="px-6 py-4 border-b border-[#d2d2d7] flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">Full Call Transcript</h3>
                </div>
                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
                  {callTranscript.split('\n').map((line, i) => {
                    const isAI = line.startsWith('AI:')
                    const speaker = isAI ? 'AI' : 'Customer'
                    const text = line.replace(/^(Customer|AI):\s*/, '')
                    if (!text.trim()) return null
                    return (
                      <div key={i} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAI ? 'bg-[#f5f5f7]' : 'bg-[#f5f5f7]'
                        }`}>
                          {isAI ? (
                            <Bot className="w-3.5 h-3.5 text-[#424245]" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-[#424245]" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#86868b]">{speaker}</span>
                          <p className="text-sm text-[#424245] leading-relaxed">{text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar metadata */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Client</p>
                  <p className="text-sm text-[#1d1d1f] mt-0.5">{conversation.clients?.name || 'Anonymous'}</p>
                </div>
                {conversation.clients?.email && (
                  <div>
                    <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Email</p>
                    <p className="text-sm text-[#424245] mt-0.5">{conversation.clients.email}</p>
                  </div>
                )}
                {(conversation.clients?.phone || callerNumber) && (
                  <div>
                    <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Phone</p>
                    <p className="text-sm text-[#424245] mt-0.5">{conversation.clients?.phone || callerNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Channel</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyle}`}>
                    <ChannelIcon className="w-3 h-3" />
                    {channelLabel}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Started</p>
                  <p className="text-sm text-[#424245] mt-0.5">{formatDateTime(conversation.started_at)}</p>
                </div>
                {conversation.ended_at && (
                  <div>
                    <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Ended</p>
                    <p className="text-sm text-[#424245] mt-0.5">{formatDateTime(conversation.ended_at)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Messages</p>
                  <p className="text-sm text-[#424245] mt-0.5">{messages.length}</p>
                </div>
              </div>
            </div>

            {/* Voice-specific details */}
            {isVoice && (
              <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Call Details
                </h3>
                <div className="space-y-3">
                  {durationSeconds && (
                    <div>
                      <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Duration</p>
                      <p className="text-sm text-[#424245] mt-0.5">{formatDuration(durationSeconds)}</p>
                    </div>
                  )}
                  {endedReason && (
                    <div>
                      <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide">Ended</p>
                      <p className="text-sm text-[#424245] mt-0.5 capitalize">{endedReason.replace(/[-_]/g, ' ')}</p>
                    </div>
                  )}
                  {recordingUrl && (
                    <div>
                      <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide mb-1.5">Recording</p>
                      <audio controls className="w-full h-10" src={recordingUrl}>
                        <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0066CC]">
                          Listen to recording
                        </a>
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
