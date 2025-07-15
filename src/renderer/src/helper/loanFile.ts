// import { u } from 'framer-motion/dist/types.d-6pKw1mTI'
import { getSettingData } from './SettingsData'

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

export async function getRemainingDaysInCurrentMonth(
  type?: number,
  date: Date = new Date()
): Promise<number> {
  const today = new Date(date)

  if (type === 1) {
    // Monthly - remaining days in current month (including today)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return lastDayOfMonth.getDate() - today.getDate() + 1
  }

  if (type === 2) {
    // Weekly - based on custom week start/end
    const settingsData = await getSettingData()
    const weekStartEnd = settingsData?.weekStartEnd?.split(',') || []

    if (weekStartEnd.length !== 2) return 0

    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    }

    const todayDay = today.getDay()
    const startDay = dayMap[weekStartEnd[0]]
    const endDay = dayMap[weekStartEnd[1]]

    const totalDaysInWeek = ((endDay - startDay + 7) % 7) + 1
    const offsetFromStart = (todayDay - startDay + 7) % 7

    return totalDaysInWeek - offsetFromStart
  }

  if (type === 3) {
    // Daily
    return 1
  }

  return 0
}

export function getDaysInCurrentMonth(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const lastDayOfMonth = new Date(year, month + 1, 0)
  return lastDayOfMonth.getDate()
}

export function getTotalDaysFromNextMonth(monthCount: number): number {
  const today = new Date()
  const startMonth = today.getMonth() + 1
  const startYear = today.getFullYear()

  let totalDays = 0

  for (let i = 0; i < monthCount; i++) {
    const month = (startMonth + i) % 12
    const year = startYear + Math.floor((startMonth + i) / 12)

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    totalDays += daysInMonth
  }

  return totalDays
}

interface CalaulateInterest {
  principal: number
  annualInterest: number
  totalDays: number
  interestCal?: number
  loanDuration?: number
  loanDueType?: number
  monthlyInterest?: number
  duration?: number
}
export function CalculateInitialInterest(data: CalaulateInterest): number {
  console.log('data line ----- 198', data)
  try {
    let Interest
    if (data.interestCal === 2) {
      let temp1 = (Number(data.principal) * Number(data.annualInterest) * 12) / 100 / 12
      temp1 = Number(temp1) / Number(getDaysInCurrentMonth())
      Interest = temp1 * data.totalDays
    } else {
      Interest =
        ((Number(data.principal) * Number(data.annualInterest) * 12) / 100 / 365) * data.totalDays
      console.log('Interest line ----- 208', Interest)
    }

    return Math.round(Interest)
  } catch (error) {
    return 0
  }
}

