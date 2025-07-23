export const formatINRCurrency = (amount: number | undefined | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount ?? 0)
}
