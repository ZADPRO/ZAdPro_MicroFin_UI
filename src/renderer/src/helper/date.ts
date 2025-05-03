export function getDateAfterMonths(dateStr: string, monthRange: number): string {
  const date = new Date(dateStr)
  const originalDay = date.getDate()

  // Add the month range
  date.setMonth(date.getMonth() + monthRange)

  // Adjust if day is overflowed (e.g., from 31st to next month)
  if (date.getDate() < originalDay) {
    date.setDate(0) // Go to last day of previous month
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