export function calculateInitialInterest(data: CalaulateInterest): number {
  try {
    const formula = (Number(data.principal) * Number(data.annualInterest)) / 100
    const dayCalculation = (days: number) => {
      const cal1 = (formula / days) * data.totalDays
      return cal1
    }
    const overAllCalculation = (days: number) => {
      if (data.loanDuration) {
        const cal1 = formula / Number(data.loanDuration) / Number(days)
        const cal2 = cal1 * data.totalDays
        return cal2
      }

      return 0 // or null, undefined, or throw error, depending on your use case
    }

    if (data.loanDueType === 1) {
      const cal =
        data.interestCal === 2
          ? overAllCalculation(getDaysInCurrentMonth())
          : dayCalculation(getTotalDaysFromNextMonth(Number(data.loanDuration)))
      return Number(cal)
    } else if (data.loanDueType === 2) {
      const cal =
        data.interestCal === 2
          ? overAllCalculation(7)
          : dayCalculation(Number(data.loanDuration) * 7)
      return Number(cal)
    } else if (data.loanDueType === 3) {
      const cal = data.interestCal === 2 ? overAllCalculation(1) : dayCalculation(1)
      return Number(cal)
    } else {
      console.log('Invalid Loan Due Type is Passed')
      return 0
    }
  } catch (error) {
    return 0
  }
}
export function CalculateInterest(data: CalaulateInterest): number {
  try {
    let Interest
    if (data.interestCal === 2) {
      Interest = (Number(data.principal) * Number(data.annualInterest)) / 100 / 12
    } else {
      Interest =
        ((Number(data.principal) * Number(data.annualInterest)) / 100 / 365) * data.totalDays
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
  date?: Date
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

  console.log('daysCount', daysCount)

  const dayCalculation = (
    priAmt: Number,
    interest: Number,
    totalDays: number,
    daysInDue: number
  ) => {
    const formula = (Number(priAmt) * Number(interest)) / 100
    console.log('formula', formula)
    const cal1 = (formula / totalDays) * daysInDue
    console.log('cal1', cal1)
    return cal1
  }
  const overAllCalculation = (priAmt: Number, interest: Number) => {
    if (data.loanDuration) {
      const formula = (Number(priAmt) * Number(interest)) / 100
      const cal1 = formula / Number(data.loanDuration)
      return cal1
    } else {
      return 0
    }
  }

  if (data.rePaymentType === 1) {
    const totalDays = daysCount.reduce((sum, val) => sum + val, 0)
    console.log('totalDays line ----- 327', totalDays)
    console.log('data.interestCal', data.interestCal)
    console.log(
      'getTotalDaysFromNextMonth(data.loanDuration)',
      getTotalDaysFromNextMonth(data.loanDuration)
    )

    const Interest =
      data.interestCal === 2
        ? overAllCalculation(data.PrincipalAmt, data.Interest) * totalDays.length()
        : dayCalculation(
            data.PrincipalAmt,
            data.Interest,
            getTotalDaysFromNextMonth(data.loanDuration),
            totalDays
          )

    console.log('Interest line -------- 339', Interest)
    console.log('Interest', Interest)
    return Math.round(Interest)
  } else if (data.rePaymentType === 2) {
    const monthPrincipal = data.PrincipalAmt / data.loanDuration
    let LoanAmount = data.PrincipalAmt
    let totalInterest = 0

    for (let i = 0; i < data.monthCount; i++) {
      const Interest =
        data.interestCal === 2
          ? overAllCalculation(Number(LoanAmount), data.Interest)
          : dayCalculation(
              Number(LoanAmount),
              data.Interest,
              getTotalDaysFromNextMonth(data.loanDuration),
              daysCount[i]
            )

      totalInterest += Interest
      LoanAmount -= monthPrincipal
    }

    return Math.round(totalInterest)
  } else if (data.rePaymentType === 3) {
    const Interest =
      data.interestCal === 2
        ? overAllCalculation(data.PrincipalAmt, data.Interest) * data.monthCount
        : dayCalculation(
            data.PrincipalAmt,
            data.Interest,
            getTotalDaysFromNextMonth(data.loanDuration),
            data.monthCount
          )

    console.log('Interest', Interest)
    return Math.round(Interest)
  } else {
    throw new Error('Repayment Type Is Wrong')
  }
}

// ------------------ Interest Calculation Version 2

function getDayOfWeekNumber(dayName: string): number {
  const daysMap: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  }
  return daysMap[dayName]
}

export async function getDayCountFromDueType(dueType: number, duration: number, todayDate?: Date) {
  const today = todayDate ?? new Date()
  let startDate: Date
  let endDate: Date

  switch (dueType) {
    case 1: // Month
      startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + duration, 0)
      break

    case 2: // Week (Custom start-end like ["Monday", "Sunday"])
      const settingData = await getSettingData()
      if (!settingData.weekStartEnd) {
        throw new Error('weekStartEnd is required for weekly dueType.')
      }
      const weekDays = settingData?.weekStartEnd.split(',')

      const [startDayName, endDayName] = weekDays
      const startDay = getDayOfWeekNumber(startDayName)
      const endDay = getDayOfWeekNumber(endDayName)

      const todayDay = today.getDay() // 0 (Sun) - 6 (Sat)
      const daysUntilNextStart = (7 + startDay - todayDay) % 7 || 7 // Days until next start day

      startDate = new Date(today)
      startDate.setDate(today.getDate() + daysUntilNextStart)

      // Total days to cover the given number of weeks
      const daysInOneWeek = ((7 + endDay - startDay) % 7) + 1 // E.g. Monday to Sunday = 7

      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + daysInOneWeek * duration - 1)
      break

    case 3: // Days
      startDate = new Date(today)
      startDate.setDate(today.getDate() + 1)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + duration - 1)
      break

    default:
      throw new Error('Invalid dueType. Must be 1 (Month), 2 (Week), or 3 (Days).')
  }

  // Difference in days (inclusive)
  const diffInTime = endDate.getTime() - startDate.getTime()
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24)) + 1

  return diffInDays
}

export async function getCurrentPeriodDayStats(
  loanDueType: number,
  todayDate?: Date
): Promise<{ totalDays: number; completedDays: number }> {
  const today = todayDate ?? new Date()
  let startDate: Date
  let endDate: Date

  switch (loanDueType) {
    case 1: {
      // Month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    }

    case 2: {
      // Week (custom start and end from settings)
      const settingsData = await getSettingData() // get weekStartEnd like "Monday,Sunday"
      const [startDayName, endDayName] = settingsData?.weekStartEnd
        ?.split(',')
        .map((d) => d.trim()) ?? ['Sunday', 'Saturday']

      const startDay = getDayOfWeekNumber(startDayName)
      const endDay = getDayOfWeekNumber(endDayName)
      const todayDay = today.getDay()

      const daysFromStart = (7 + todayDay - startDay) % 7
      startDate = new Date(today)
      startDate.setDate(today.getDate() - daysFromStart)

      const daysInWeek = ((7 + endDay - startDay) % 7) + 1
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + daysInWeek - 1)
      break
    }

    case 3: {
      // Single day range
      startDate = new Date(today)
      endDate = new Date(today)
      break
    }

    default:
      throw new Error('Invalid loanDueType. Must be 1 (Month), 2 (Week), or 3 (Day).')
  }

  const totalDays =
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const completedDays =
    today >= startDate
      ? Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0

  return { totalDays, completedDays }
}

