'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, MessageSquare, Globe, CheckCircle } from 'lucide-react'

interface ChannelConfigProps {
  tenantId: string
  config: Record<string, any>
}

export function ChannelConfig({ tenantId, config }: ChannelConfigProps) {
  const [form, setForm] = useState({
    voice_enabled: config.voice_enabled || false,
    sms_enabled: config.sms_enabled || false,
    vapi_assistant_id: config.vapi_assistant_id || '',
    vapi_phone_number_id: config.vapi_phone_number_id || '',
    twilio_phone_number: config.twilio_phone_number || '',
    owner_notification_phone: config.owner_notification_phone || '',
    approval_timeout_minutes: config.approval_timeout_minutes || 30,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()

    await supabase
      .from('business_config')
      .update(form)
      .eq('tenant_id', tenantId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Web Chat - always enabled */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Web Chat</h2>
            <p className="text-sm text-gray-500">Always enabled</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
        </div>
      </div>

      {/* Voice */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Phone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Voice (Vapi)</h2>
            <p className="text-sm text-gray-500">AI answers phone calls</p>
          </div>
          <label className="ml-auto flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.voice_enabled}
              onChange={(e) => setForm({ ...form, voice_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Enabled</span>
          </label>
        </div>
        {form.voice_enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vapi Assistant ID</label>
              <input
                value={form.vapi_assistant_id}
                onChange={(e) => setForm({ ...form, vapi_assistant_id: e.target.value })}
                placeholder="asst_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vapi Phone Number ID</label>
              <input
                value={form.vapi_phone_number_id}
                onChange={(e) => setForm({ ...form, vapi_phone_number_id: e.target.value })}
                placeholder="phn_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* SMS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">SMS (Twilio)</h2>
            <p className="text-sm text-gray-500">AI responds to text messages</p>
          </div>
          <label className="ml-auto flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sms_enabled}
              onChange={(e) => setForm({ ...form, sms_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Enabled</span>
          </label>
        </div>
        {form.sms_enabled && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twilio Phone Number</label>
              <input
                value={form.twilio_phone_number}
                onChange={(e) => setForm({ ...form, twilio_phone_number: e.target.value })}
                placeholder="+1..."
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Owner Notifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone (for approval SMS)</label>
            <input
              value={form.owner_notification_phone}
              onChange={(e) => setForm({ ...form, owner_notification_phone: e.target.value })}
              placeholder="+1..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="1440"
              value={form.approval_timeout_minutes}
              onChange={(e) => setForm({ ...form, approval_timeout_minutes: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  )
}
