export interface LoanDetails {
  loanType: number
  principal: number
  annualInterest: number
  durationInYears: number
}

export function calculateLoanInterest(details: LoanDetails): number {
  console.log('details line ----- 9', details)
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

export function getRemainingDaysInCurrentMonthOld(): number {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const lastDateOfMonth = new Date(year, month + 1, 0)

  const diffTime = lastDateOfMonth.getTime() - today.getTime()

  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  return remainingDays
}

export function getRemainingDaysInCurrentMonth(type?: number) {
  const today = new Date()

  if (type === 1) {
    // Remaining days in current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return lastDayOfMonth.getDate() - today.getDate() + 1 // Include today
  }

  if (type === 2) {
    // Remaining days in current week (assuming week starts on Sunday)
    const dayOfWeek = today.getDay() // 0 (Sun) to 6 (Sat)
    return 7 - dayOfWeek
  }

  if (type === 3) {
    return 1
  }

  return 0 // fallback if type is not 1, 2, or 3
}

interface CalaulateInterest {
  principal: number
  annualInterest: number
  totalDays: number
  interestCal?: number
}
export function CalculateInitialInterest(data: CalaulateInterest): number {
  try {
    let Interest =
      ((Number(data.principal) * (Number(data.annualInterest) * 12)) / 100 / 365) * data.totalDays
    console.log('Interest line ----- 118', Interest)
    return Interest
  } catch (error) {
    return 0
  }
}
export function CalculateInterest(data: CalaulateInterest): number {
  try {
    let Interest
    if (data.interestCal === 2) {
      Interest = (Number(data.principal) * (Number(data.annualInterest) * 12)) / 100 / 12
    } else {
      Interest =
        ((Number(data.principal) * (Number(data.annualInterest) * 12)) / 100 / 365) * data.totalDays
    }
    console.log('Interest line ----- 118', Interest)
    return Interest
  } catch (error) {
    return 0
  }
}

export function getDaysInMonths(dateStr: string, count: number): number[] {
  const date = new Date(dateStr)
  const result: number[] = []

  let year = date.getFullYear()
  let month = date.getMonth()
  for (let i = 0; i < count; i++) {
    const days = new Date(year, month + 1, 0).getDate()
    result.push(days)

    month++
    if (month > 11) {
      month = 0
      year++
    }
  }
  console.log(' -> Line Number ----------------------------------- 146')

  console.log('result line ---- 148', result)
  return result
}

export interface FirstInterest {
  Interest: number
  PrincipalAmt: number
  monthCount: number
  rePaymentDate: string
  rePaymentType: number
  loanDuration: number
  durationType?: number
  interestCal?: number
}
export const CalculateFirstInterest = (data: FirstInterest): number => {
  let daysCount
  if (data.durationType === 1) {
    daysCount = getDaysInMonths(data.rePaymentDate, data.monthCount)
  } else if (data.durationType === 2) {
    daysCount = Array.from({ length: data.monthCount }, () => 7)
  } else if (data.durationType === 3) {
    daysCount = Array.from({ length: data.monthCount }, () => 1)
  }

  if (data.rePaymentType === 1 || data.rePaymentType === 3) {
    const totalDays = daysCount.reduce((sum, val) => sum + val, 0)

    const interestData = {
      principal: data.PrincipalAmt,
      annualInterest: data.Interest,
      totalDays: totalDays,
      interestCal: data.durationType !== 1 ? 0 : data.interestCal
    }
    const Interest = CalculateInterest(interestData)
    return Interest
  } else if (data.rePaymentType === 2) {
    const monthPrincipal = data.PrincipalAmt / data.loanDuration
    let LoanAmount = data.PrincipalAmt
    let totalInterest = 0

    for (let i = 0; i < data.monthCount; i++) {
      const interestData = {
        principal: LoanAmount,
        annualInterest: data.Interest,
        totalDays: daysCount[i],
        interestCal: data.durationType !== 1 ? 0 : data.interestCal
      }
      const Interest = CalculateInterest(interestData)
      totalInterest += Interest
      LoanAmount -= monthPrincipal
    }

    return totalInterest
  } else {
    throw new Error('Repayment Type Is Wrong') // Better than returning string on wrong type
  }
}
