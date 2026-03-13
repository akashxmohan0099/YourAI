'use client'

import { useState } from 'react'
import { Plus, Tag, StickyNote, Calendar, X } from 'lucide-react'

interface ClientDetailEnhancedProps {
  client: any
  notes: any[]
  tags: any[]
  appointments: any[]
  tenantId: string
}

export function ClientDetailEnhanced({
  client,
  notes,
  tags,
  appointments,
  tenantId,
}: ClientDetailEnhancedProps) {
  const [newNote, setNewNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  const addNote = async () => {
    if (!newNote.trim()) return
    setSaving(true)
    try {
      await fetch('/api/clients/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          note: newNote,
        }),
      })
      setNewNote('')
      window.location.reload()
    } catch (err) {
      console.error('Failed to add note:', err)
    } finally {
      setSaving(false)
    }
  }

  const addTag = async () => {
    if (!newTag.trim()) return
    setSaving(true)
    try {
      await fetch('/api/clients/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          tag: newTag.toLowerCase(),
        }),
      })
      setNewTag('')
      window.location.reload()
    } catch (err) {
      console.error('Failed to add tag:', err)
    } finally {
      setSaving(false)
    }
  }

  const removeTag = async (tagId: string) => {
    try {
      await fetch(`/api/clients/tags?id=${tagId}`, { method: 'DELETE' })
      window.location.reload()
    } catch (err) {
      console.error('Failed to remove tag:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tags */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((t: any) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
            >
              {t.tag}
              <button
                onClick={() => removeTag(t.id)}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-gray-400">No tags yet</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tag..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          />
          <button
            onClick={addTag}
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
        </div>
        <div className="space-y-3 mb-4">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400">No notes yet</p>
          ) : (
            notes.map((n: any) => (
              <div
                key={n.id}
                className="bg-gray-50 rounded-lg px-3 py-2 text-sm"
              >
                <p className="text-gray-700">{n.note}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.source === 'ai' ? 'Added by AI' : 'Manual'} ·{' '}
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none"
          />
          <button
            onClick={addNote}
            disabled={saving || !newNote.trim()}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 self-end"
          >
            Add
          </button>
        </div>
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Appointments</h3>
        </div>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-400">No appointments</p>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt: any) => (
              <div
                key={apt.id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="min-w-[80px]">
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(apt.starts_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(apt.starts_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{apt.title}</p>
                  <p className="text-xs text-gray-400">{apt.services?.name}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    apt.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : apt.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : apt.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
