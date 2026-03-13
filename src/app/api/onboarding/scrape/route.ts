import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

const businessDataSchema = z.object({
  business_name: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postcode: z.string().optional(),
    })
    .optional(),
  hours: z
    .record(
      z.enum([
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]),
      z
        .object({
          open: z.string(),
          close: z.string(),
        })
        .nullable()
    )
    .optional(),
  services: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string().optional(),
        duration: z.string().optional(),
      })
    )
    .optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  tone: z
    .enum(['professional', 'friendly', 'casual', 'formal'])
    .optional(),
})

function stripHtmlToText(html: string): string {
  // Remove script tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Remove style tags and their content
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  // Remove nav tags and their content
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
  // Remove footer tags and their content
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
  // Remove noscript tags
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
  // Remove SVG tags
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
  // Replace block-level tags with newlines for readability
  text = text.replace(/<\/?(div|p|br|h[1-6]|li|tr|td|th|section|article|header|main|blockquote)[^>]*>/gi, '\n')
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&#x27;/g, "'")
  text = text.replace(/&#x2F;/g, '/')
  // Collapse multiple whitespace/newlines
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n')
  text = text.trim()

  // Truncate to ~8000 characters to fit in context
  if (text.length > 8000) {
    text = text.slice(0, 8000)
  }

  return text
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid url parameter' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid http or https URL.' },
        { status: 400 }
      )
    }

    // Fetch the website HTML
    let html: string
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; YourAI/1.0; +https://yourai.com.au)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-AU,en;q=0.9',
        },
      })

      clearTimeout(timeout)

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch website: HTTP ${response.status} ${response.statusText}`,
          },
          { status: 422 }
        )
      }

      html = await response.text()
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'Website took too long to respond (timeout after 10s)'
          : `Could not fetch website: ${err instanceof Error ? err.message : 'Unknown error'}`
      return NextResponse.json({ error: message }, { status: 422 })
    }

    // Strip HTML to plain text
    const textContent = stripHtmlToText(html)

    if (textContent.length < 50) {
      return NextResponse.json(
        {
          error:
            'Could not extract meaningful content from the website. The page may be JavaScript-rendered or empty.',
        },
        { status: 422 }
      )
    }

    // Use Claude to extract structured data
    const anthropic = createAnthropic()

    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: businessDataSchema,
      prompt: `Extract business information from this website content. Only include fields you can confidently find. For Australian businesses, use AU phone format and state abbreviations (NSW, VIC, QLD, etc).

Website URL: ${parsedUrl.toString()}

Website content:
${textContent}`,
    })

    return NextResponse.json({ data: object })
  } catch (error) {
    console.error('Onboarding scrape error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape and extract business data' },
      { status: 500 }
    )
  }
}
