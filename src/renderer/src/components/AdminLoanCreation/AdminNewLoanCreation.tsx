import axios from 'axios'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import React, { useEffect, useState } from 'react'
import { LuSquareArrowOutUpRight } from 'react-icons/lu'
import decrypt from '../Helper/Helper'
import { InputText } from 'primereact/inputtext'
import {
  formatINRCurrency,
  formatINRCurrencyText,
  parseINRInput
} from '@renderer/helper/amountFormat'
import { TiArrowBack } from 'react-icons/ti'
import { ImCalculator } from 'react-icons/im'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatToCustomDateTime, formatToDDMMYYYY } from '@renderer/helper/date'

interface options {
  label: string
  value: number
}

interface oldLoanData {
  oldLoanAmt: number
  oldInterest: number
}

interface LoanData {
  vendorId: number | null
  todayDate: Date
  loanTakenAs: number | null
  oldLoanId: number | null
  newLoanAmt: string | null
  oldLoanAmt: string | null
  oldInterestAmt: string | null
  totalLoanAmt: string | null
  paymentFlowId?: number | null
  rePaymentType?: number | null
  interestRate?: string | null
  loanDuration?: string | null
  ifPayInterestFirst?: boolean | null
  notes?: string | null
  rePaymentDate?: Date | null
  loanDueInterestAmt?: string | null
  loanPrincipalAmt?: string | null
  loanInitialInterestAmt?: string | null
  loanTotalDueAmt?: string | null
  docFee: string | null
  paidInterestCount?: string | null
  interestAmtPaidFirst?: string | null
  totalInitialInterestAmt?: string | null
  refLoanExId?: number | null
  ifFirstPay?: boolean
}

interface setLoanCalSetting {
  ifCalculationNeeded?: boolean
  ifInitialInterest?: boolean
  initialInterestCollectType?: number
  interestCalculationType?: number
  loanClosingCalculation?: number
  loanAdvanceAmtType?: number
  weekStart?: number
  weekEnd?: number
  loanDueType?: number
  dueRePaymentCollection?: number
}

interface AddNewSupplierProps {
  closeSidebarNew: () => void
}

interface LoadDetailsResponseProps {
  totalLoanAmt: string
  loanInterest: string
  loanDuration: string
  interestFirst: boolean
  initialInterest: string
  interestFirstMonth: string
  totalPrincipal: string
  totalInterest: string
  durationType: Number
  rePaymentTypeName: string
  repaymentType: number
  loanBalance: string
  loanDueCount: number
  loanDueType: number
  refIfCalculation: boolean
  oldInterest: string
  oldPrincipal: string
}

