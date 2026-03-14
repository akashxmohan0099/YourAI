'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Save } from 'lucide-react'

interface YourAiPersonalityTabProps {
  tenantId: string
  config: any
}

const sectionClass = 'panel rounded-[30px] px-5 py-6 sm:px-6'
const labelClass = 'text-sm font-semibold text-[var(--ink)]'
const inputClass =
  'w-full px-3 py-2 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent bg-white/60'

export function YourAiPersonalityTab({ tenantId, config }: YourAiPersonalityTabProps) {
  const supabase = createClient()

  const [tone, setTone] = useState(config?.tone || 'friendly')
  const [customInstructions, setCustomInstructions] = useState(config?.custom_instructions || '')
  const [conversationStyle, setConversationStyle] = useState(config?.conversation_style || '')
  const [examplePhrases, setExamplePhrases] = useState(config?.example_phrases || '')

  const [quizAnswers, setQuizAnswers] = useState({
    formality: config?.tone === 'formal' ? 5 : config?.tone === 'professional' ? 4 : config?.tone === 'casual' ? 1 : 2,
    chattiness: 2,
    humor: 2,
    upselling: 2,
    pace: 3,
  })
  const [quizApplied, setQuizApplied] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    await supabase
      .from('business_config')
      .update({
        tone,
        custom_instructions: customInstructions || null,
        conversation_style: conversationStyle || null,
        example_phrases: examplePhrases || null,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      <section className={sectionClass}>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--ink)]">AI personality</h2>
        </div>
        <p className="text-sm text-[var(--ink-faint)] mb-6">
          Set up how your AI talks to customers. Adjust the sliders and pick your preferences.
        </p>

        {/* Personality quiz sliders */}
        <div className="space-y-5 mb-8">
          {[
            { key: 'formality' as const, label: 'How formal should your AI be?', left: 'Super casual', right: 'Very formal', leftEx: '"Hey! What can I do for ya?"', rightEx: '"Good morning. How may I assist you today?"' },
            { key: 'chattiness' as const, label: 'How chatty?', left: 'Straight to the point', right: 'Loves a good chat', leftEx: '"Haircut is $45, 30 min."', rightEx: '"Great question! So our haircuts are $45 and usually take about half an hour..."' },
            { key: 'humor' as const, label: 'Sense of humour?', left: 'All business', right: 'Light and fun', leftEx: '"Your appointment is confirmed."', rightEx: '"You\'re locked in! We\'ll have you looking fresh in no time."' },
            { key: 'upselling' as const, label: 'How much should it suggest extras?', left: 'Just answer questions', right: 'Always suggest more', leftEx: 'Only mentions what was asked about', rightEx: '"Would you also like to add a beard trim? Most guys love the combo."' },
            { key: 'pace' as const, label: 'Conversation pace?', left: 'Quick and efficient', right: 'Take it slow', leftEx: 'Gets to booking in 2-3 exchanges', rightEx: 'Chats first, asks about their day, then gets to business' },
          ].map((q) => (
            <div key={q.key} className="rounded-2xl border border-[var(--line)] bg-white/40 px-5 py-4">
              <p className="text-sm font-semibold text-[var(--ink)] mb-3">{q.label}</p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[var(--ink-faint)] w-28 text-right flex-shrink-0 hidden sm:block">{q.left}</span>
                <div className="flex-1 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.key]: val })}
                      className={`flex-1 h-9 rounded-xl text-sm font-medium transition-all ${
                        quizAnswers[q.key] === val
                          ? 'bg-[var(--teal)] text-white shadow-sm scale-105'
                          : 'bg-white/60 border border-[var(--line)] text-[var(--ink-faint)] hover:border-[var(--ink-faint)]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[var(--ink-faint)] w-28 flex-shrink-0 hidden sm:block">{q.right}</span>
              </div>
              <div className="flex justify-between mt-2 sm:hidden">
                <span className="text-xs text-[var(--ink-faint)]">{q.left}</span>
                <span className="text-xs text-[var(--ink-faint)]">{q.right}</span>
              </div>
              <p className="text-xs text-[var(--ink-faint)] mt-2 italic">
                {quizAnswers[q.key] <= 2 ? q.leftEx : quizAnswers[q.key] >= 4 ? q.rightEx : 'A nice balance of both'}
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const f = quizAnswers.formality
              const newTone = f <= 1 ? 'casual' : f <= 2 ? 'friendly' : f <= 4 ? 'professional' : 'formal'
              setTone(newTone)

              const styleLines: string[] = []
              if (quizAnswers.chattiness <= 2) styleLines.push('Keep responses short and to the point. No unnecessary small talk.')
              else if (quizAnswers.chattiness >= 4) styleLines.push('Be conversational and chatty. Take time to connect with the caller.')
              if (quizAnswers.humor <= 2) styleLines.push('Keep it professional — no jokes or playful language.')
              else if (quizAnswers.humor >= 4) styleLines.push('Be light and fun. A bit of humour is welcome.')
              if (quizAnswers.upselling <= 2) styleLines.push('Only answer what the customer asks. Do not suggest additional services.')
              else if (quizAnswers.upselling >= 4) styleLines.push('Proactively suggest related services or upgrades when relevant.')
              if (quizAnswers.pace <= 2) styleLines.push('Be efficient. Get to the point quickly and help them book fast.')
              else if (quizAnswers.pace >= 4) styleLines.push('Take a relaxed pace. Chat a bit before jumping into business.')

              setConversationStyle(styleLines.join('\n'))
              setQuizApplied(true)
              setTimeout(() => setQuizApplied(false), 3000)
            }}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--teal))] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {quizApplied ? 'Applied!' : 'Apply personality'}
          </button>
        </div>

        {/* This or That */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-[var(--ink)] mb-3">Pick what sounds more like you</p>
          <div className="space-y-2">
            {[
              { a: '"No worries at all!"', b: '"Certainly, I can help with that."' },
              { a: '"Hey, thanks for calling!"', b: '"Good morning, thank you for calling."' },
              { a: '"You\'re all booked in, legend!"', b: '"Your appointment has been confirmed."' },
              { a: '"Anything else before you go?"', b: '"Is there anything else I may assist you with?"' },
              { a: '"Let me check that for ya."', b: '"Allow me to look into that for you."' },
            ].map((pair, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const phrases = examplePhrases ? examplePhrases.split('\n') : []
                    const filtered = phrases.filter((p: string) => p !== pair.b)
                    if (!filtered.includes(pair.a)) filtered.push(pair.a)
                    setExamplePhrases(filtered.filter(Boolean).join('\n'))
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                    examplePhrases?.includes(pair.a)
                      ? 'border-[var(--teal)] bg-[rgba(43,114,107,0.08)] text-[var(--teal)] font-medium'
                      : 'border-[var(--line)] bg-white/40 text-[var(--ink-soft)] hover:border-[var(--ink-faint)]'
                  }`}
                >
                  {pair.a}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const phrases = examplePhrases ? examplePhrases.split('\n') : []
                    const filtered = phrases.filter((p: string) => p !== pair.a)
                    if (!filtered.includes(pair.b)) filtered.push(pair.b)
                    setExamplePhrases(filtered.filter(Boolean).join('\n'))
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                    examplePhrases?.includes(pair.b)
                      ? 'border-[var(--teal)] bg-[rgba(43,114,107,0.08)] text-[var(--teal)] font-medium'
                      : 'border-[var(--line)] bg-white/40 text-[var(--ink-soft)] hover:border-[var(--ink-faint)]'
                  }`}
                >
                  {pair.b}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--ink-faint)] mt-2">Your AI will match the style of the phrases you pick.</p>
        </div>

        {/* Manual overrides */}
        <div className="space-y-4 border-t border-[var(--line)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--ink-faint)]">Advanced</p>

          <div>
            <label className={labelClass}>Tone</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {[
                { value: 'casual', label: 'Casual', desc: 'Laid-back, like a mate' },
                { value: 'friendly', label: 'Friendly', desc: 'Warm and natural' },
                { value: 'professional', label: 'Professional', desc: 'Polished but approachable' },
                { value: 'formal', label: 'Formal', desc: 'Respectful and courteous' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    tone === t.value
                      ? 'border-[var(--teal)] bg-[rgba(43,114,107,0.08)] text-[var(--teal)]'
                      : 'border-[var(--line)] bg-white/40 text-[var(--ink-soft)] hover:border-[var(--ink-faint)]'
                  }`}
                  title={t.desc}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Conversation style</label>
            <textarea value={conversationStyle} onChange={(e) => setConversationStyle(e.target.value)} rows={3} className={inputClass} placeholder="Keep it short. Don't be too salesy. Be direct — answer the question first, then offer extras." />
            <p className="mt-1.5 text-xs text-[var(--ink-faint)]">Describe how you want your AI to talk, like briefing a new receptionist.</p>
          </div>

          <div>
            <label className={labelClass}>Example phrases</label>
            <textarea value={examplePhrases} onChange={(e) => setExamplePhrases(e.target.value)} rows={3} className={inputClass} placeholder={'"Hey, thanks for calling! What can I do for ya?"\n"No worries, let me check that for you."\n"Sweet, you\'re all booked in!"'} />
            <p className="mt-1.5 text-xs text-[var(--ink-faint)]">Write the way YOU talk. Your AI will match this style. One phrase per line.</p>
          </div>

          <div>
            <label className={labelClass}>Custom rules</label>
            <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={3} className={inputClass} placeholder='Never offer discounts without asking me first.&#10;Always suggest our premium package.&#10;Mention we have free parking.' />
            <p className="mt-1.5 text-xs text-[var(--ink-faint)]">Specific do&apos;s and don&apos;ts for your AI.</p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && <span className="text-sm font-medium text-[var(--success)]">Saved</span>}
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--teal)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--teal-strong)] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
