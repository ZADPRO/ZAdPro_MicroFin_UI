export type LoanType = 1 | 2

export interface LoanDetails {
  loanType: LoanType
  principal: number
  annualInterest: number
  durationInYears: number
}

export function calculateLoanInterest(details: LoanDetails): number {
  const { loanType, principal, annualInterest, durationInYears } = details

  if (loanType === 1) {
    // Flat Loan Calculation
    // Step 1: annualInterest * 12
    const monthlyInterest = annualInterest * 12
    console.log('monthlyInterest', monthlyInterest)

    // Step 2: result * principal
    const totalInterestRaw = monthlyInterest * principal
    console.log('totalInterestRaw', totalInterestRaw)

    // Step 3: divide result by 100
    const interestPercent = totalInterestRaw / 100
    console.log('interestPercent', interestPercent)

    // Step 4: multiply by 365
    const interestPerYear = interestPercent / 365
    console.log('interestPerYear', interestPerYear)

    // Step 5: multiply by duration
    const totalInterest = interestPerYear * durationInYears
    console.log('totalInterest', totalInterest)

    return totalInterest
  } else if (loanType === 2) {
    // Diminishing Loan Calculation (EMI-based)

    const months = durationInYears * 12
    const monthlyInterestRate = annualInterest / 12 / 100

    // EMI formula: [P * R * (1 + R)^N] / [(1 + R)^N – 1]
    const numerator = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)
    const denominator = Math.pow(1 + monthlyInterestRate, months) - 1
    const emi = numerator / denominator

    // Total payment over loan period
    const totalPayment = emi * months

    // Total interest is total payment minus principal
    const totalInterest = totalPayment - principal

    return totalInterest
  } else {
    throw new Error('Invalid loan type. Use 1 for flat loan, 2 for diminishing loan.')
  }
}

export function getRemainingDaysInMonth(date: Date): number {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const totalDaysInMonth = new Date(year, month, 0).getDate()
  return totalDaysInMonth - day + 1
}

export function getDaysBetweenMonthRange(startStr: string, endStr: string): number {
  const [startMonth, startYear] = startStr.split('/').map(Number)
  const [endMonth, endYear] = endStr.split('/').map(Number)

  let totalDays = 0
  let currentMonth = startMonth
  let currentYear = startYear

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    totalDays += new Date(currentYear, currentMonth, 0).getDate()
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return totalDays
}

export function addMonthsToMonth(startStr: string, durationMonths: number): string {
  const [startMonth, startYear] = startStr.split('/').map(Number)
  const newDate = new Date(startYear, startMonth - 1 + durationMonths) // month is 0-based

  const newMonth = newDate.getMonth() + 1 // convert back to 1-based
  const newYear = newDate.getFullYear()

  return `${newMonth.toString().padStart(2, '0')}/${newYear}`
}
