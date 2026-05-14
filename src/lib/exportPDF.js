import { jsPDF } from 'jspdf'

const CATEGORY_COLORS = {
  Food: [249, 115, 22],
  Transport: [59, 130, 246],
  Shopping: [236, 72, 153],
  Bills: [239, 68, 68],
  Health: [34, 197, 94],
  Entertainment: [168, 85, 247],
  Education: [99, 102, 241],
  Savings: [20, 184, 166],
  Other: [107, 114, 128],
}

function getCurrencySymbol(code) {
  const map = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥', SGD: 'S$', AUD: 'A$', CAD: 'C$', KRW: '₩', CNY: '¥', MYR: 'RM', IDR: 'Rp', THB: '฿', VND: '₫', INR: '₹' }
  return map[code] || code
}

export function exportAnalyticsPDF(expenses, currency = 'PHP', rate = 1, displayName = 'User', budgets = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const symbol = getCurrencySymbol(currency)
  const fmt = (amt) => `${symbol}${(parseFloat(amt || 0) * rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  // ─── HEADER ───────────────────────────────────────────────
  // Background bar
  doc.setFillColor(26, 26, 26)
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 4, 4, 'F')

  // Logo text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Rowlr', margin + 8, y + 11)

  // Subtitle
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  doc.text('Personal Finance Analytics Report', margin + 8, y + 19)

  // Date + user
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  const now = new Date()
  doc.text(`Generated: ${now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin - 8, y + 10, { align: 'right' })
  doc.text(`User: ${displayName}`, pageW - margin - 8, y + 17, { align: 'right' })
  doc.text(`Currency: ${currency}`, pageW - margin - 8, y + 24, { align: 'right' })

  y += 38

  // ─── SUMMARY STATS ────────────────────────────────────────
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const today = new Date().toISOString().split('T')[0]
  const todayTotal = expenses.filter(e => e.date === today).reduce((s, e) => s + parseFloat(e.amount), 0)
  const catTotals = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount); return acc }, {})
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

  const stats = [
    { label: 'Total Expenses', value: fmt(total) },
    { label: "Today's Spend", value: fmt(todayTotal) },
    { label: 'Top Category', value: topCat ? topCat[0] : '—' },
    { label: 'Total Records', value: `${expenses.length} expenses` },
  ]

  const boxW = (pageW - margin * 2 - 9) / 4
  stats.forEach((stat, i) => {
    const x = margin + i * (boxW + 3)
    doc.setFillColor(248, 248, 246)
    doc.roundedRect(x, y, boxW, 18, 3, 3, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.roundedRect(x, y, boxW, 18, 3, 3, 'S')
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label.toUpperCase(), x + boxW / 2, y + 6, { align: 'center' })
    doc.setTextColor(26, 26, 26)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x + boxW / 2, y + 13, { align: 'center' })
  })

  y += 26

  // ─── CATEGORY BREAKDOWN ───────────────────────────────────
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Spending by Category', margin, y)
  y += 6

  // Section divider
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, pageW - margin, y)
  y += 5

  const catData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({ cat, amt, pct: total ? (amt / total) * 100 : 0 }))

  if (catData.length === 0) {
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('No expenses recorded.', margin, y + 5)
    y += 12
  } else {
    // Table header
    doc.setFillColor(245, 245, 243)
    doc.rect(margin, y, pageW - margin * 2, 7, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('CATEGORY', margin + 4, y + 5)
    doc.text('AMOUNT', margin + 80, y + 5)
    doc.text('%', margin + 110, y + 5)
    doc.text('BAR', margin + 125, y + 5)
    y += 9

    catData.forEach((row, i) => {
      if (y > pageH - 40) { doc.addPage(); y = margin }

      const rowBg = i % 2 === 0 ? [255, 255, 255] : [250, 250, 248]
      doc.setFillColor(...rowBg)
      doc.rect(margin, y - 1, pageW - margin * 2, 8, 'F')

      // Color dot
      const color = CATEGORY_COLORS[row.cat] || [107, 114, 128]
      doc.setFillColor(...color)
      doc.circle(margin + 5, y + 3, 2, 'F')

      // Text
      doc.setTextColor(26, 26, 26)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(row.cat, margin + 10, y + 5)
      doc.setFont('helvetica', 'bold')
      doc.text(fmt(row.amt), margin + 80, y + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`${row.pct.toFixed(1)}%`, margin + 110, y + 5)

      // Progress bar
      const barW = 35
      doc.setFillColor(220, 220, 220)
      doc.roundedRect(margin + 122, y + 1, barW, 4, 1, 1, 'F')
      doc.setFillColor(...color)
      doc.roundedRect(margin + 122, y + 1, barW * (row.pct / 100), 4, 1, 1, 'F')

      y += 8
    })
  }

  y += 8

  // ─── LAST 7 DAYS ──────────────────────────────────────────
  if (y > pageH - 60) { doc.addPage(); y = margin }

  doc.setTextColor(26, 26, 26)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Last 7 Days', margin, y)
  y += 6
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, pageW - margin, y)
  y += 5

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayTotal = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + parseFloat(e.amount), 0)
    return { label: d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }), total: dayTotal, isToday: i === 6 }
  })

  const maxDaily = Math.max(...dailyData.map(d => d.total), 1)
  const barAreaW = pageW - margin * 2 - 60
  const barH = 6

  dailyData.forEach((day, i) => {
    if (y > pageH - 30) { doc.addPage(); y = margin }
    const rowBg = i % 2 === 0 ? [255, 255, 255] : [250, 250, 248]
    doc.setFillColor(...rowBg)
    doc.rect(margin, y - 1, pageW - margin * 2, barH + 4, 'F')

    doc.setTextColor(day.isToday ? 26 : 100, day.isToday ? 26 : 100, day.isToday ? 26 : 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', day.isToday ? 'bold' : 'normal')
    doc.text(day.label, margin + 2, y + 4)

    // Bar
    const bw = day.total > 0 ? Math.max((day.total / maxDaily) * barAreaW * 0.6, 2) : 0
    doc.setFillColor(220, 220, 220)
    doc.roundedRect(margin + 52, y, barAreaW * 0.6, barH, 1, 1, 'F')
    if (bw > 0) {
      doc.setFillColor(day.isToday ? 26 : 59, day.isToday ? 26 : 130, day.isToday ? 26 : 246)
      doc.roundedRect(margin + 52, y, bw, barH, 1, 1, 'F')
    }

    // Amount
    doc.setTextColor(26, 26, 26)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(fmt(day.total), pageW - margin - 2, y + 4, { align: 'right' })

    y += barH + 5
  })

  y += 8

  // ─── BUDGET GOALS ─────────────────────────────────────────
  if (budgets.length > 0) {
    if (y > pageH - 60) { doc.addPage(); y = margin }

    doc.setTextColor(26, 26, 26)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Budget Goals (This Month)', margin, y)
    y += 6
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, pageW - margin, y)
    y += 5

    const now2 = new Date()
    const monthStart = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, '0')}-01`

    budgets.forEach((budget, i) => {
      if (y > pageH - 30) { doc.addPage(); y = margin }
      const spent = expenses.filter(e => e.date >= monthStart && e.category === budget.category).reduce((s, e) => s + parseFloat(e.amount), 0)
      const pct = Math.min((spent / parseFloat(budget.amount)) * 100, 100)
      const isOver = spent > parseFloat(budget.amount)
      const color = isOver ? [239, 68, 68] : pct >= 80 ? [249, 115, 22] : [34, 197, 94]

      const rowBg = i % 2 === 0 ? [255, 255, 255] : [250, 250, 248]
      doc.setFillColor(...rowBg)
      doc.rect(margin, y - 1, pageW - margin * 2, 10, 'F')

      doc.setTextColor(26, 26, 26)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(budget.category, margin + 4, y + 4)
      doc.setFont('helvetica', 'bold')
      doc.text(`${fmt(spent)} / ${fmt(budget.amount)}`, margin + 60, y + 4)
      doc.setTextColor(...color)
      doc.text(`${Math.round(pct)}%${isOver ? ' OVER!' : ''}`, margin + 110, y + 4)

      // Bar
      doc.setFillColor(220, 220, 220)
      doc.roundedRect(margin + 128, y + 1, 35, 4, 1, 1, 'F')
      doc.setFillColor(...color)
      doc.roundedRect(margin + 128, y + 1, 35 * (pct / 100), 4, 1, 1, 'F')

      y += 10
    })
  }

  // ─── FOOTER ───────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(245, 245, 243)
    doc.rect(0, pageH - 12, pageW, 12, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.line(0, pageH - 12, pageW, pageH - 12)
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('© 2026 RRC Development — Rowlr Personal Finance Manager', margin, pageH - 5)
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
  }

  // Save
  const filename = `rowlr-analytics-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}