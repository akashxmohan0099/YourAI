'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface Approval {
  id: string
  action_type: string
  action_details: Record<string, unknown>
  context_summary: string
  status: string
  decided_via: string | null
  expires_at: string
  created_at: string
  clients?: { name?: string; phone?: string }
  conversations?: { channel?: string }
}

interface ApprovalQueueProps {
  approvals: Approval[]
  tenantId: string
}

export function ApprovalQueue({ approvals: initialApprovals, tenantId }: ApprovalQueueProps) {
  const [approvals, setApprovals] = useState(initialApprovals)
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('approvals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approvals',
          filter: `tenant_id=eq.${tenantId}`,
        },
        async () => {
          const { data } = await supabase
            .from('approvals')
            .select('*, clients(name, phone), conversations(channel)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(50)
          if (data) setApprovals(data)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId, supabase])

  const handleDecision = async (approvalId: string, decision: 'approved' | 'denied') => {
    setProcessing(approvalId)

    const res = await fetch(`/api/approvals/${approvalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })

    if (res.ok) {
      setApprovals(approvals.map(a =>
        a.id === approvalId
          ? { ...a, status: decision, decided_via: 'dashboard' }
          : a
      ))
    }
    setProcessing(null)
  }

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    expired: { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-100' },
  }

  const pending = approvals.filter(a => a.status === 'pending')
  const resolved = approvals.filter(a => a.status !== 'pending')

  return (
    <div className="space-y-6">
      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
            Pending ({pending.length})
          </h2>
          {pending.map((approval) => {
            const config = statusConfig[approval.status]
            const StatusIcon = config.icon
            const isExpired = new Date(approval.expires_at) < new Date()

            return (
              <div key={approval.id} className="bg-white rounded-xl border-2 border-yellow-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {approval.action_type.replace(/_/g, ' ')}
                      </span>
                      {approval.clients?.name && (
                        <span className="text-xs text-gray-500">
                          — {approval.clients.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{approval.context_summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{formatRelativeTime(approval.created_at)}</span>
                      {approval.conversations?.channel && (
                        <span>via {approval.conversations.channel.replace('_', ' ')}</span>
                      )}
                      {isExpired && (
                        <span className="text-red-500 font-medium">Expired</span>
                      )}
                    </div>
                  </div>
                  {!isExpired && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(approval.id, 'approved')}
                        disabled={processing === approval.id}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(approval.id, 'denied')}
                        disabled={processing === approval.id}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pending.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-300" />
          <p className="text-gray-500">No pending approvals</p>
        </div>
      )}

      {/* Resolved approvals */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            History
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {resolved.map((approval) => {
              const config = statusConfig[approval.status]
              const StatusIcon = config.icon
              return (
                <div key={approval.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={`p-1.5 rounded-full ${config.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 capitalize">
                      {approval.action_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{approval.context_summary}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 capitalize">{approval.status}</span>
                    {approval.decided_via && (
                      <p className="text-xs text-gray-400">via {approval.decided_via}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
