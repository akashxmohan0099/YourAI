'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Globe, Mail, MessageSquare, Phone, Save } from 'lucide-react'

interface YourAiChannelsTabProps {
  tenantId: string
  tenantSlug: string
  config: any
}

export function YourAiChannelsTab({ tenantId, tenantSlug, config }: YourAiChannelsTabProps) {
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Nylas
  const [nylasGrantId, setNylasGrantId] = useState(config?.nylas_grant_id || '')
  const [nylasCalendarId, setNylasCalendarId] = useState(config?.nylas_calendar_id || '')
  const [nylasStatus, setNylasStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Voice (Vapi)
  const [vapiAssistantId, setVapiAssistantId] = useState(config?.vapi_assistant_id || '')
  const [vapiOwnerAssistantId, setVapiOwnerAssistantId] = useState(config?.vapi_owner_assistant_id || '')
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState(config?.vapi_phone_number_id || '')
  const [vapiVoiceEnabled, setVapiVoiceEnabled] = useState(config?.voice_enabled || false)
  const [vapiSaving, setVapiSaving] = useState(false)
  const [vapiStatus, setVapiStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [vapiAssistantInfo, setVapiAssistantInfo] = useState<{ name: string; model?: string; voice?: string } | null>(null)

  // SMS (Twilio)
  const [smsPhoneNumber, setSmsPhoneNumber] = useState(config?.twilio_phone_number || '')
  const [smsOwnerPhone, setSmsOwnerPhone] = useState(config?.owner_notification_phone || '')
  const [smsEnabled, setSmsEnabled] = useState(config?.sms_enabled || false)
  const [smsSaving, setSmsSaving] = useState(false)
  const [smsStatus, setSmsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Approval
  const [approvalTimeout, setApprovalTimeout] = useState(config?.approval_timeout_minutes || 30)

  // General save
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/twilio/setup')
      .then((res) => res.json())
      .then((data) => {
        if (data.twilio_phone_number) setSmsPhoneNumber(data.twilio_phone_number)
        if (data.owner_notification_phone) setSmsOwnerPhone(data.owner_notification_phone)
        if (data.sms_enabled !== undefined) setSmsEnabled(data.sms_enabled)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/vapi/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.vapi_assistant_id) setVapiAssistantId(data.vapi_assistant_id)
        if (data.vapi_owner_assistant_id) setVapiOwnerAssistantId(data.vapi_owner_assistant_id)
        if (data.vapi_phone_number_id) setVapiPhoneNumberId(data.vapi_phone_number_id)
        if (data.voice_enabled !== undefined) setVapiVoiceEnabled(data.voice_enabled)
        if (data.assistant) setVapiAssistantInfo(data.assistant)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success) {
      setNylasStatus({ type: 'success', message: success })
      supabase
        .from('business_config')
        .select('nylas_grant_id')
        .eq('tenant_id', tenantId)
        .single()
        .then(({ data }) => {
          if (data?.nylas_grant_id) setNylasGrantId(data.nylas_grant_id)
        })
    } else if (error) {
      setNylasStatus({ type: 'error', message: error })
    }
  }, [searchParams, tenantId, supabase])

  const handleSaveVoice = async () => {
    setVapiSaving(true)
    setVapiStatus(null)
    try {
      const res = await fetch('/api/vapi/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: vapiAssistantId || null,
          ownerAssistantId: vapiOwnerAssistantId || null,
          phoneNumberId: vapiPhoneNumberId || null,
          voiceEnabled: vapiVoiceEnabled,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVapiStatus({ type: 'error', message: data.error || 'Failed to save voice settings' })
      } else {
        setVapiStatus({ type: 'success', message: 'Voice settings saved!' })
        if (data.config) setVapiVoiceEnabled(data.config.voice_enabled)
        const statusRes = await fetch('/api/vapi/status')
        const statusData = await statusRes.json()
        if (statusData.assistant) setVapiAssistantInfo(statusData.assistant)
      }
    } catch {
      setVapiStatus({ type: 'error', message: 'Network error saving voice settings' })
    }
    setVapiSaving(false)
    setTimeout(() => setVapiStatus(null), 4000)
  }

  const handleSaveSms = async () => {
    setSmsSaving(true)
    setSmsStatus(null)
    try {
      const res = await fetch('/api/twilio/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: smsPhoneNumber || null, ownerPhone: smsOwnerPhone || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSmsStatus({ type: 'error', message: data.error || 'Failed to save SMS settings' })
      } else {
        setSmsStatus({ type: 'success', message: 'SMS settings saved!' })
        if (data.config) {
          setSmsEnabled(data.config.sms_enabled)
          if (data.config.twilio_phone_number) setSmsPhoneNumber(data.config.twilio_phone_number)
        }
      }
    } catch {
      setSmsStatus({ type: 'error', message: 'Network error saving SMS settings' })
    }
    setSmsSaving(false)
    setTimeout(() => setSmsStatus(null), 4000)
  }

  const handleSaveNylas = async () => {
    setSaving(true)
    setSaved(false)
    await supabase
      .from('business_config')
      .update({
        nylas_grant_id: nylasGrantId || null,
        nylas_calendar_id: nylasCalendarId || null,
        approval_timeout_minutes: approvalTimeout,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sectionClass = 'panel rounded-[32px] px-6 py-6'
  const inputClass = 'field-input text-sm'
  const labelClass = 'field-label'
  const noteClass = 'field-note'

  const statusBanner = (status: { type: 'success' | 'error'; message: string } | null) =>
    status ? (
      <div className={`px-4 py-3 rounded-xl text-sm ${
        status.type === 'success'
          ? 'bg-[rgba(43,114,107,0.12)] text-[var(--teal)] border border-[rgba(43,114,107,0.2)]'
          : 'bg-[rgba(181,79,64,0.12)] text-[var(--error)] border border-[rgba(181,79,64,0.2)]'
      }`}>
        {status.message}
      </div>
    ) : null

  return (
    <div className="dashboard-stack">
      {/* Web Chat */}
      <div className={sectionClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(43,114,107,0.12)]">
            <Globe className="h-5 w-5 text-[var(--teal)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Web chat</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Always enabled as the baseline customer entry point.</p>
          </div>
          <span className="chip chip-teal"><CheckCircle className="h-4 w-4" /> Active</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 rounded-[22px] border border-[var(--line)] bg-white/55 px-4 py-3 text-sm text-[var(--ink-soft)]">
            {typeof window !== 'undefined' ? window.location.origin : ''}/chat/{tenantSlug}
          </code>
        </div>
      </div>

      {/* Voice (Vapi) */}
      <div className={sectionClass + ' space-y-5'}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(208,109,79,0.12)]">
              <Phone className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">Voice</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Browser voice and phone calls routed through Vapi.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {vapiAssistantId && vapiPhoneNumberId && vapiVoiceEnabled ? (
              <span className="chip chip-teal"><span className="w-2 h-2 rounded-full bg-[var(--teal)]"></span> Connected</span>
            ) : vapiAssistantId ? (
              <span className="chip chip-accent"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Partial</span>
            ) : (
              <span className="chip"><span className="w-2 h-2 rounded-full bg-[var(--ink-faint)]"></span> Not Configured</span>
            )}
          </div>
        </div>

        {statusBanner(vapiStatus)}

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={vapiVoiceEnabled} onChange={(e) => setVapiVoiceEnabled(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-[var(--line)] peer-focus:ring-2 peer-focus:ring-[var(--teal)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teal)]"></div>
          </label>
          <span className="text-sm text-[var(--ink-soft)] font-medium">Enable voice calls</span>
          {vapiAssistantInfo && (
            <span className="text-sm text-[var(--ink-faint)]">Assistant: {vapiAssistantInfo.name}{vapiAssistantInfo.voice ? ` | Voice: ${vapiAssistantInfo.voice}` : ''}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Vapi Assistant ID (Customer)</label>
            <input value={vapiAssistantId} onChange={(e) => setVapiAssistantId(e.target.value)} placeholder="Vapi Assistant ID" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Owner Assistant ID</label>
            <input value={vapiOwnerAssistantId} onChange={(e) => setVapiOwnerAssistantId(e.target.value)} placeholder="Vapi Owner Assistant ID" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Phone Number ID</label>
            <input value={vapiPhoneNumberId} onChange={(e) => setVapiPhoneNumberId(e.target.value)} placeholder="Vapi Phone Number ID" className={`${inputClass} font-mono`} />
          </div>
        </div>

        <button onClick={handleSaveVoice} disabled={vapiSaving} className="btn-primary">
          {vapiSaving ? 'Saving...' : 'Save Voice Settings'}
        </button>
      </div>

      {/* SMS (Twilio) */}
      <div className={sectionClass + ' space-y-5'}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(43,114,107,0.12)]">
              <MessageSquare className="h-5 w-5 text-[var(--teal)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">SMS</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Text messaging and owner notification routing through Twilio.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {smsPhoneNumber && smsEnabled ? (
              <span className="chip chip-teal"><span className="w-2 h-2 rounded-full bg-[var(--teal)]"></span> Active</span>
            ) : smsPhoneNumber ? (
              <span className="chip chip-accent"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Configured (disabled)</span>
            ) : (
              <span className="chip"><span className="w-2 h-2 rounded-full bg-[var(--ink-faint)]"></span> Not Configured</span>
            )}
          </div>
        </div>

        {statusBanner(smsStatus)}

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-[var(--line)] peer-focus:ring-2 peer-focus:ring-[var(--teal)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--teal)]"></div>
          </label>
          <span className="text-sm text-[var(--ink-soft)] font-medium">Enable SMS messaging</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Twilio Phone Number</label>
            <input value={smsPhoneNumber} onChange={(e) => setSmsPhoneNumber(e.target.value)} placeholder="+61..." className={`${inputClass} font-mono`} />
            <p className={noteClass}>Your Twilio phone number in E.164 format.</p>
          </div>
          <div>
            <label className={labelClass}>Owner Notification Phone</label>
            <input value={smsOwnerPhone} onChange={(e) => setSmsOwnerPhone(e.target.value)} placeholder="+61..." className={`${inputClass} font-mono`} />
            <p className={noteClass}>Receives approval requests and alerts via SMS.</p>
          </div>
        </div>

        <button onClick={handleSaveSms} disabled={smsSaving} className="btn-primary">
          {smsSaving ? 'Saving...' : 'Save SMS Settings'}
        </button>
      </div>

      {/* Email (Nylas) */}
      <div className={sectionClass + ' space-y-5'}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(36,28,23,0.08)]">
              <Mail className="h-5 w-5 text-[var(--ink)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">Email (Nylas)</h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Connect your email account to sync calendar and enable email.</p>
            </div>
          </div>
          {nylasGrantId ? (
            <span className="chip chip-teal"><span className="w-2 h-2 rounded-full bg-[var(--teal)]"></span> Connected</span>
          ) : (
            <span className="chip"><span className="w-2 h-2 rounded-full bg-[var(--ink-faint)]"></span> Not Connected</span>
          )}
        </div>

        {statusBanner(nylasStatus)}

        <div>
          {nylasGrantId ? (
            <div className="flex items-center gap-3 flex-wrap">
              <a href="/api/nylas/auth?provider=google" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] underline font-medium">Reconnect with Google</a>
              <a href="/api/nylas/auth?provider=microsoft" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] underline font-medium">Reconnect with Microsoft</a>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <a href="/api/nylas/auth?provider=google" className="btn-primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /></svg>
                Connect Google
              </a>
              <a href="/api/nylas/auth?provider=microsoft" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-white/80 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 2H2v9.4h9.4V2zM22 2h-9.4v9.4H22V2zM11.4 12.6H2V22h9.4v-9.4zM22 12.6h-9.4V22H22v-9.4z" /></svg>
                Connect Microsoft
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nylas Grant ID</label>
            <input value={nylasGrantId} onChange={(e) => setNylasGrantId(e.target.value)} placeholder="Auto-filled after connecting" readOnly={!!nylasGrantId} className={`${inputClass} ${nylasGrantId ? 'bg-[var(--surface-muted)] text-[var(--ink-faint)]' : ''}`} />
          </div>
          <div>
            <label className={labelClass}>Calendar ID</label>
            <input value={nylasCalendarId} onChange={(e) => setNylasCalendarId(e.target.value)} placeholder="Calendar ID to sync with" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Approval routing */}
      <div className={sectionClass + ' space-y-5'}>
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink)]">Approval routing</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Define how long sensitive actions can wait before they expire.</p>
        </div>
        <div className="sm:max-w-xs">
          <label className={labelClass}>Approval timeout (minutes)</label>
          <input type="number" min="5" max="1440" value={approvalTimeout} onChange={(e) => setApprovalTimeout(parseInt(e.target.value) || 30)} className={`${inputClass}`} />
          <p className={noteClass}>Pending approvals auto-expire after this window.</p>
        </div>
      </div>

      {/* Save general settings */}
      <div className="flex items-center gap-3">
        <button onClick={handleSaveNylas} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Email & Approval Settings'}
        </button>
        {saved ? <span className="text-sm font-medium text-[var(--success)]">Saved</span> : null}
      </div>
    </div>
  )
}
