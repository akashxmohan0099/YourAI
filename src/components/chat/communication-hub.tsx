'use client'

import { useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { ChatWidget } from './chat-widget'
import { VoiceWidget } from './voice-widget'
import { cn } from '@/lib/utils'

interface CommunicationHubProps {
  tenantSlug: string
  tenantId: string
  businessName: string
  voiceEnabled: boolean
  assistantId?: string
  embedded?: boolean
}

export function CommunicationHub({
  tenantSlug,
  tenantId,
  businessName,
  voiceEnabled,
  assistantId,
  embedded = false,
}: CommunicationHubProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat')
  const showVoice = voiceEnabled && !!assistantId

  // If voice is not available, just render the chat widget directly
  if (!showVoice) {
    return <ChatWidget tenantSlug={tenantSlug} businessName={businessName} embedded={embedded} />
  }

  if (embedded) {
    return (
      <div className="flex flex-col h-screen">
        {/* Tab bar */}
        <div className="flex bg-[var(--surface)] border-b border-[var(--line)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === 'chat'
                ? 'text-[var(--ink)] border-b-2 border-[var(--ink)] bg-[var(--surface-muted)]/50'
                : 'text-[var(--ink-faint)] hover:text-[var(--ink-soft)] hover:bg-[var(--surface-ghost)]'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === 'call'
                ? 'text-[var(--ink)] border-b-2 border-[var(--ink)] bg-[var(--surface-muted)]/50'
                : 'text-[var(--ink-faint)] hover:text-[var(--ink-soft)] hover:bg-[var(--surface-ghost)]'
            )}
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === 'chat' ? (
            <ChatWidget tenantSlug={tenantSlug} businessName={businessName} embedded />
          ) : (
            <EmbeddedVoicePanel
              tenantId={tenantId}
              assistantId={assistantId}
              businessName={businessName}
            />
          )}
        </div>
      </div>
    )
  }

  // Non-embedded (floating widget) mode:
  // Show chat widget as main + voice button as secondary FAB
  return (
    <>
      <ChatWidget tenantSlug={tenantSlug} businessName={businessName} />
      <VoiceWidget
        tenantId={tenantId}
        assistantId={assistantId}
        businessName={businessName}
      />
    </>
  )
}

/**
 * Embedded voice panel shown when the "Call" tab is selected
 * in full-page embedded mode.
 */
function EmbeddedVoicePanel({
  tenantId,
  assistantId,
  businessName,
}: {
  tenantId: string
  assistantId: string
  businessName: string
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[var(--surface-muted)] p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[var(--surface-muted)] border border-[var(--line)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-7 h-7 text-[var(--ink)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--ink)] mb-1">
          Call {businessName}
        </h3>
        <p className="text-sm text-[var(--ink-faint)] mb-6">
          Start a voice call with our AI assistant. You can ask questions, book
          appointments, and more -- all by voice.
        </p>
        {/* Render the VoiceWidget inline -- it handles its own state */}
        <VoiceWidget
          tenantId={tenantId}
          assistantId={assistantId}
          businessName={businessName}
          embedded
        />
      </div>
    </div>
  )
}
