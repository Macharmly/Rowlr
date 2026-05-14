export function exportExpensesToCSV(expenses, currency = 'PHP') {
  const headers = ['Date', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes']
  const rows = expenses.map(e => [
    e.date,
    e.category,
    parseFloat(e.amount).toFixed(2),
    currency,
    e.payment_method,
    e.notes || '',
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rowlr-expenses-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}