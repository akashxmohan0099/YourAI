'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Phone, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  phone: string | null
  email: string | null
  availability: Record<string, { available: boolean; start?: string; end?: string }> | null
}

interface RosteringViewProps {
  initialMembers: TeamMember[]
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(offset: number) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ... 6=Sat
  // Go back to this week's Monday (if Sun, go back 6 days)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysSinceMonday + offset * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export function RosteringView({ initialMembers }: RosteringViewProps) {
  const [members, setMembers] = useState(initialMembers)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [adding, setAdding] = useState(false)
  const [callingId, setCallingId] = useState<string | null>(null)
  const [callMessage, setCallMessage] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const weekDates = getWeekDates(weekOffset)
  const todayStr = new Date().toISOString().split('T')[0]

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
    })

    if (res.ok) {
      const member = await res.json()
      setMembers((prev) => [...prev, member])
      setName('')
      setPhone('')
    }

    setAdding(false)
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/team/${id}`, { method: 'DELETE' })
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const handleCall = async (id: string) => {
    setCallingId(id)
    setCallMessage(null)

    const res = await fetch(`/api/team/${id}/call`, { method: 'POST' })

    if (res.ok) {
      setCallMessage('Call started — availability will update when the call ends.')
      setTimeout(() => {
        setCallingId(null)
        setCallMessage(null)
      }, 8000)
    } else {
      const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }))
      setCallMessage(err.error || 'Failed to start call')
      setCallingId(null)
    }
  }

  const handleRefresh = async () => {
    const res = await fetch('/api/team')
    if (res.ok) {
      const data = await res.json()
      setMembers(data)
    }
  }

  const handleCellClick = async (memberId: string, date: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    const current = member.availability?.[date]
    const newSlot = current?.available
      ? { available: false }
      : { available: true, start: '09:00', end: '17:00' }

    // Optimistic update
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, availability: { ...(m.availability || {}), [date]: newSlot } }
          : m
      )
    )

    await fetch(`/api/team/${memberId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability: { [date]: newSlot } }),
    })
  }

  const inputClasses =
    'px-3 py-2 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-shadow'

  return (
    <div className="space-y-5">
      {/* Add member form */}
      <form onSubmit={handleAdd} className="panel rounded-[28px] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">Add team member</h3>
        <div className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className={cn(inputClasses, 'min-w-[160px] flex-1')}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+61 4XX XXX XXX"
            type="tel"
            className={cn(inputClasses, 'min-w-[160px] flex-1')}
          />
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--teal-strong)] disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Call status message */}
      {callMessage && (
        <div className="rounded-[22px] border border-[rgba(43,114,107,0.2)] bg-[rgba(43,114,107,0.06)] px-4 py-3 text-sm text-[var(--teal)]">
          {callMessage}
        </div>
      )}

      {/* Team list */}
      {members.length > 0 && (
        <div className="panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              Team ({members.length})
            </h3>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-white/70 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-sm font-semibold text-[var(--ink)]">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">{member.name}</p>
                    {member.phone && (
                      <p className="text-xs text-[var(--ink-faint)]">{member.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.phone && (
                    <button
                      onClick={() => handleCall(member.id)}
                      disabled={callingId === member.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors',
                        callingId === member.id
                          ? 'border-[var(--teal)] bg-[rgba(43,114,107,0.08)] text-[var(--teal)]'
                          : 'border-[var(--line)] text-[var(--ink)] hover:bg-white/70'
                      )}
                    >
                      {callingId === member.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" /> Calling...
                        </>
                      ) : (
                        <>
                          <Phone className="h-3 w-3" /> Check availability
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="rounded-lg p-1.5 text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.1)] hover:text-[var(--error)] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly calendar */}
      {members.length > 0 && (
        <div className="panel rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--ink)]">Weekly availability</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--ink)] hover:bg-white/70 transition-colors"
              >
                &lsaquo; Prev
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--ink)] hover:bg-white/70 transition-colors"
              >
                This week
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--ink)] hover:bg-white/70 transition-colors"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--ink-faint)] w-[140px]">
                    Team member
                  </th>
                  {weekDates.map((date, i) => {
                    const d = new Date(date + 'T00:00:00')
                    const isToday = date === todayStr
                    return (
                      <th
                        key={date}
                        className={cn(
                          'px-1 py-2 text-center text-xs font-semibold',
                          isToday ? 'text-[var(--teal)]' : 'text-[var(--ink-faint)]'
                        )}
                      >
                        <div>{DAY_NAMES[i]}</div>
                        <div className="font-normal">{d.getDate()}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-[var(--line)]">
                    <td className="px-3 py-2 text-sm font-medium text-[var(--ink)]">
                      {member.name}
                    </td>
                    {weekDates.map((date) => {
                      const slot = member.availability?.[date]
                      const isAvailable = slot?.available

                      return (
                        <td key={date} className="px-1 py-1.5 text-center">
                          <button
                            onClick={() => handleCellClick(member.id, date)}
                            className={cn(
                              'w-full rounded-lg px-1 py-2 text-[11px] font-medium transition-colors cursor-pointer',
                              isAvailable
                                ? 'bg-[rgba(43,114,107,0.12)] text-[var(--teal)] hover:bg-[rgba(43,114,107,0.2)]'
                                : slot
                                  ? 'bg-[rgba(181,79,64,0.08)] text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.15)]'
                                  : 'bg-[var(--surface-muted)] text-[var(--ink-faint)] hover:bg-[var(--line)]'
                            )}
                            title={
                              isAvailable && slot?.start
                                ? `${slot.start} - ${slot.end}`
                                : isAvailable
                                  ? 'Available'
                                  : slot
                                    ? 'Off'
                                    : 'Click to set'
                            }
                          >
                            {isAvailable && slot?.start
                              ? `${slot.start.replace(':00', '')}-${slot.end?.replace(':00', '')}`
                              : isAvailable
                                ? 'Yes'
                                : slot
                                  ? 'Off'
                                  : '\u2014'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--ink-faint)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-[rgba(43,114,107,0.12)]" />{' '}
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-[rgba(181,79,64,0.08)]" /> Off
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-[var(--surface-muted)]" /> Unknown
            </span>
            <span className="ml-auto">Click a cell to toggle</span>
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="panel rounded-[28px] p-8 text-center">
          <p className="text-sm text-[var(--ink-faint)]">
            Add team members above to start building your roster.
          </p>
        </div>
      )}
    </div>
  )
}
