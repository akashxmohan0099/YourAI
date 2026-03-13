'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import type { BusinessTypeTemplate } from '@/lib/onboarding/business-type-templates'

interface TellAiStepProps {
  tenantId: string
  template: BusinessTypeTemplate | null
  onNext: () => void
  onBack: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ExtractedData {
  services: Array<{ name: string; price: string; duration: string; category: string }>
  hours: Record<string, { open: string; close: string } | null>
  faqs: Array<{ question: string; answer: string }>
  tone: string
  customInstructions: string
  description: string
}

export function TellAiStep({ tenantId, template, onNext, onBack }: TellAiStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData>({
    services: [],
    hours: {},
    faqs: [],
    tone: template?.suggestedTone || 'friendly',
    customInstructions: '',
    description: '',
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load template defaults
  useEffect(() => {
    if (template) {
      setExtracted((prev) => ({
        ...prev,
        services: template.services.map((s) => ({
          name: s.name,
          price: s.priceCents ? `$${(s.priceCents / 100).toFixed(0)}` : 'Quote',
          duration: s.durationMinutes ? `${s.durationMinutes} min` : '',
          category: s.category,
        })),
        hours: template.defaultHours,
        faqs: template.faqs,
        tone: template.suggestedTone,
      }))

      // Initial AI message
      setMessages([{
        role: 'assistant',
        content: `G'day! I've loaded the standard ${template.label} template with ${template.services.length} services, business hours, and common FAQs.\n\nNow tell me about YOUR specific business — what makes you different? For example:\n\n• What services do you actually offer? (I can add, remove, or adjust the template ones)\n• What are your real prices?\n• What hours do you work?\n• Any rules I should know? (like "never offer discounts" or "always ask for their name")\n• Anything special about your business?\n\nJust chat naturally — I'll pick up the details as we go.`
      }])
    } else {
      setMessages([{
        role: 'assistant',
        content: `G'day! I'm going to be your business's AI assistant. Tell me about your business so I can help your customers.\n\nWhat do you do? What services do you offer and roughly what do you charge? What hours do you work?\n\nJust chat naturally — I'll pick up the details as we go.`
      }])
    }
  }, [template])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setSending(true)

    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          messages: [...messages, { role: 'user', content: userMessage }],
          currentExtracted: extracted,
          templateId: template?.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
        if (data.extracted) {
          setExtracted((prev) => ({ ...prev, ...data.extracted }))
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had a hiccup. Could you say that again?' }])
    }

    setSending(false)
  }

  const handleSaveAndContinue = async () => {
    setSaving(true)

    // Save services
    await supabase.from('services').delete().eq('tenant_id', tenantId)
    if (extracted.services.length > 0) {
      await supabase.from('services').insert(
        extracted.services.map((s, i) => ({
          tenant_id: tenantId,
          name: s.name,
          category: s.category || null,
          price_cents: parsePrice(s.price),
          price_type: s.price.toLowerCase().includes('quote') ? 'quote'
            : s.price.toLowerCase().includes('from') || s.price.toLowerCase().includes('+') ? 'starting_at'
            : s.price.toLowerCase().includes('/hr') || s.price.toLowerCase().includes('hour') ? 'hourly'
            : 'fixed',
          duration_minutes: parseDuration(s.duration),
          sort_order: i,
          is_active: true,
        }))
      )
    }

    // Save hours, FAQs, tone, description, custom instructions
    await supabase
      .from('business_config')
      .update({
        hours: extracted.hours,
        faqs: extracted.faqs,
        tone: extracted.tone,
        custom_instructions: extracted.customInstructions || null,
        description: extracted.description || null,
        timezone: 'Australia/Sydney',
      })
      .eq('tenant_id', tenantId)

    setSaving(false)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900 mb-1">Tell our AI about your business</h2>
        <p className="text-stone-500">Chat naturally — the AI will learn your services, prices, hours, and how to help your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat area */}
        <div className="lg:col-span-2 flex flex-col border border-stone-200 rounded-xl overflow-hidden" style={{ height: '420px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-md'
                    : 'bg-white border border-stone-200 text-stone-700 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 px-4 py-2.5 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stone-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Tell me about your business..."
                className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="px-3 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Extracted panel */}
        <div className="border border-stone-200 rounded-xl p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
            What I&apos;ve learned
          </h3>

          {extracted.services.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Services ({extracted.services.length})</h4>
              <div className="space-y-1">
                {extracted.services.slice(0, 8).map((s, i) => (
                  <div key={i} className="text-xs text-stone-600 flex justify-between">
                    <span className="truncate">{s.name}</span>
                    <span className="text-stone-400 ml-2 flex-shrink-0">{s.price}</span>
                  </div>
                ))}
                {extracted.services.length > 8 && (
                  <div className="text-xs text-stone-400">+{extracted.services.length - 8} more</div>
                )}
              </div>
            </div>
          )}

          {Object.keys(extracted.hours).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Hours</h4>
              {Object.entries(extracted.hours).slice(0, 7).map(([day, h]) => (
                <div key={day} className="text-xs text-stone-600 flex justify-between">
                  <span className="capitalize">{day.slice(0, 3)}</span>
                  <span className="text-stone-400">{h ? `${h.open}-${h.close}` : 'Closed'}</span>
                </div>
              ))}
            </div>
          )}

          {extracted.faqs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">FAQs ({extracted.faqs.length})</h4>
              {extracted.faqs.slice(0, 4).map((f, i) => (
                <div key={i} className="text-xs text-stone-600 truncate">{f.question}</div>
              ))}
            </div>
          )}

          {extracted.tone && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Tone</h4>
              <span className="text-xs text-stone-600 capitalize">{extracted.tone}</span>
            </div>
          )}

          {extracted.customInstructions && (
            <div>
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Special rules</h4>
              <div className="text-xs text-stone-600">{extracted.customInstructions.slice(0, 100)}{extracted.customInstructions.length > 100 ? '...' : ''}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSaveAndContinue}
          disabled={saving}
          className="px-8 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Next — Review'}
        </button>
      </div>
    </div>
  )
}

function parsePrice(priceStr: string): number | null {
  const match = priceStr.replace(/[^0-9.]/g, '')
  const num = parseFloat(match)
  return isNaN(num) ? null : Math.round(num * 100)
}

function parseDuration(durStr: string): number | null {
  const match = durStr.replace(/[^0-9]/g, '')
  const num = parseInt(match)
  return isNaN(num) ? null : num
}
