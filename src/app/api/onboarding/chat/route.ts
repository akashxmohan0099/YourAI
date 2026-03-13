import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById } from '@/lib/onboarding/business-type-templates'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { tenantId, messages, currentExtracted, templateId } = await request.json()

    const template = templateId ? getTemplateById(templateId) : null

    const systemPrompt = `You are helping a business owner set up their AI assistant during onboarding. Your job is to have a natural conversation to learn about their business.

${template ? `They selected the "${template.label}" business type. Template services have been pre-loaded.` : 'No template was selected.'}

Current extracted information:
${JSON.stringify(currentExtracted, null, 2)}

Your goals in this conversation:
1. Learn what services they offer and their pricing (in AUD)
2. Learn their business hours
3. Learn common customer questions (FAQs)
4. Understand their preferred communication tone
5. Learn any special rules or instructions (e.g., "never offer discounts", "always ask for their name first")
6. Get a brief description of what makes their business special

Be conversational, friendly, and Australian. Ask follow-up questions. Don't ask everything at once — have a natural back-and-forth.

IMPORTANT: After each message, you MUST return a JSON object at the very end of your response on its own line, wrapped in <extracted> tags. This contains any UPDATES to the extracted data based on what you just learned. Only include fields that changed. For example:

<extracted>{"services": [{"name": "Haircut", "price": "$45", "duration": "30 min", "category": "Cuts"}], "tone": "casual", "customInstructions": "Never offer discounts"}</extracted>

Possible fields in the extracted object:
- services: array of {name, price, duration, category}
- hours: object like {"monday": {"open": "09:00", "close": "17:00"}, "sunday": null}
- faqs: array of {question, answer}
- tone: "professional" | "friendly" | "casual" | "formal"
- customInstructions: string with any rules
- description: string describing the business

If nothing new was extracted from this message, return an empty object: <extracted>{}</extracted>

Keep your conversational reply SHORT (2-4 sentences). Be concise. Don't repeat information back unless confirming something important.`

    const conversationMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: conversationMessages,
    })

    // Parse extracted data from response
    let reply = result.text
    let extracted: Record<string, any> = {}

    const extractedMatch = reply.match(/<extracted>([\s\S]*?)<\/extracted>/)
    if (extractedMatch) {
      try {
        extracted = JSON.parse(extractedMatch[1])
      } catch (e) {
        // ignore parse errors
      }
      // Remove the extracted tag from the visible reply
      reply = reply.replace(/<extracted>[\s\S]*?<\/extracted>/, '').trim()
    }

    // Merge with current extracted - only update fields that are present in the new extraction
    const mergedExtracted: Record<string, any> = {}
    if (extracted.services && extracted.services.length > 0) {
      // If AI sends services, merge with existing (add new ones, don't remove template ones unless explicitly asked)
      const existingNames = new Set((currentExtracted.services || []).map((s: any) => s.name.toLowerCase()))
      const newServices = extracted.services.filter((s: any) => !existingNames.has(s.name.toLowerCase()))
      if (newServices.length > 0) {
        mergedExtracted.services = [...(currentExtracted.services || []), ...newServices]
      } else if (extracted.services.length > 0) {
        // Full replacement if AI is explicitly updating
        mergedExtracted.services = extracted.services
      }
    }
    if (extracted.hours) mergedExtracted.hours = { ...(currentExtracted.hours || {}), ...extracted.hours }
    if (extracted.faqs && extracted.faqs.length > 0) mergedExtracted.faqs = [...(currentExtracted.faqs || []), ...extracted.faqs]
    if (extracted.tone) mergedExtracted.tone = extracted.tone
    if (extracted.customInstructions) mergedExtracted.customInstructions = extracted.customInstructions
    if (extracted.description) mergedExtracted.description = extracted.description

    return NextResponse.json({ reply, extracted: mergedExtracted })
  } catch (error) {
    console.error('Onboarding chat error:', error)
    return NextResponse.json({ reply: "Sorry, I had a hiccup. Could you say that again?", extracted: {} })
  }
}