interface setDueFirstEntry {
  paidInterest?: number
  paidPrincipal?: number
  paidInitialInterest?: number
  arears?: number
}
const AdminNewLoanCreation: React.FC<AddNewSupplierProps> = ({ closeSidebarNew }) => {
  const [loanData, setLoanData] = useState<LoanData>({
    vendorId: null,
    todayDate: new Date(),
    loanTakenAs: null,
    oldLoanId: null,
    newLoanAmt: null,
    oldLoanAmt: null,
    oldInterestAmt: null,
    totalLoanAmt: null,
    rePaymentType: null,
    interestRate: null,
    loanDuration: null,
    ifPayInterestFirst: null,
    notes: null,
    rePaymentDate: null,
    loanDueInterestAmt: null,
    loanPrincipalAmt: null,
    loanInitialInterestAmt: null,
    loanTotalDueAmt: null,
    docFee: null,
    paidInterestCount: null,
    interestAmtPaidFirst: null,
    totalInitialInterestAmt: null,
    ifFirstPay: false
  })
  const [loanCalSetting, setLoanCalSetting] = useState<setLoanCalSetting>({
    ifCalculationNeeded: false,
    ifInitialInterest: true
  })
  const [oldLoanList, setOldLoanList] = useState<options[] | []>([])
  const [loadingStatus, setLoadingStatus] = useState(true)

  const [vendorList, setVendorList] = useState<options[] | []>([])
  const [showOldLoan, setShowOldLoan] = useState<boolean>(false)
  const [showLoanCalculationSetting, setShowLoanCalculationSetting] = useState<boolean>(false)
  const [interestCollectType, setInterestCollectType] = useState<options[] | []>([])
  const [loanType, setLoanType] = useState<options[] | []>([])
  const [advanceAmtList, setAdvanceAmtList] = useState<options[] | []>([])
  const [loanClosingList, setLoanClosingList] = useState<options[] | []>([])
  const [loanDuePayList, setLoanDuePayList] = useState<options[] | []>([])
  const [loanRePaymentType, setLoanRePaymentType] = useState<options[] | []>([])
  const [paymentFlowList, setPaymentFlowList] = useState<options[] | []>([])
  const [minDate, setMinDate] = useState<Date | null>()
  const [maxDate, setMaxDate] = useState<Date | null>()
  const [viewDate, setViewDate] = useState<Date | null>()
  const [viewSummary, setSummary] = useState<boolean>(false)
  const [dueFirstEntry, setDueFirstEntry] = useState<setDueFirstEntry>({
    paidInterest: 0,
    paidPrincipal: 0,
    paidInitialInterest: 0,
    arears: 0
  })
  const [loadDetailsResponse, setLoanDetailsReponse] = useState<LoadDetailsResponseProps | null>(
    null
  )

  const [summaryData1, setSummaryData1] = useState<
    { label: string; value: string | number | undefined }[]
  >([])
  const [summaryData2, setSummaryData2] = useState<
    { label: string; value: string | number | undefined }[]
  >([])

  const handelValueChange = async (data: any) => {
    console.log('data line ----- 99', data)
    let updateData
    if (data.name === 'todayDate') {
      updateData = { ...loanData, [data.name]: data.value, rePaymentDate: null }
    } else if (data.name === 'newLoanAmt') {
      updateData = {
        ...loanData,
        [data.name]: data.value,
        totalLoanAmt: String(Number(data.value) + Number(loanData.oldLoanAmt))
      }
      console.log('updateData line ----- 167', updateData)
    } else if (data.name === 'oldLoanId') {
      const bal: oldLoanData = await getLoanEntireDetails(data.value)
      console.log('bal line ----- 169', bal)
      updateData = {
        ...loanData,
        [data.name]: data.value,
        oldLoanAmt: String(bal.oldLoanAmt),
        oldInterestAmt: String(bal.oldInterest),
        totalLoanAmt: Number(loanData.newLoanAmt) + Number(bal)
      }
      console.log('updateData line ------- 170', updateData)
    } else {
      updateData = { ...loanData, [data.name]: data.value }
    }

    setLoanData(updateData)
  }
  const handelFirstDueEntry = async (data: any) => {
    console.log('data line ----- 142', data)

    const updateData = {
      ...dueFirstEntry,
      [data.name]: data.value
    }

    setDueFirstEntry(updateData)
  }

  const interestCalculationType = [
    { label: 'DayWise Calculation', value: 1 },
    { label: 'Overall Calculation', value: 2 },
    { label: 'Month TO Day Calculation', value: 3 }
  ]
  const dueInterestFirstOption = [
    { label: 'YES', value: true },
    { label: 'NO', value: false }
  ]
  const daysOfWeek = [
    { label: 'Sunday', value: 'Sunday', code: 1 },
    { label: 'Monday', value: 'Monday', code: 2 },
    { label: 'Tuesday', value: 'Tuesday', code: 3 },
    { label: 'Wednesday', value: 'Wednesday', code: 4 },
    { label: 'Thursday', value: 'Thursday', code: 5 },
    { label: 'Friday', value: 'Friday', code: 6 },
    { label: 'Saturday', value: 'Saturday', code: 7 }
  ]
  const durationType = [
    { label: 'Monthly', value: 1 },
    { label: 'Weekly', value: 2 },
    { label: 'Daily', value: 3 }
  ]

  const getOldLoan = async (id: number) => {
    console.log(' -> Line Number ----------------------------------- 188')
    if (!loanData.vendorId) {
      throw Error
    }
    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/adminLoan/addLoanOption',
          {
            userId: id
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          localStorage.setItem('token', 'Bearer ' + data.token)
          console.log('data line ----------- 203', data)

          if (data.success) {
            const options = data.data.map((d: any) => ({
              label: `Loan Amt : ${d.refLoanAmount} - Interest : ${d.refLoanInterest} - Duration : ${d.refLoanDuration} ${
                d.refProductDurationType === 1
                  ? 'Month'
                  : d.refProductDurationType === 2
                    ? 'Weeks'
                    : 'Days'
              }`,
              value: d.refLoanId
            }))
            console.log('options line ------ 227', options)
            setOldLoanList(options)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const handelLoanSettingChange = async (data: any) => {
    console.log('data', data)
    let updateData
    if (data.name === 'weekStart') {
      updateData = {
        ...loanCalSetting,
        [data.name]: data.value,
        weekEnd: data.value === 1 ? 7 : data.value - 1
      }
    } else {
      updateData = { ...loanCalSetting, [data.name]: data.value }
    }
    setLoanCalSetting(updateData)
    if (data.name === 'loanDueType') {
      getDateRange(data.value)
    }
  }

  const getLoanOptions = async () => {
    try {
      await axios
        .get(import.meta.env.VITE_API_URL + '/AdminNewLoanCreation/loanOptions', {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          localStorage.setItem('token', 'Bearer ' + data.token)

          console.log('data line ------- 222', data)
          if (data.success) {
            const data1 = data.data.vendorList.map((data) => {
              return {
                label: `${data.refVendorTypeName} | ${data.refVendorName} | ${data.refVendorMobileNo}`,
                value: data.refVendorId
              }
            })
            setVendorList(data1)
            const data2 = data.data.InterestCollectType.map((data) => {
              return { label: data.refInterestCalName, value: data.refInterestCalId }
            })
            setInterestCollectType(data2)
            const data3 = data.data.loanType.map((data) => {
              return { label: data.refLoanType, value: data.refLoanTypeId }
            })
            setLoanType(data3)
            const data4 = data.data.advanceAmtList.map((data) => {
              return { label: data.refLoanAdvanceCalType, value: data.refLoanAdvanceCalId }
            })
            setAdvanceAmtList(data4)
            const data5 = data.data.loanClosingList.map((data) => {
              return { label: data.refLoanClosingCalType, value: data.refLoanClosingCalId }
            })
            setLoanClosingList(data5)
            const data6 = data.data.loanDuePayList.map((data) => {
              return { label: data.refDueTypes, value: data.refDueTypeId }
            })
            console.log(' -> Line Number ----------------------------------- 210')
            console.log('data6 line ------ 210', data6)
            setLoanDuePayList(data6)
            const data7 = data.data.loanRePaymentType.map((data) => {
              return { label: data.refRepaymentTypeName, value: data.refRepaymentTypeId }
            })
            setLoanRePaymentType(data7)
            const data8 = data.data.paymentFlowList.map((data) => {
              return {
                label: `${data.refBankName} ${data.refBankAccountNo ? `| ${data.refBankAccountNo}` : ''}`,
                value: data.refBankId
              }
            })
            setPaymentFlowList(data8)
            console.log('data8', data6)
            setLoadingStatus(false)
          }
        })
    } catch (error) {
      console.error('Error fetching loan options:', error)
    }
  }

  function getNextWeekRange(startDay: string, endDay: string) {
    const daysOfWeek: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    }

    const today = new Date(loanData.todayDate ?? new Date())
    const currentDay = today.getDay()

    const startOffset = (7 + daysOfWeek[startDay] - currentDay) % 7 || 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + startOffset)

    const endOffset = (7 + daysOfWeek[endDay] - daysOfWeek[startDay]) % 7
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + endOffset)

    return { startDate, endDate }
  }
  const getDateRange = async (todayDate: Date | any, dueType?: number) => {
    const today = new Date(todayDate ?? new Date())
    const durationType = dueType ?? loanCalSetting?.loanDueType ?? 1
    switch (durationType) {
      case 1:
        setMinDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        setMaxDate(new Date(today.getFullYear(), today.getMonth() + 2, 0))
        setViewDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        break
      case 2:
        const settingData = `${loanCalSetting?.weekStart},${loanCalSetting?.weekEnd}`
        const weekData = settingData.split(',')
        if (weekData && weekData.length === 2) {
          const { startDate, endDate } = getNextWeekRange(weekData[0], weekData[1])
          setMinDate(startDate)
          setMaxDate(endDate)
          setViewDate(startDate)
        } else {
          // Fallback logic if setting is missing or invalid
          console.warn('Invalid or missing weekStartEnd. Using default Monday–Sunday.')
          const { startDate, endDate } = getNextWeekRange('Monday', 'Sunday')
          setMinDate(startDate)
          setMaxDate(endDate)
          setViewDate(startDate)
        }

        break

      case 3:
        const nextDay = new Date(today)
        nextDay.setDate(today.getDate() + 1)
        setMinDate(nextDay)
        setMaxDate(nextDay)
        setViewDate(nextDay)
        break

      default:
        setMinDate(null)
        setMaxDate(null)
        setViewDate(null)
    }
  }

  function formatLabel(key: string) {
    return key
      .replace(/([A-Z])/g, ' $1') // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
  }

  const loanSummary = async () => {
    let responseData

    if (loanCalSetting?.ifCalculationNeeded) {
      const weekStart =
        daysOfWeek.find((data) => loanCalSetting.weekStart === data.code)?.value || ''
      const weekEnd = daysOfWeek.find((data) => loanCalSetting.weekEnd === data.code)?.value || ''
      const weekStartEnd = `${weekStart},${weekEnd}`

      console.log('weekStartEnd line ------ 309', weekStartEnd)
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminNewLoanCreation/CalculateDueAmount',
          {
            todayDate: formatToCustomDateTime(loanData.todayDate),
            loanAmt: Number(loanData.totalLoanAmt),
            oldPrincipal: Number(loanData.oldLoanAmt),
            oldInterest: Number(loanData.oldInterestAmt),
            interest: Number(loanData.interestRate),
            duration: Number(loanData.loanDuration),
            rePaymentType: Number(loanData.rePaymentType),
            initialInterestPayType: Number(loanCalSetting.initialInterestCollectType),
            dueType: Number(loanCalSetting.loanDueType),
            ifInitialInterest: loanCalSetting.ifInitialInterest,
            ifInterestFirstPaid: loanData.ifPayInterestFirst,
            durationCountFirstPay: loanData.paidInterestCount,
            weekStartEnd: weekStartEnd,
            interestCalType: Number(loanCalSetting.interestCalculationType)
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          console.log('data line ------ 340', data)
          localStorage.setItem('token', 'Bearer ' + data.token)
          if (data.success) {
            setLoanData({
              ...loanData,
              loanDueInterestAmt: String(Math.round(data.dueRePaymentData.interest)),
              loanPrincipalAmt: String(Math.round(data.dueRePaymentData.principal)),
              loanInitialInterestAmt: String(Math.round(data.TotalInitialInterest)),
              totalInitialInterestAmt: String(Math.round(data.TotalInitialInterest)),
              interestAmtPaidFirst: String(Math.round(data.DueInterestPaidFirstAmt))
            })
            responseData = {
              loanDueInterestAmt: String(Math.round(data.dueRePaymentData.interest)),
              loanPrincipalAmt: String(Math.round(data.dueRePaymentData.principal)),
              loanInitialInterestAmt: String(Math.round(data.TotalInitialInterest)),
              totalInitialInterestAmt: String(Math.round(data.TotalInitialInterest)),
              interestAmtPaidFirst: String(Math.round(data.DueInterestPaidFirstAmt))
            }
          }
        })
    }

    setSummary(true)
    console.log('loanData line ------ 480', loanData)
    const summaryData = {
      Name: (() => {
        const matchedVendor = vendorList.find((data) => data.value === loanData.vendorId)
        return matchedVendor ? matchedVendor.label.split('|')[1] : ''
      })(),
      VendorType: (() => {
        const matchedVendor = vendorList.find((data) => data.value === loanData.vendorId)
        return matchedVendor ? matchedVendor.label.split('|')[0] : ''
      })(),
      NewLoanAmount: formatINRCurrency(Number(loanData.newLoanAmt)),
      OldInterest: formatINRCurrency(Number(loanData.oldInterestAmt)),
      OldPrincipal: formatINRCurrency(Number(loanData.oldLoanAmt)),
      TotalLoanAmount: formatINRCurrency(Number(loanData.totalLoanAmt)),
      Interest: `${loanData.interestRate} %`,
      Duration: `${loanData.loanDuration} ${loanCalSetting?.loanDueType === 1 ? 'Months' : loanCalSetting?.loanDueType === 2 ? 'Weeks' : 'Days'}`,
      LoanGivenDate: String(formatToDDMMYYYY(loanData.todayDate))
    }

    const summaryDataRowWise = Object.entries(summaryData).map(([key, value]) => ({
      label: formatLabel(key),
      value: value ?? '-'
    }))

    setSummaryData1(summaryDataRowWise)
    console.log('loanCalSetting?.ifCalculationNeeded', loanCalSetting?.ifCalculationNeeded)

    const summaryData2 = {
      LoanCalculation: `${loanCalSetting?.ifCalculationNeeded ? 'System Calculation' : 'Manual Calculation'}`,
      LoanType: (() => {
        const matchedLoanType = loanRePaymentType.find(
          (data) => data.value === loanData.rePaymentType
        )
        return matchedLoanType ? matchedLoanType.label : ''
      })(),
      InitialInterest: loanCalSetting?.ifInitialInterest ? 'YES' : 'NO',
      TotalInitialInterest: formatINRCurrency(
        loanCalSetting?.ifCalculationNeeded
          ? responseData.totalInitialInterestAmt
          : loanData.loanInitialInterestAmt
      ),

      InterestPaidFirst: loanData.ifPayInterestFirst ? 'YES' : 'NO',
      NumberOfDuePaid: loanData.paidInterestCount,
      DueInterestPaidFirst: formatINRCurrency(
        Number(
          loanCalSetting?.ifCalculationNeeded
            ? responseData.interestAmtPaidFirst
            : loanData.interestAmtPaidFirst
        )
      ),
      TotalAdvanceDueAmount: formatINRCurrency(
        Number(
          loanCalSetting?.ifCalculationNeeded
            ? responseData.interestAmtPaidFirst
            : loanData.interestAmtPaidFirst
        ) +
          Number(
            loanCalSetting?.ifCalculationNeeded
              ? responseData.totalInitialInterestAmt
              : loanData.loanInitialInterestAmt
          )
      ),
      DocumentationFee: formatINRCurrency(Number(loanData.docFee))
    }
    const summaryDataRowWise2 = Object.entries(summaryData2).map(([key, value]) => ({
      label: formatLabel(key),
      value: value ?? '-'
    }))

    setSummaryData2(summaryDataRowWise2)
  }

  const getLoanEntireDetails = async (value?: number): Promise<oldLoanData> => {
    console.log('value line ------ 537', value)
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminLoan/selectedLoanDetails',
        {
          loanId: value,
          loanTypeId: loanData.loanTakenAs,
          todayDate: loanData.todayDate ?? undefined
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      console.log('data line ------- 194', data.data)

      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success) {
        setLoanDetailsReponse(data.data)

        const oldData = {
          oldLoanAmt: Number(data.data.oldPrincipal),
          oldInterest: Number(data.data.oldInterest)
        }
        return oldData
      } else {
        const oldData = {
          oldLoanAmt: 0,
          oldInterest: 0
        }
        return oldData
      }
    } catch (error) {
      console.log('error line ------- 544', error)
      const oldData = {
        oldLoanAmt: 0,
        oldInterest: 0
      }
      return oldData
    }
  }

  const handelSubmit = async () => {
    const weekStart =
      daysOfWeek.find((data) => loanCalSetting?.weekStart === data.code)?.value || ''

    const weekEnd = daysOfWeek.find((data) => loanCalSetting?.weekEnd === data.code)?.value || ''

    const loanSetting = { ...loanCalSetting, weekStartDay: weekStart, weekEndDay: weekEnd }

    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminNewLoanCreation/createNewLoan',
          {
            loanData: loanData,
            loanSettingData: loanSetting,
            firstDueEntry: dueFirstEntry
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          console.log('data line ------ 278', data)
          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            closeSidebarNew()
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    getLoanOptions()
    getDateRange(new Date(), loanCalSetting?.loanDueType ?? 1)
  }, [])

  return (
    <div>
      {loadingStatus ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#f8d20f',
            height: '92vh',
            width: '100%'
          }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
        </div>
      ) : (
        <div>
          {!viewSummary && (
            <div className="flex flex-col gap-y-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  loanSummary()
                }}
              >
                <div>
                  <b className="text-[1.1rem]">Mark the Taken Loan</b>
                </div>
                <div className="flex justify-between gap-x-5">
                  <div className="flex-3">
                    <label>
                      {' '}
                      <b>Select Vendor</b>{' '}
                    </label>
                    <Dropdown
                      value={loanData?.vendorId}
                      onChange={(e: DropdownChangeEvent) => {
                        handelValueChange(e.target)

                        getOldLoan(e.target.value)
                      }}
                      filter
                      options={vendorList}
                      required
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Vendor Who Give Loan"
                      className="w-full"
                      name="vendorId"
                      checkmark={true}
                      highlightOnSelect={true}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <label>
                      {' '}
                      <b>Select Loan Taken Date</b>{' '}
                    </label>
                    <Calendar
                      id="buttondisplay"
                      value={loanData.todayDate}
                      name="todayDate"
                      onChange={async (e) => {
                        await handelValueChange(e.target)
                        getDateRange(e.target.value, loanCalSetting?.loanDueType ?? 1)
                      }}
                      maxDate={new Date()}
                      required
                      showIcon
                      style={{ padding: '0px' }}
                      className="p-0"
                      dateFormat={'dd/mm/yy'}
                    />
                  </div>
                </div>
                <div className="flex justify-between gap-x-5">
                  <div className="flex-1">
                    <label>
                      {' '}
                      <b>Select Loan Taken As</b>{' '}
                    </label>
                    <Dropdown
                      value={loanData?.loanTakenAs}
                      onChange={(e: DropdownChangeEvent) => {
                        handelValueChange(e.target)
                        if (loanData.vendorId && e.target.value !== 1) {
                          getOldLoan(loanData.vendorId)
                        } else {
                          const temp = { ...loanData, loanTakenAs: e.target.value, oldLoanId: null }
                          setLoanData(temp)
                        }
                      }}
                      options={loanType}
                      required
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Loan Taken As "
                      className="w-full"
                      name="loanTakenAs"
                      checkmark={true}
                      highlightOnSelect={true}
                    />
                  </div>
                  <div className="flex-1">
                    <label>
                      {' '}
                      <b>Select Old Loan Details</b>{' '}
                    </label>
                    <Dropdown
                      value={loanData?.oldLoanId}
                      onChange={(e: DropdownChangeEvent) => {
                        console.log('\n\n\n\n=========\n\ne', e)
                        handelValueChange(e.target)
                      }}
                      filter
                      disabled={loanData.loanTakenAs === 1}
                      options={oldLoanList}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Old Loan to Taken"
                      className="w-full"
                      name="oldLoanId"
                      checkmark={true}
                      highlightOnSelect={true}
                    />
                  </div>
                </div>
                <Divider className="my-2" />
                <div className="flex gap-x-4 justify-end">
                  <div>
                    <Button
                      className="py-1 px-5 flex gap-x-2"
                      disabled={loanData?.oldLoanId === null || loanData?.oldLoanId === undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        setShowOldLoan(true)
                      }}
                    >
                      View Old Loan Details <LuSquareArrowOutUpRight />
                    </Button>
                  </div>
                  <div>
                    <Button
                      className="py-1 px-5 flex gap-x-2"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowLoanCalculationSetting(true)
                      }}
                    >
                      Loan Calculation Configuration <LuSquareArrowOutUpRight />
                    </Button>
                  </div>
                </div>
                <Divider className="my-2" />

                <div className="flex gap-x-5">
                  <div className="flex-1">
                    <label>
                      {' '}
                      <b>Select Repayment Type</b>{' '}
                    </label>
                    <Dropdown
                      value={loanData?.rePaymentType}
                      required
                      onChange={(e: DropdownChangeEvent) => {
                        handelValueChange(e.target)
                        if (e.target.value === 3) {
                          setLoanData({
                            ...loanData,

                            loanDuration: '1',
                            rePaymentType: e.target.value
                          })
                        }
                      }}
                      //   filter
                      options={loanRePaymentType}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Repayment Type"
                      className="w-full"
                      name="rePaymentType"
                      checkmark={true}
                      highlightOnSelect={true}
                    />
                  </div>
                  <div className="flex-1 flex gap-x-5">
                    <div className="flex-1 ">
                      <label>
                        {' '}
                        <b>Enter Loan Interest %</b>{' '}
                        <InputText
                          value={loanData?.interestRate}
                          required
                          onChange={(e) => {
                            handelValueChange(e.target)
                          }}
                          placeholder="Enter Loan Interest %"
                          className="w-full"
                          name="interestRate"
                        />
                      </label>
                    </div>
                    {loanData.rePaymentType !== 3 && (
                      <>
                        <div className="flex-1">
                          <label>
                            {' '}
                            <b>Enter Loan Duration</b>{' '}
                            <InputText
                              value={loanData?.loanDuration}
                              required
                              onChange={(e) => {
                                handelValueChange(e.target)
                              }}
                              placeholder="Enter Loan Duration"
                              className="w-full"
                              name="loanDuration"
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-5">
                  <div className="flex-1 flex gap-x-3">
                    <div className="flex-1">
                      <label htmlFor="currency-india" className="font-bold block">
                        Enter Loan Amount
                      </label>
                      <InputText
                        // type="number"
                        value={formatINRCurrencyText(Number(loanData.newLoanAmt))}
                        required
                        placeholder="Enter Loan Amount"
                        onChange={(e) => {
                          const numberValue = parseINRInput(e.target.value)
                          handelValueChange({ name: 'newLoanAmt', value: numberValue })
                        }}
                        keyfilter="money"
                      />{' '}
                    </div>
                    {Number(loanData.oldLoanId) > 0 && (
                      <div className="flex flex-2 gap-x-3">
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Old Interest
                          </label>
                          <InputText
                            disabled={loadDetailsResponse?.refIfCalculation}
                            required
                            name="oldInterestAmt"
                            value={formatINRCurrencyText(Number(loanData.oldInterestAmt))}
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({ name: 'oldInterestAmt', value: numberValue })
                            }}
                            placeholder="Enter Old Interest Amount"
                            keyfilter="money"
                          />{' '}
                        </div>
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Old Principal
                          </label>
                          <InputText
                            disabled={loadDetailsResponse?.refIfCalculation}
                            required
                            name="oldLoanAmt"
                            value={formatINRCurrencyText(Number(loanData.oldLoanAmt))}
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({ name: 'oldLoanAmt', value: numberValue })
                            }}
                            placeholder="Enter Loan Amount"
                            keyfilter="money"
                          />{' '}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label>
                      {' '}
                      <b>Select Amount Transfer To</b>{' '}
                    </label>
                    <Dropdown
                      value={loanData?.paymentFlowId}
                      required
                      onChange={(e: DropdownChangeEvent) => {
                        handelValueChange(e.target)
                      }}
                      //   filter
                      options={paymentFlowList}
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Amount Transfer To"
                      className="w-full"
                      name="paymentFlowId"
                      checkmark={true}
                      highlightOnSelect={true}
                    />
                  </div>
                </div>
                <div className="flex gap-x-5">
                  <div className="flex-1">
                    <label className="font-bold block mb-2">Select Loan Re-Payment Date</label>
                    <Calendar
                      placeholder="Repayment Schedule Date"
                      required
                      // disabled={step < 4}
                      dateFormat="dd/mm/yy"
                      className="w-full"
                      value={loanData?.rePaymentDate}
                      name="rePaymentDate"
                      onFocus={async () => {
                        await getDateRange(loanData.todayDate, loanCalSetting?.loanDueType ?? 1)
                      }}
                      onChange={async (e: any) => {
                        handelValueChange(e.target)
                      }}
                      minDate={minDate ?? undefined}
                      maxDate={maxDate ?? undefined}
                      viewDate={viewDate}
                    />
                  </div>
                  <div className="flex-1 flex gap-x-5">
                    <div className="flex-1">
                      <label htmlFor="currency-india" className="font-bold block">
                        Due Interest First
                      </label>
                      <Dropdown
                        value={loanData?.ifPayInterestFirst}
                        onChange={(e: DropdownChangeEvent) => {
                          if (!e.target.value) {
                            setLoanData({
                              ...loanData,
                              [e.target.name]: e.target.value,
                              paidInterestCount: null,
                              interestAmtPaidFirst: null
                            })
                          } else {
                            handelValueChange(e.target)
                          }
                        }}
                        //   filter
                        options={dueInterestFirstOption}
                        required
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Due Interest First"
                        className="w-full"
                        name="ifPayInterestFirst"
                        checkmark={true}
                        highlightOnSelect={true}
                      />
                    </div>
                    {Number(loanData.oldLoanId) > 0 && (
                      <div className="flex-1">
                        <label className="font-bold block">No Of Due Interest Paid</label>
                        <InputText
                          type="number"
                          disabled={!loanData.ifPayInterestFirst}
                          required
                          value={loanData?.paidInterestCount}
                          placeholder="Number of Due Interest Paid"
                          name="paidInterestCount"
                          onChange={(e) => {
                            handelValueChange(e.target)
                          }}
                        />{' '}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-x-5">
                  <div className="flex-1">
                    <label className="font-bold block">Enter Documentation Fees</label>
                    <InputText
                      // type="number"
                      value={formatINRCurrencyText(Number(loanData.docFee))}
                      placeholder="Enter Documentation Fees"
                      required
                      onChange={(e) => {
                        const numberValue = parseINRInput(e.target.value)
                        handelValueChange({ name: 'docFee', value: numberValue })
                      }}
                      // keyfilter="money"
                    />{' '}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="currency-india" className="font-bold block">
                      Notes (or) Security
                    </label>
                    <InputText
                      value={loanData.notes}
                      required
                      placeholder="Enter Notes (or) Security"
                      name="notes"
                      onChange={(e) => {
                        handelValueChange(e.target)
                      }}
                    />{' '}
                  </div>
                </div>
                {!loanCalSetting?.ifCalculationNeeded && (
                  <div className="flex flex-col gap-y-1">
                    <Divider className="my-2" />
                    <p className="my-2">
                      <b>Due Re-Payment Details</b>
                    </p>
                    <div className="flex w-full gap-x-5">
                      <div className="flex-1 flex gap-x-5">
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Due Interest Amount
                          </label>
                          <InputText
                            // type="number"
                            value={formatINRCurrencyText(Number(loanData.loanDueInterestAmt))}
                            placeholder="Due Interest Amount"
                            name="loanDueInterestAmt"
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({ name: 'loanDueInterestAmt', value: numberValue })
                            }}
                            keyfilter="money"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Due Principal Amount
                          </label>
                          <InputText
                            // type="number"
                            value={formatINRCurrencyText(Number(loanData.loanPrincipalAmt))}
                            placeholder="Due Principal Amount"
                            name="loanPrincipalAmt"
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({ name: 'loanPrincipalAmt', value: numberValue })
                            }}
                            keyfilter="money"
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex gap-x-5">
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Total Due Amount
                          </label>
                          <InputText
                            // type="number"
                            readOnly
                            value={formatINRCurrencyText(
                              Number(loanData.loanPrincipalAmt) +
                                Number(loanData.loanDueInterestAmt)
                            )}
                            placeholder="Total Due Amount"
                            name="loanPrincipalAmt"
                            keyfilter="money"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full gap-x-5">
                      <div className="flex-1 flex gap-x-5">
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Interest Amount Paid First
                          </label>
                          <InputText
                            // type="number"
                            disabled={!loanData.ifPayInterestFirst}
                            value={formatINRCurrencyText(Number(loanData.interestAmtPaidFirst))}
                            placeholder="Due Interest Amount"
                            name="interestAmtPaidFirst"
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({
                                name: 'interestAmtPaidFirst',
                                value: numberValue
                              })
                            }}
                            keyfilter="money"
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex gap-x-5">
                        <div className="flex-1">
                          <label htmlFor="currency-india" className="font-bold block">
                            Loan Initial Interest Amount
                          </label>
                          <InputText
                            // type="number"
                            value={formatINRCurrencyText(Number(loanData.loanInitialInterestAmt))}
                            placeholder="Due Initial Interest Amount"
                            name="loanInitialInterestAmt"
                            onChange={(e) => {
                              const numberValue = parseINRInput(e.target.value)
                              handelValueChange({
                                name: 'loanInitialInterestAmt',
                                value: numberValue
                              })
                            }}
                            keyfilter="money"
                          />
                        </div>
                        {/* <div className="flex-1"></div> */}
                      </div>
                    </div>

                    <Divider className="my-2" />
                    <div className="flex justify-between align-items-center">
                      <div>
                        <p className="my-2">
                          <b>First Amount Entry</b>
                        </p>
                      </div>
                      <div className="flex gap-x-5">
                        <p>
                          <b>Pay Any Due Amount First : </b>
                        </p>
                        <InputSwitch
                          checked={loanData.ifFirstPay ?? false}
                          name="ifFirstPay"
                          onChange={(e: InputSwitchChangeEvent) => handelValueChange(e.target)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col w-full gap-x-5">
                      <div className="flex w-full gap-x-5">
                        <div className="flex-1 flex gap-x-5">
                          <div className="flex-1">
                            <label htmlFor="currency-india" className="font-bold block">
                              Paid Interest
                            </label>
                            <InputText
                              // type="number"
                              value={formatINRCurrencyText(Number(dueFirstEntry?.paidInterest))}
                              placeholder="Due Interest Amount"
                              name="paidInterest"
                              disabled={!loanData.ifFirstPay}
                              onChange={(e) => {
                                const numberValue = parseINRInput(e.target.value)
                                handelFirstDueEntry({ name: 'paidInterest', value: numberValue })
                              }}
                              keyfilter="money"
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor="currency-india" className="font-bold block">
                              Paid Principal Amount
                            </label>
                            <InputText
                              // type="number"
                              disabled={!loanData.ifFirstPay}
                              value={formatINRCurrencyText(Number(dueFirstEntry?.paidPrincipal))}
                              placeholder="Due Principal Amount"
                              name="paidPrincipal"
                              onChange={(e) => {
                                const numberValue = parseINRInput(e.target.value)
                                handelFirstDueEntry({ name: 'paidPrincipal', value: numberValue })
                              }}
                              keyfilter="money"
                            />
                          </div>
                        </div>
                        <div className="flex-1 flex gap-x-5">
                          <div className="flex-1">
                            <label htmlFor="currency-india" className="font-bold block">
                              Paid Initial Interest
                            </label>
                            <InputText
                              disabled={!loanData.ifFirstPay}
                              // type="number"
                              value={formatINRCurrencyText(
                                Number(dueFirstEntry?.paidInitialInterest)
                              )}
                              placeholder="Due Initial Interest"
                              name="paidInitialInterest"
                              onChange={(e) => {
                                const numberValue = parseINRInput(e.target.value)
                                handelFirstDueEntry({
                                  name: 'paidInitialInterest',
                                  value: numberValue
                                })
                              }}
                              keyfilter="money"
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor="currency-india" className="font-bold block">
                              Arears Amount
                            </label>
                            <InputText
                              // type="number"
                              disabled={!loanData.ifFirstPay}
                              value={formatINRCurrencyText(Number(dueFirstEntry?.arears))}
                              placeholder="Due Arears Amount"
                              name="arears"
                              onChange={(e) => {
                                const numberValue = parseINRInput(e.target.value)
                                handelFirstDueEntry({ name: 'arears', value: numberValue })
                              }}
                              keyfilter="money"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-x-9 m-2">
                        <p>
                          <b>
                            Total Paid Amount :{' '}
                            {formatINRCurrency(
                              (dueFirstEntry?.paidInterest || 0) +
                                (dueFirstEntry?.paidPrincipal || 0) +
                                (dueFirstEntry?.paidInitialInterest || 0)
                            )}
                          </b>
                        </p>
                        <p>
                          <b>Arears Amount : {formatINRCurrency(dueFirstEntry?.arears ?? 0)}</b>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center my-3">
                  <Button className="py-1 px-5 flex gap-x-2" type="submit">
                    View Loan Summary Details
                  </Button>
                </div>
              </form>
            </div>
          )}

          {viewSummary && (
            <div>
              <p>
                <b className="text-[1.1rem]">Loan Summary</b>
              </p>
              <div className="flex shadow-3 p-2 rounded-lg my-2">
                <div className="flex-1 flex-col justify-center w-full">
                  <p className="my-2">
                    <b>Loan Details</b>
                  </p>
                  <DataTable
                    value={summaryData1}
                    className="w-full text-center no-header"
                    size="small"
                    showGridlines
                  >
                    <Column
                      field="label"
                      body={(row) => <div className="font-bold">{row.label}</div>}
                    />
                    <Column field="value" body={(row) => <div className="">{row.value}</div>} />
                  </DataTable>
                </div>
                <Divider layout="vertical" className="m-2" />
                <div className="flex-1 flex-col justify-center w-full">
                  <p className="my-2">
                    <b>Selected Loan Calculation</b>
                  </p>
                  <DataTable
                    value={summaryData2}
                    className="w-full text-center no-header"
                    size="small"
                    showGridlines
                  >
                    <Column
                      field="label"
                      body={(row) => <div className="font-bold">{row.label}</div>}
                    />
                    <Column field="value" body={(row) => <div className="">{row.value}</div>} />
                  </DataTable>
                </div>{' '}
              </div>
              <p className="mt-3">
                <b>Due Re-Payment Amount Details</b>
              </p>
              <div className="shadow-3 flex flex-col p-2 gap-y-3 rounded-lg my-2 ">
                <div className="flex ">
                  <div className="flex-1">
                    <p>
                      Due Interest Amount :{' '}
                      <b>{formatINRCurrency(Number(loanData.loanDueInterestAmt))}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Due Principal Amount :{' '}
                      <b>{formatINRCurrency(Number(loanData.loanPrincipalAmt))}</b>
                    </p>
                  </div>
                  {/* <div className="flex-1">
                <p>
                  Due Interest Amount :{' '}
                  <b>{formatINRCurrency(Number(loanData.loanInitialInterestAmt))}</b>
                </p>
              </div> */}
                  <div className="flex-1">
                    <p>
                      Total Due Amount :{' '}
                      <b>
                        {formatINRCurrency(
                          Number(
                            Number(loanData.loanPrincipalAmt) + Number(loanData.loanDueInterestAmt)
                          )
                        )}
                      </b>
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {/* <div className="flex-1">
                <p>
                  Total Due Amount :{' '}
                  <b>
                    {formatINRCurrency(
                      Number(
                        Number(loanData.loanPrincipalAmt) + Number(loanData.loanDueInterestAmt)
                      )
                    )}
                  </b>
                </p>
              </div> */}
                </div>
              </div>
              {!loanCalSetting.ifCalculationNeeded && (
                <>
                  <p className="mt-3">
                    <b>First Due Paid</b>
                  </p>
                  <div className="shadow-3 flex flex-col p-2 gap-y-3 rounded-lg my-2 ">
                    <div className="flex ">
                      <div className="flex-1">
                        <p>
                          Paid Interest Amount :{' '}
                          <b>{formatINRCurrency(Number(dueFirstEntry?.paidInterest))}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Paid Principal Amount :{' '}
                          <b>{formatINRCurrency(Number(dueFirstEntry?.paidPrincipal))}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Paid Initial Interest Amount :{' '}
                          <b>{formatINRCurrency(Number(dueFirstEntry?.paidPrincipal))}</b>
                        </p>
                      </div>
                    </div>
                    <div className="flex ">
                      <div className="flex-1">
                        <p>
                          Due Arears Amount :{' '}
                          <b>{formatINRCurrency(Number(dueFirstEntry?.arears))}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Total Paid Amount :{' '}
                          <b>
                            {formatINRCurrency(
                              (dueFirstEntry?.paidPrincipal || 0) +
                                (dueFirstEntry?.paidInterest || 0) +
                                (dueFirstEntry?.paidInitialInterest || 0)
                            )}
                          </b>
                        </p>
                      </div>
                      <div className="flex-1"></div>
                    </div>
                    <div className="flex">
                      {/* <div className="flex-1">
                <p>
                  Total Due Amount :{' '}
                  <b>
                    {formatINRCurrency(
                      Number(
                        Number(loanData.loanPrincipalAmt) + Number(loanData.loanDueInterestAmt)
                      )
                    )}
                  </b>
                </p>
              </div> */}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between my-4">
                <div>
                  <Button
                    severity="secondary"
                    className="flex gap-x-2 px-6"
                    onClick={(e) => {
                      e.preventDefault()
                      setSummary(false)
                    }}
                  >
                    <TiArrowBack size={'1.5rem'} />
                    Back To Edit
                  </Button>
                </div>
                <div>
                  <Button
                    severity="success"
                    className="flex gap-x-2 px-6"
                    onClick={(e) => {
                      e.preventDefault()
                      handelSubmit()
                    }}
                  >
                    <ImCalculator size={'1.5rem'} />
                    Create Loan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Old Loan Details */}
          <Dialog
            header="Old Loan Details"
            visible={showOldLoan}
            style={{ width: '65vw' }}
            onHide={() => {
              if (!showOldLoan) return
              setShowOldLoan(false)
            }}
          >
            <>
              <div className="flex">
                <div className="flex-1">
                  <p>
                    Total Loan: <b>₹ {loadDetailsResponse?.totalLoanAmt}</b>
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    Loan Interest : <b> {loadDetailsResponse?.loanInterest} %</b>
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    Loan Duration :
                    <b>
                      {loadDetailsResponse?.repaymentType === 3
                        ? loadDetailsResponse?.loanDueCount
                        : loadDetailsResponse?.loanDuration}
                      {loadDetailsResponse?.loanDueType === 1
                        ? ' Months'
                        : loadDetailsResponse?.loanDueType === 2
                          ? ' Weeks'
                          : ' Days'}
                    </b>
                  </p>
                </div>
              </div>
              <div className="flex mt-3">
                <div className="flex-1">
                  <p>
                    Initial Interest - Amt : <b>₹ {loadDetailsResponse?.initialInterest}</b>
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    Interest Paid (First) :{' '}
                    <b> {loadDetailsResponse?.interestFirst === true ? 'Yes' : 'No'}</b>
                  </p>
                </div>

                <div className="flex-1">
                  <p>
                    Interest Paid (First) :{' '}
                    <b>
                      {' '}
                      {loadDetailsResponse?.interestFirstMonth}{' '}
                      {loadDetailsResponse?.loanDueType === 1
                        ? 'Months'
                        : loadDetailsResponse?.loanDueType === 2
                          ? 'Weeks'
                          : 'Days'}
                    </b>
                  </p>
                </div>
              </div>
              <div className="flex mt-3">
                <div className="flex-1">
                  <p>
                    Total Principal Paid : <b>₹ {loadDetailsResponse?.totalPrincipal}</b>
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    Total Interest Paid : <b>₹ {loadDetailsResponse?.totalInterest}</b>
                  </p>
                </div>
                <div className="flex-1">
                  <p>
                    Balance Amount : <b>₹ {loadDetailsResponse?.loanBalance}</b>
                  </p>
                </div>
              </div>
            </>
          </Dialog>
          {/* Loan Calculation Configuration */}
          <Dialog
            header="Loan Calculation Configuration"
            visible={showLoanCalculationSetting}
            style={{ width: '80vw' }}
            onHide={() => {
              if (!showLoanCalculationSetting) return
              setShowLoanCalculationSetting(false)
            }}
          >
            <div className="flex w-full flex-col gap-y-3">
              <div className="flex gap-x-5">
                <div className="flex flex-1 align-items-center">
                  <div className="flex flex-col">
                    <label className="text-[1rem] ">Loan Calculation</label>
                    <span className="text-[0.8rem]">
                      Note : To Use the Automatic Loan Due Calculation that present in Our
                      Application.
                    </span>
                  </div>
                  <div>
                    <InputSwitch
                      checked={loanCalSetting?.ifCalculationNeeded ?? false}
                      name="ifCalculationNeeded"
                      onChange={(e: InputSwitchChangeEvent) => {
                        handelLoanSettingChange(e.target)
                        if (e.target.value === false) {
                          setLoanCalSetting({
                            ...loanCalSetting,
                            ifCalculationNeeded: false,
                            interestCalculationType: undefined,
                            loanClosingCalculation: undefined,
                            loanAdvanceAmtType: undefined,
                            weekStart: undefined,
                            weekEnd: undefined,
                            loanDueType: undefined
                          })
                        }
                      }}
                    />
                  </div>
                </div>
                <Divider layout="vertical" className="m-1" />
                <div className="flex flex-1 align-items-center">
                  <div className="flex flex-col">
                    <label className="text-[1rem] ">Initial Interest</label>
                    <span className="text-[0.8rem]">
                      Note : To Use the Automatic Loan Due Calculation that present in Our
                      Application.
                    </span>
                  </div>
                  <div>
                    <InputSwitch
                      checked={loanCalSetting?.ifInitialInterest ?? false}
                      name="ifInitialInterest"
                      onChange={(e: InputSwitchChangeEvent) => {
                        handelLoanSettingChange(e.target)
                        if (e.target.value === false) {
                          setLoanCalSetting({
                            ...loanCalSetting,
                            ifInitialInterest: false,
                            initialInterestCollectType: undefined
                          })
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-5">
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Initial Interest Collection Type</label>
                  <Dropdown
                    value={loanCalSetting?.initialInterestCollectType}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    options={interestCollectType}
                    disabled={!loanCalSetting?.ifInitialInterest}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Initial Interest Collection Type"
                    className="w-full"
                    name="initialInterestCollectType"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
                <Divider layout="vertical" className="m-1" />

                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Loan Due Type</label>
                  <Dropdown
                    value={loanCalSetting?.loanDueType}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    options={durationType}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Due Type"
                    className="w-full"
                    name="loanDueType"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
              </div>
              <div className="flex gap-x-5">
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Interest Calculation Type</label>
                  <Dropdown
                    value={loanCalSetting?.interestCalculationType}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    disabled={!loanCalSetting?.ifCalculationNeeded}
                    options={interestCalculationType}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Interest Calculation Type"
                    className="w-full"
                    name="interestCalculationType"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
                <Divider layout="vertical" className="m-1" />
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Loan Closing Type</label>
                  <Dropdown
                    value={loanCalSetting?.loanClosingCalculation}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    disabled={!loanCalSetting?.ifCalculationNeeded}
                    options={loanClosingList}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Loan Closing Type"
                    className="w-full"
                    name="loanClosingCalculation"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
              </div>

              <div className="flex gap-x-5">
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Loan Advance Amount Type</label>
                  <Dropdown
                    value={loanCalSetting?.loanAdvanceAmtType}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    disabled={!loanCalSetting?.ifCalculationNeeded}
                    options={advanceAmtList}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Advance Amount Type"
                    className="w-full"
                    name="loanAdvanceAmtType"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
                <Divider layout="vertical" className="m-1" />
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Week Start and End Day</label>
                  <div className="flex justify-between gap-x-2">
                    <Dropdown
                      className="flex-1 w-full md:h-[2.5rem] text-sm align-items-center"
                      value={loanCalSetting?.weekStart}
                      options={daysOfWeek}
                      disabled={!loanCalSetting?.ifCalculationNeeded}
                      onChange={(e: DropdownChangeEvent) => {
                        handelLoanSettingChange(e.target)
                      }}
                      name="weekStart"
                      placeholder="Select a Day"
                      optionLabel="label"
                      optionValue="code"
                    />
                    <Dropdown
                      className="flex-1 w-full md:h-[2.5rem] text-sm align-items-center"
                      disabled
                      value={loanCalSetting?.weekEnd}
                      options={daysOfWeek}
                      name="weekEnd"
                      placeholder="Select a Day"
                      optionLabel="label"
                      optionValue="code"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-5">
                <div className="flex flex-1 flex-col">
                  <label className="text-[1rem]">Due Re-Payment Collection Type</label>
                  <Dropdown
                    value={loanCalSetting?.dueRePaymentCollection}
                    onChange={(e: DropdownChangeEvent) => {
                      handelLoanSettingChange(e.target)
                    }}
                    // filter
                    disabled={!loanCalSetting?.ifCalculationNeeded}
                    options={loanDuePayList}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Loan Due Re-Payment Collection Type"
                    className="w-full"
                    name="dueRePaymentCollection"
                    checkmark={true}
                    highlightOnSelect={true}
                  />
                </div>
                <Divider layout="vertical" className="m-1" />
                <div className="flex flex-1 flex-col"></div>
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </div>
  )
}

export default AdminNewLoanCreation
