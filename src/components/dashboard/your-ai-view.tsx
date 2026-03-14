'use client'

import { useState } from 'react'
import { TabSwitcher } from './tab-switcher'
import { YourAiBusinessTab } from './your-ai-business-tab'
import { YourAiPersonalityTab } from './your-ai-personality-tab'
import { YourAiChannelsTab } from './your-ai-channels-tab'
import { YourAiBriefingsTab } from './your-ai-briefings-tab'
import { Globe, Mail, MessageSquare, Phone } from 'lucide-react'

interface YourAiViewProps {
  tenantId: string
  tenantSlug: string
  config: any
  services: any[]
  briefings: any[]
}

const tabs = [
  { key: 'business', label: 'Business Profile' },
  { key: 'personality', label: 'AI Personality' },
  { key: 'channels', label: 'Channels' },
  { key: 'briefings', label: 'Briefings' },
]

export function YourAiView({ tenantId, tenantSlug, config, services, briefings }: YourAiViewProps) {
  const [activeTab, setActiveTab] = useState('business')

  const webChatActive = true
  const voiceActive = config?.voice_enabled && config?.vapi_assistant_id
  const smsActive = config?.sms_enabled && config?.twilio_phone_number
  const emailConnected = !!config?.nylas_grant_id

  return (
    <div className="dashboard-stack">
      {/* Channel status header */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2 text-sm">
          <Globe className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
          <span className="text-[var(--ink-soft)]">Web Chat</span>
          <span className="h-2 w-2 rounded-full bg-[var(--teal)]" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2 text-sm">
          <Phone className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
          <span className="text-[var(--ink-soft)]">Voice</span>
          <span className={`h-2 w-2 rounded-full ${voiceActive ? 'bg-[var(--teal)]' : 'bg-[var(--ink-faint)]'}`} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2 text-sm">
          <MessageSquare className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
          <span className="text-[var(--ink-soft)]">SMS</span>
          <span className={`h-2 w-2 rounded-full ${smsActive ? 'bg-[var(--teal)]' : 'bg-[var(--ink-faint)]'}`} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/50 px-4 py-2 text-sm">
          <Mail className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
          <span className="text-[var(--ink-soft)]">Email</span>
          <span className={`h-2 w-2 rounded-full ${emailConnected ? 'bg-[var(--teal)]' : 'bg-[var(--ink-faint)]'}`} />
        </div>
      </div>

      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'business' && (
        <YourAiBusinessTab tenantId={tenantId} config={config} services={services} />
      )}
      {activeTab === 'personality' && (
        <YourAiPersonalityTab tenantId={tenantId} config={config} />
      )}
      {activeTab === 'channels' && (
        <YourAiChannelsTab tenantId={tenantId} tenantSlug={tenantSlug} config={config} />
      )}
      {activeTab === 'briefings' && (
        <YourAiBriefingsTab tenantId={tenantId} config={config} briefings={briefings} />
      )}
    </div>
  )
}
