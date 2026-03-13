import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { ChannelConfig } from '@/components/dashboard/channel-config'

export default async function ChannelsPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('business_config')
    .select('voice_enabled, sms_enabled, vapi_assistant_id, vapi_phone_number_id, twilio_phone_number, owner_notification_phone, approval_timeout_minutes')
    .eq('tenant_id', tenantId)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Channels</h1>
      <ChannelConfig tenantId={tenantId} config={config || {}} />
    </div>
  )
}
