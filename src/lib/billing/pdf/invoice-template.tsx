import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'
import { formatCurrency, formatDate } from './utils'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface InvoicePDFProps {
  invoiceNumber: string
  date: string
  dueDate: string
  status: string
  business: {
    name: string
    phone?: string
    email?: string
    website?: string
    address?: { street?: string; city?: string; state?: string; zip?: string }
  }
  client?: { name: string; email?: string; phone?: string }
  lineItems: Array<{
    description: string
    quantity: number
    unitPriceCents: number
    totalCents: number
  }>
  subtotalCents: number
  taxCents: number
  taxRate: number
  totalCents: number
  notes?: string
  paymentUrl?: string
}

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const COLORS = {
  primary: '#7c3aed',
  dark: '#1c1917',
  secondary: '#78716c',
  lightBg: '#fafaf9',
  border: '#e7e5e4',
  white: '#ffffff',
  altRow: '#f5f5f4',
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.dark,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
    backgroundColor: COLORS.white,
  },

  /* --- header --- */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  businessName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  businessDetail: {
    fontSize: 9,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  invoiceLabel: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textAlign: 'right' as const,
    marginBottom: 6,
  },
  invoiceNumberRight: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: 'right' as const,
  },

  /* --- meta row --- */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaBlock: {},
  metaBlockRight: { alignItems: 'flex-end' as const },
  metaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    color: COLORS.dark,
    marginBottom: 2,
  },
  metaValueBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 2,
  },
  statusBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    color: COLORS.primary,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end' as const,
    marginTop: 4,
  },

  /* --- table --- */
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: COLORS.altRow,
  },
  colDescription: { width: '50%' },
  colQty: { width: '12%', textAlign: 'center' as const },
  colUnitPrice: { width: '19%', textAlign: 'right' as const },
  colTotal: { width: '19%', textAlign: 'right' as const },
  cellText: {
    fontSize: 10,
    color: COLORS.dark,
  },
  cellTextSecondary: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  /* --- totals --- */
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 28,
  },
  totalsBlock: {
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  totalsLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  totalsValue: {
    fontSize: 10,
    color: COLORS.dark,
  },
  totalDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 2,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalDueLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  totalDueValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },

  /* --- payment info --- */
  paymentBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  paymentUrl: {
    fontSize: 9,
    color: COLORS.primary,
  },

  /* --- notes --- */
  notesBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.secondary,
    lineHeight: 1.5,
  },

  /* --- footer --- */
  footer: {
    position: 'absolute' as const,
    bottom: 36,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.secondary,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  footerBusiness: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.secondary,
    textAlign: 'center' as const,
  },
})

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InvoicePDF(props: InvoicePDFProps) {
  const {
    invoiceNumber,
    date,
    dueDate,
    status,
    business,
    client,
    lineItems,
    subtotalCents,
    taxCents,
    taxRate,
    totalCents,
    notes,
    paymentUrl,
  } = props

  const addressParts: string[] = []
  if (business.address) {
    if (business.address.street) addressParts.push(business.address.street)
    const cityStateZip = [
      business.address.city,
      business.address.state,
      business.address.zip,
    ]
      .filter(Boolean)
      .join(', ')
    if (cityStateZip) addressParts.push(cityStateZip)
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ---- Header ---- */}
        <View style={s.header}>
          <View style={{ maxWidth: '55%' }}>
            <Text style={s.businessName}>{business.name}</Text>
            {addressParts.map((line, i) => (
              <Text key={i} style={s.businessDetail}>
                {line}
              </Text>
            ))}
            {business.phone && (
              <Text style={s.businessDetail}>{business.phone}</Text>
            )}
            {business.email && (
              <Text style={s.businessDetail}>{business.email}</Text>
            )}
            {business.website && (
              <Text style={s.businessDetail}>{business.website}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' as const }}>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceNumberRight}>{invoiceNumber}</Text>
          </View>
        </View>

        {/* ---- Bill To + Meta ---- */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Bill To</Text>
            {client ? (
              <>
                <Text style={s.metaValueBold}>{client.name}</Text>
                {client.email && (
                  <Text style={s.metaValue}>{client.email}</Text>
                )}
                {client.phone && (
                  <Text style={s.metaValue}>{client.phone}</Text>
                )}
              </>
            ) : (
              <Text style={s.metaValue}>--</Text>
            )}
          </View>

          <View style={s.metaBlockRight}>
            <Text style={s.metaLabel}>Invoice Date</Text>
            <Text style={s.metaValue}>{formatDate(date)}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={s.metaLabel}>Due Date</Text>
              <Text style={s.metaValueBold}>{formatDate(dueDate)}</Text>
            </View>
            <Text style={s.statusBadge}>{status}</Text>
          </View>
        </View>

        {/* ---- Line Items Table ---- */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDescription]}>
              Description
            </Text>
            <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
            <Text style={[s.tableHeaderText, s.colUnitPrice]}>Unit Price</Text>
            <Text style={[s.tableHeaderText, s.colTotal]}>Total</Text>
          </View>
          {lineItems.map((item, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={[s.cellText, s.colDescription]}>
                {item.description}
              </Text>
              <Text style={[s.cellTextSecondary, s.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[s.cellTextSecondary, s.colUnitPrice]}>
                {formatCurrency(item.unitPriceCents)}
              </Text>
              <Text style={[s.cellText, s.colTotal]}>
                {formatCurrency(item.totalCents)}
              </Text>
            </View>
          ))}
        </View>

        {/* ---- Totals ---- */}
        <View style={s.totalsContainer}>
          <View style={s.totalsBlock}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>
                {formatCurrency(subtotalCents)}
              </Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>
                Tax{taxRate ? ` (${taxRate}%)` : ''}
              </Text>
              <Text style={s.totalsValue}>{formatCurrency(taxCents)}</Text>
            </View>
            <View style={s.totalDueRow}>
              <Text style={s.totalDueLabel}>Total Due</Text>
              <Text style={s.totalDueValue}>
                {formatCurrency(totalCents)}
              </Text>
            </View>
          </View>
        </View>

        {/* ---- Payment Info ---- */}
        {paymentUrl && (
          <View style={s.paymentBox}>
            <Text style={s.paymentLabel}>Pay Online</Text>
            <Text style={s.paymentUrl}>{paymentUrl}</Text>
          </View>
        )}

        {/* ---- Notes ---- */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* ---- Footer ---- */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Payment is due by {formatDate(dueDate)}
          </Text>
          <Text style={s.footerText}>Thank you for your business</Text>
          <Text style={s.footerBusiness}>{business.name}</Text>
        </View>
      </Page>
    </Document>
  )
}