export async function getDaysInMonthsForFirstPay(
  dateStr: string,
  count: number
): Promise<number[]> {
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
  return result
}

export interface interestCal {
  loanAmount?: number
  interest?: number
  interestMonth?: number
  loanDueType?: number
  duration?: number
  rePaymentType?: number
  interestCalType?: number
  rePaymentDate?: string
  todayDate?: Date
}

export const dayWiseCalculation = async (data: interestCal) => {
  if (
    data.loanAmount === undefined ||
    data.interest === undefined ||
    data.duration === undefined ||
    data.loanDueType === undefined
  ) {
    throw new Error('Missing required fields for calculation')
  }

  const cal1 = (data.loanAmount * (data.interest * data.duration)) / 100
  const totalDays = await getDayCountFromDueType(data.loanDueType, data.duration, data.todayDate)
  const cal2 = cal1 / totalDays
  return cal2
}

export const overAllCalculation = async (data: interestCal) => {
  if (data.loanAmount === undefined || data.interest === undefined || data.duration === undefined) {
    throw new Error('Missing required fields for calculation')
  }
  const cal1 = (data.loanAmount * (data.interest * data.duration)) / 100 / data.duration
  return cal1
}

export const calInitialInterest = async (data: interestCal) => {
  if (data.loanDueType === undefined) {
    throw new Error('Missing required fields for calculation')
  }
  const interest =
    data.interestCalType === 2 ? await overAllCalculation(data) : await dayWiseCalculation(data)
  console.log('interest line ------ 579', interest)
  const days = await getCurrentPeriodDayStats(data.loanDueType, data.todayDate)
  console.log('days', days)
  const interest1 = data.interestCalType === 2 ? interest / days.totalDays : interest
  console.log('interest1', interest1)
  const cal = interest1 * (days.totalDays - days.completedDays)
  console.log('cal', cal)
  return cal
}

export const calInterestPayFirst = async (data: interestCal): Promise<number> => {
  console.log('data', data)
  try {
    if (
      data.loanAmount === undefined ||
      data.interest === undefined ||
      data.duration === undefined ||
      data.rePaymentDate === undefined ||
      data.interestMonth === undefined
    ) {
      throw new Error('Missing required fields for calculation')
    }

    if (data.rePaymentType === 1 || data.rePaymentType === 3) {
      const interest =
        data.interestCalType === 2 ? await overAllCalculation(data) : await dayWiseCalculation(data)

      const totalDays = await getDaysInMonthsForFirstPay(data.rePaymentDate, data.interestMonth)

      if (data.loanDueType === 1) {
        const total =
          data.interestCalType === 2
            ? data.interestMonth * interest
            : totalDays.reduce((sum, value) => sum + value, 0) * interest
        return total
      } else if (data.loanDueType === 2) {
        const total =
          data.interestCalType === 2
            ? data.interestMonth * interest
            : data.interestMonth * 7 * interest
        return total
      } else if (data.loanDueType === 3) {
        const total = data.interestMonth * interest
        return total
      } else {
        console.log('error in line -------------------- > 621')
        return 0
      }
    } else if (data.rePaymentType === 2) {
      let loanAmount = data.loanAmount
      let TotalInterest = 0
      const totalDays = await getDaysInMonthsForFirstPay(data.rePaymentDate, data.interestMonth)

      if (data.loanDueType === 1) {
        for (let i = 0; i < data.interestMonth; i++) {
          const loanAmt = data.loanAmount / data.duration
          const newData = { ...data, loanAmount: loanAmount }
          const interest =
            data.interestCalType === 2
              ? await overAllCalculation(newData)
              : await dayWiseCalculation(newData)
          const total = data.interestCalType === 2 ? interest : totalDays[i] * interest
          TotalInterest += total
          loanAmount -= loanAmt
        }
      } else if (data.loanDueType === 2) {
        for (let i = 0; i < data.interestMonth; i++) {
          const loanAmt = data.loanAmount / data.duration
          const newData = { ...data, loanAmount: loanAmount }
          const interest =
            data.interestCalType === 2
              ? await overAllCalculation(newData)
              : await dayWiseCalculation(newData)
          const total = data.interestCalType === 2 ? interest : 7 * interest
          TotalInterest += total
          loanAmount -= loanAmt
        }
      } else if (data.loanDueType === 3) {
        for (let i = 0; i < data.interestMonth; i++) {
          const loanAmt = data.loanAmount / data.duration
          const newData = { ...data, loanAmount: loanAmount }
          const interest =
            data.interestCalType === 2
              ? await overAllCalculation(newData)
              : await dayWiseCalculation(newData)
          const total = interest
          TotalInterest += total
          loanAmount -= loanAmt
        }
      } else {
        console.log('error in Loan Calculation line --------------> 668')
        return 0
      }

      return TotalInterest
    } else {
      console.log('error in Loan Interest First Calculation line ------- 672')
      return 0
    }
  } catch (error) {
    console.log('error line ------ 547', error)
    return 0 // ✅ ensures Promise<number> is fulfilled
  }
}
