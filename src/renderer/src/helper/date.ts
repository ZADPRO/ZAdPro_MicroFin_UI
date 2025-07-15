export function getDateAfterMonths(dateStr: string, monthRange: number): string {
  console.log('monthRange', monthRange)
  console.log('dateStr', dateStr)
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

  console.log('${year}-${month}-${day}', year, '-', month, '-', day)
  return `${year}-${month}-${day}`
}


export function formatToCustomDateTime(dateInput: string | Date): string {
  const date = new Date(dateInput)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const period = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12 // Convert 0 to 12 for 12-hour format
  const formattedHours = String(hours).padStart(2, '0')

  return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${period}`
}
