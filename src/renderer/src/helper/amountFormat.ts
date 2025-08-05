export const formatINRCurrency = (amount: number | undefined | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount ?? 0)
}

export function formatINRCurrencyText(value: string | number): string {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value.toString().replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return ''
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function parseINRInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '')
  return cleaned === '' ? 0 : Number(cleaned)
}
