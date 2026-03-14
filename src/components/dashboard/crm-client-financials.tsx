import { Download, FileText, Receipt } from 'lucide-react'

interface Quote {
  id: string
  quote_number: string
  total_cents: number
  status: string
  valid_until?: string | null
  created_at: string
}

interface Invoice {
  id: string
  invoice_number: string
  total_cents: number
  status: string
  due_date?: string | null
  created_at: string
}

interface CrmClientFinancialsProps {
  quotes: Quote[]
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  draft: 'chip',
  sent: 'chip',
  accepted: 'chip chip-teal',
  rejected: 'chip chip-accent',
  expired: 'chip chip-accent',
  paid: 'chip chip-teal',
  overdue: 'chip chip-accent',
  cancelled: 'chip',
}

export function CrmClientFinancials({ quotes, invoices }: CrmClientFinancialsProps) {
  return (
    <div className="dashboard-stack">
      {/* Quotes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="text-base font-semibold text-[var(--ink)]">
            Quotes <span className="font-normal text-[var(--ink-faint)]">({quotes.length})</span>
          </h3>
        </div>

        {quotes.length === 0 ? (
          <p className="text-sm text-[var(--ink-faint)] py-4">No quotes for this client.</p>
        ) : (
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between gap-3 rounded-[22px] bg-white/45 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{quote.quote_number}</p>
                  <p className="text-xs text-[var(--ink-faint)]">{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-[var(--ink)] tabular-nums">
                    ${(quote.total_cents / 100).toFixed(2)}
                  </span>
                  <span className={statusColors[quote.status] || 'chip'}>{quote.status}</span>
                  <a
                    href={`/api/quotes/${quote.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
                    title="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4 text-[var(--teal)]" />
          <h3 className="text-base font-semibold text-[var(--ink)]">
            Invoices <span className="font-normal text-[var(--ink-faint)]">({invoices.length})</span>
          </h3>
        </div>

        {invoices.length === 0 ? (
          <p className="text-sm text-[var(--ink-faint)] py-4">No invoices for this client.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-[22px] bg-white/45 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{invoice.invoice_number}</p>
                  <p className="text-xs text-[var(--ink-faint)]">
                    Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '--'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-[var(--ink)] tabular-nums">
                    ${(invoice.total_cents / 100).toFixed(2)}
                  </span>
                  <span className={statusColors[invoice.status] || 'chip'}>{invoice.status}</span>
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
                    title="View PDF"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
