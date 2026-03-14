import { PageIntro } from '@/components/dashboard/page-intro'
import { InboxView } from '@/components/dashboard/inbox-view'
import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { listEmailMessages } from '@/lib/nylas/client'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default async function InboxPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('business_config')
    .select('nylas_grant_id')
    .eq('tenant_id', tenantId)
    .single()

  const grantId = config?.nylas_grant_id

  // If not connected, show connect prompt
  if (!grantId) {
    return (
      <div className="dashboard-stack">
        <PageIntro
          eyebrow="Inbox"
          title="Your email."
          description="Connect your email account to view and send messages."
        />
        <div className="panel rounded-[32px]">
          <div className="dashboard-empty">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(43,114,107,0.12)]">
              <Mail className="h-7 w-7 text-[var(--teal)]" />
            </div>
            <p className="mt-5 text-lg font-semibold text-[var(--ink)]">Connect your email</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Link your Google or Microsoft account to read and send emails directly from YourAI.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a href="/api/nylas/auth?provider=google" className="btn-primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                </svg>
                Connect Google
              </a>
              <a
                href="/api/nylas/auth?provider=microsoft"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-white/80 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 2H2v9.4h9.4V2zM22 2h-9.4v9.4H22V2zM11.4 12.6H2V22h9.4v-9.4zM22 12.6h-9.4V22H22v-9.4z" />
                </svg>
                Connect Microsoft
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--ink-faint)]">
              Or configure email in{' '}
              <Link href="/your-ai" className="underline hover:text-[var(--ink)]">
                Your AI settings
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch emails
  let emails: any[] = []
  try {
    const result = await listEmailMessages(grantId, { limit: 25 })
    emails = result.data || []
  } catch {
    // Nylas error — show empty state
  }

  return (
    <div className="dashboard-stack">
      <PageIntro
        eyebrow="Inbox"
        title="Your email."
        description="Read, reply, and compose emails connected to your business account."
        aside={
          <div className="panel-muted w-full rounded-[28px] p-5 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(43,114,107,0.12)]">
                <Mail className="h-5 w-5 text-[var(--teal)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">{emails.length} messages loaded</p>
                <p className="text-xs text-[var(--ink-faint)]">Most recent emails from your connected account.</p>
              </div>
            </div>
          </div>
        }
      />
      <InboxView initialEmails={emails} />
    </div>
  )
}
