'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  Calendar,
  CalendarDays,
  MessageCircle,
  Newspaper,
  Save,
  UserPlus,
} from 'lucide-react'

interface BriefingRow {
  id: string
  briefing_date: string
  delivered_via?: string[] | null
  content?: {
    text?: string
    data?: {
      appointments?: unknown[]
      overnightConversations?: unknown[]
      pendingApprovals?: unknown[]
      newClients?: unknown[]
    }
  } | null
}

interface YourAiBriefingsTabProps {
  tenantId: string
  config: any
  briefings: BriefingRow[]
}

export function YourAiBriefingsTab({ tenantId, config, briefings }: YourAiBriefingsTabProps) {
  const supabase = createClient()

  const [briefingEnabled, setBriefingEnabled] = useState(config?.briefing_enabled || false)
  const [briefingTime, setBriefingTime] = useState(config?.briefing_time || '07:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    await supabase
      .from('business_config')
      .update({
        briefing_enabled: briefingEnabled,
        briefing_time: briefingTime,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="dashboard-stack">
      {/* Settings */}
      <div className="panel rounded-[32px] px-6 py-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">Daily Briefings</h2>
          <p className="text-sm text-[var(--ink-faint)] mt-0.5">
            Get an AI-generated morning update with your schedule, new conversations, and pending items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={briefingEnabled}
              onChange={(e) => setBriefingEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--line)] peer-focus:ring-2 peer-focus:ring-[var(--teal)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teal)]"></div>
          </label>
          <span className="text-sm text-[var(--ink-soft)] font-medium">Enable daily briefings</span>
        </div>

        {briefingEnabled && (
          <div>
            <label className="field-label">Briefing Time (your local time)</label>
            <input
              type="time"
              value={briefingTime}
              onChange={(e) => setBriefingTime(e.target.value)}
              className="field-input text-sm w-44"
            />
            <p className="field-note">When you want to receive your daily update.</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Briefing Settings'}
          </button>
          {saved && <span className="text-sm font-medium text-[var(--success)]">Saved</span>}
        </div>
      </div>

      {/* Briefing history */}
      {briefings.length === 0 ? (
        <div className="panel rounded-[32px]">
          <div className="dashboard-empty">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(43,114,107,0.12)]">
              <Newspaper className="h-7 w-7 text-[var(--teal)]" />
            </div>
            <p className="mt-5 text-lg font-semibold text-[var(--ink)]">No briefings yet</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Enable daily briefings above to receive AI-generated updates.
            </p>
          </div>
        </div>
      ) : (
        <div className="dashboard-stack">
          {briefings.map((briefing) => {
            const deliveredVia = briefing.delivered_via || []
            return (
              <div key={briefing.id} className="panel rounded-[32px] px-6 py-6">
                <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55">
                      <Calendar className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      {new Date(briefing.briefing_date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {deliveredVia.length > 0 ? (
                    <span className="chip">via {deliveredVia.join(', ')}</span>
                  ) : null}
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-[var(--ink-soft)]">
                  {briefing.content?.text || JSON.stringify(briefing.content)}
                </p>
                {briefing.content?.data ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Appointments', value: briefing.content.data.appointments?.length || 0, icon: CalendarDays },
                      { label: 'Conversations', value: briefing.content.data.overnightConversations?.length || 0, icon: MessageCircle },
                      { label: 'Approvals', value: briefing.content.data.pendingApprovals?.length || 0, icon: Bell },
                      { label: 'New leads', value: briefing.content.data.newClients?.length || 0, icon: UserPlus },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[24px] bg-white/45 px-4 py-4 text-center">
                        <item.icon className="mx-auto h-4 w-4 text-[var(--ink-faint)]" />
                        <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-faint)]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
