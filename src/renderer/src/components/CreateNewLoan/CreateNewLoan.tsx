import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Divider } from 'primereact/divider'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { Calendar } from 'primereact/calendar'
import { Slide, toast, ToastContainer } from 'react-toastify'

import { InputNumber } from 'primereact/inputnumber'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'
import { calInitialInterest, calInterestPayFirst, interestCal } from '@renderer/helper/loanFile'
// import { getRemainingDaysInCurrentMonth } from '../../helper/loanFile'
import { getDateAfterMonths } from '@renderer/helper/date'
import { InputTextarea } from 'primereact/inputtextarea'
import { getSettingData } from '@renderer/helper/SettingsData'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
// import { AnyCnameRecord } from 'node:dns'

interface CreateNewLoanProps {
  id?: number
  goToHistoryTab: any
}

interface LoanType {
  name: string
  value: number
}

interface LoadDetailsResponseProps {
  initialInterest: string
  interestFirst: boolean
  interestFirstMonth: string
  loanDuration: string
  loanInterest: string
  totalInitialInterest: number
  totalInterest: string
  totalInterestPaid: string
  totalLoanAmt: string
  totalLoanPaidDuration: string
  totalPrincipal: string
  finalBalanceAmt: string
  durationType: Number
  interestCalType: Number
}

interface UserDetails {
  refAadharNo: string
  refCustId: string
  refPanNo: string
  refUserAddress: string
  refUserDistrict: string
  refUserEmail: string
  refUserFname: string
  refUserId: number
  refUserLname: string
  refUserMobileNo: string
  refUserPincode: string
  refUserState: string
  label: string
  value: number
}

// interface SummaryData {
//   newLoanAmount: number
//   oldLoanAmount: number
//   FinalLoanAmount: string // toFixed returns a string
//   productName: string | undefined
//   Interest: string // formatted as string with '%'
//   Duration: string
//   rePaymentType: string | undefined
//   rePaymentDate: string | undefined // ISO date string (e.g., '2025-07-15')
//   interestCalType: number
//   InitialInterest: string
//   interestPaidFirstCount: number
//   interestPaidFirst: string
//   documentFee: number
//   finalAmountToUser: string
// }

const CreateNewLoan: React.FC<CreateNewLoanProps> = ({ id, goToHistoryTab }) => {
  const handleBack = () => {
    goToHistoryTab()
  }

  const today = new Date()
  // const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [customerId, setCustomerId] = useState<number>()
  const [customerList, setCustomerList] = useState<UserDetails[]>([])
  const [rePaymentDate, setRePaymentDate] = useState<Date | null>()
  const [date, setDate] = useState<Date | null>(new Date())
  const [newLoanAmt, setNewLoanAmt] = useState<number | null>()
  const [oldBalanceAmt, setOldBalanceAmt] = useState<number | null>(0)
  const [FinalLoanAmt, setFinalLoanAmt] = useState<number>(0)
  const [interestFirst, setInterestFirst] = useState<boolean | null>()
  const [monthCount, setMonthCount] = useState<number>(0)
  const [bankId, setBankId] = useState<number | null | any>(null)
  const [productId, setProductId] = useState<number | null | any>(null)
  const [interestFirstAmt, setInterestFirstAmt] = useState<number>(0)
  const [initialInterestAmt, setInitialInterestAmt] = useState<number>(0)
  const [docFee, setDocFee] = useState<number | null>()
  const [security, setSecurity] = useState<string>()
  const [loadDetailsResponse, setLoanDetailsReponse] = useState<LoadDetailsResponseProps | null>(
    null
  )
  const [selectedLoanType, setSelectedLoanType] = useState<number | null>(0)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [showLoanInfo, setShowLoanInfo] = useState<boolean>(false)
  const [loanTypeOptions, setLoanTypeOptions] = useState<LoanType[] | null>([])

  const [selectedRepaymentType, setSelectedRepaymentType] = useState<number | null>(null)
  const [userLoan, setUserLoan] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any[] | null>([])
  const [loanProduct, setLoanProduct] = useState<any[]>([])
  const [bankList, setBankList] = useState<any[]>([])
  const [minDate, setMinDate] = useState<Date | null>()
  const [maxDate, setMaxDate] = useState<Date | null>()
  const [viewDate, setViewDate] = useState<Date | null>()
  const [step, setStep] = useState(0)
  const [loanCalculationData, setLoanCalculationData] = useState<interestCal>()
  const [loanSummary, setLoanSummary] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [summaryData, setSummaryData] = useState<
    { label: string; value: string | number | undefined }[]
  >([])
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

    const today = new Date(date ?? new Date())
    const currentDay = today.getDay()

    const startOffset = (7 + daysOfWeek[startDay] - currentDay) % 7 || 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + startOffset)

    const endOffset = (7 + daysOfWeek[endDay] - daysOfWeek[startDay]) % 7
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + endOffset)

    return { startDate, endDate }
  }

  const getDateRange = async (durationType: number) => {
    const today = new Date(date ?? new Date())

    switch (durationType) {
      case 1:
        setMinDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        setMaxDate(new Date(today.getFullYear(), today.getMonth() + 2, 0))
        setViewDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        break
      case 2:
        const settingData = await getSettingData()
        const weekData = settingData.weekStartEnd?.split(',')
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
        console.log(' -> Line Number ----------------------------------- 132')
        setMinDate(null)
        setMaxDate(null)
        setViewDate(null)
    }
  }

  const getUserLoanData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/adminRoutes/addLoanOption`,
        { userId: customerId },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success) {
        const options = data.data.map((d: any) => ({
          name: `Loan Amt : ${d.refLoanAmount} - Interest : ${d.refProductInterest} - Duration : ${d.refProductDuration} ${
            d.refProductDurationType === 1
              ? 'Month'
              : d.refProductDurationType === 2
                ? 'Weeks'
                : 'Days'
          }`,
          value: d.refLoanId
        }))
        setUserLoan(options)
      }
    } catch (error) {
      console.error('Error loading loan data', error)
      setShowForm(false)
    }
  }

  const getAllLoanData = async () => {
    const settingData = await getSettingData()
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminRoutes/getLoan',
        {
          userId: customerId
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

        if (data.success) {
          console.log('data =======> ', data)
          const productList = data.productList
          data.productList.map((data, index) => {
            const name = `${data.refProductName} | ${data.refProductInterest} % | ${data.refProductDuration} ${data.refLoanDueType === 1 ? 'Months' : data.refLoanDueType === 2 ? 'Weeks' : 'Days'} | ${data.refRepaymentTypeName} | ${data.refInterestCalType === 1 ? 'Day wise calculation' : 'Overall Calculation'}`
            productList[index] = { ...productList[index], refProductName: name }
          })
          setLoanProduct(productList)

          const bankList = data.allBankAccountList
          console.log('bankList', bankList)
          let filterBankList
          if (settingData.paymentMethod !== 1 && settingData.paymentMethod !== null) {
            const paymentType = settingData?.paymentMethod - 1
            filterBankList = bankList.filter((e) => e.refAccountType === paymentType)
          } else {
            filterBankList = bankList
          }
          console.log('filterBankList line ---- 223', filterBankList)
          filterBankList.map((data, index) => {
            const name = `Name : ${data.refBankName} | Balance : ₹ ${data.refBalance}`
            filterBankList[index] = { ...filterBankList[index], refBankName: name }
          })
          setBankList(filterBankList)
        }
      })
  }

  const getLoanEntireDetails = (value?: number) => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/newLoan/selectedLoanDetailsV1',
        {
          loanId: value,
          loanTypeId: selectedLoanType
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )
      .then((response) => {
        console.log('response', response)
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )
        console.log('data line ------- 194', data.data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        setLoanDetailsReponse(data.data)
        setOldBalanceAmt(Number(data.data.finalBalanceAmt))
        const balance = data.data.finalBalanceAmt ?? 0
        console.log('balance line -------- 201', balance)
        setFinalLoanAmt(0 + Number(balance))
        getAllLoanData()
      })
      .catch(() => {
        setShowForm(false)
      })
  }

  const show = (LoanType: number, Loan: number | null) => {
    console.log('selectedLoanType line ------ 208', LoanType)
    console.log('selectedLoan line ------ 209', Loan)
    setShowForm(false)
    setShowLoanInfo(false)
    if (LoanType === 1) {
      setShowForm(true)
    } else if ((LoanType === 2 || LoanType === 3) && Loan !== null && Loan !== undefined) {
      setShowForm(true)
      setShowLoanInfo(true)
    } else {
      setShowForm(false)
      setShowLoanInfo(false)
    }
  }

  const handelSubmit = () => {
    console.log('selectedLoan', selectedLoan)
    console.log('rePaymentDate', rePaymentDate)
    axios
      .post(
        import.meta.env.VITE_API_URL + '/newLoan/CreateNewLoan',
        {
          refUserId: customerId,
          refProductId: productId?.refProductId,
          refLoanAmount: FinalLoanAmt.toFixed(2),
          refLoanDueDate: getDateAfterMonths(
            String(rePaymentDate),
            parseInt(productId?.refProductDuration)
          ),
          refPayementType: 'bank',
          refRepaymentStartDate: rePaymentDate?.toLocaleDateString('en-CA'),
          refBankId: bankId?.refBankId,
          refLoanBalance: FinalLoanAmt.toFixed(2),
          isInterestFirst: interestFirst,
          refExLoanId: selectedLoan,
          refLoanExt: selectedLoanType,
          refLoanStatus: 1,
          refInterestMonthCount: monthCount,
          refInitialInterest: initialInterestAmt.toFixed(2),
          refRepaymentType: selectedRepaymentType,
          refTotalInterest: ((initialInterestAmt ?? 0) + (interestFirstAmt ?? 0)).toFixed(2),
          refToUseAmt: parseFloat(
            ((newLoanAmt ?? 0) - (initialInterestAmt ?? 0) - (interestFirstAmt ?? 0)).toFixed(2)
          ),
          oldBalanceAmt: oldBalanceAmt ?? 0,
          refDocFee: docFee,
          refSecurity: security,
          todayDate: date ?? undefined
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )
      .then((response) => {
        console.log('response', response)
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )
        console.log('data line ----------- 269', data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        if (data.success) {
          setLoading(false)
          toast.success('Loan Created Successfully', {
            position: 'top-right',
            autoClose: 1900,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Slide
          })

          setTimeout(() => {
            handleBack()
          }, 1000)
        } else {
          setLoading(false)
          toast.error(data.message, {
            position: 'top-right',
            autoClose: 2999,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Slide
          })
        }
      })
  }
  const getUserList = () => {
    axios
      .get(import.meta.env.VITE_API_URL + '/newLoan/userListOption', {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log('response', response)
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )
        localStorage.setItem('token', 'Bearer ' + data.token)
        console.log('data line ------ 350 ', data)
        if (data.success) {
          let userList = data.data
          userList.map((data, index) => {
            const name = `Name : ${data.refUserFname} ${data.refUserLname} | Joint  : ${data.refRName} | Area : ${data.refAreaName}-[${data.refAreaPrefix}] | Mobile : ${data.refUserMobileNo} | Aadhar Card : ${data.refAadharNo}`
            userList[index] = { ...userList[index], label: name, value: data.refUserId }
          })
          setCustomerList(userList)
          const loanOption = data.loanType.map((data) => {
            return {
              name: data.refLoanType,
              value: data.refLoanTypeId
            }
          })
          setLoanTypeOptions(loanOption)
        }
      })
  }

  const loanCalculation = async (data: interestCal) => {
    const requiredFields = [
      'duration',
      'interest',
      'interestCalType',
      'interestMonth',
      'loanAmount',
      'loanDueType',
      'rePaymentType',
      'rePaymentDate',
      'todayDate'
    ]
    if (requiredFields.every((key) => data[key] !== undefined && data[key] !== null)) {
      const interestFirst = await calInterestPayFirst(data)
      setInterestFirstAmt(Math.round(interestFirst))
      const settingData = await getSettingData()
      console.log(' -> Line Number ----------------------------------- 443')
      if (settingData.initialInterest) {
        console.log(' -> Line Number ----------------------------------- 444')
        const intialInterest = await calInitialInterest(data)
        setInitialInterestAmt(Math.round(intialInterest))
      }
    }
  }

  useEffect(() => {
    setCustomerId(id)
    getUserList()
  }, [])

  function formatLabel(key: string) {
    return key
      .replace(/([A-Z])/g, ' $1') // insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
  }
  const formatINRCurrency = (amount: number | undefined | null) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount ?? 0)
  }

  const summary = () => {
    console.log('productId line ------ 465', productId)
    console.log('productId?.refProductId', productId?.refProductId)
    setLoanSummary(true)
    if (loanCalculationData) {
      console.log(' -> Line Number ----------------------------------- 468')
      loanCalculation(loanCalculationData)
      const summaryDatas = {
        newLoanAmount: formatINRCurrency(newLoanAmt),
        oldLoanAmount: formatINRCurrency(oldBalanceAmt),
        FinalLoanAmount: formatINRCurrency(FinalLoanAmt),
        productName: productId?.refProductName.split('|')[0],
        Interest: `${productId?.refProductInterest} %`,
        Duration: `${productId?.refProductDuration} ${productId?.refLoanDueType === 1 ? 'Months' : productId?.refLoanDueType === 2 ? 'Weeks' : 'Days'}`,
        rePaymentType: productId?.refRepaymentTypeName,
        rePaymentDate: rePaymentDate?.toLocaleDateString('en-CA'),

        interestCalType:
          productId?.refInterestCalType === 1 ? 'Day Wise Calculation' : 'Overall Calculation',
        InitialInterest: formatINRCurrency(initialInterestAmt),
        interestPaidFirstCount: monthCount,
        interestPaidFirst: formatINRCurrency(interestFirstAmt),
        documentFee: formatINRCurrency(docFee),
        security: security,
        finalAmountToUser: formatINRCurrency(
          (newLoanAmt ?? 0) - (initialInterestAmt ?? 0) - (interestFirstAmt ?? 0) - (docFee ?? 0)
        )
      }
      const summaryDataRowWise = Object.entries(summaryDatas).map(([key, value]) => ({
        label: formatLabel(key),
        value: value ?? '-' // show dash if undefined/null
      }))
      setSummaryData(summaryDataRowWise)

      console.log('summaryDatas line ------- 490', summaryDatas)
    } else {
      toast.error('Please select all the fields', {
        position: 'top-right',
        autoClose: 2999,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Slide
      })
    }
  }

  return (
    <div>
      <ToastContainer />
      {!loanSummary && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // handelSubmit()
              summary()
            }}
          >
            <div className="w-[100%] flex flex-col justify-content-between">
              <div className="w-full flex gap-x-5 justify-center">
                <div className="w-[73%]">
                  <label className="font-bold block mb-2">Select Customer</label>
                  <Dropdown
                    value={customerId}
                    className="w-full"
                    filter
                    onChange={(e: DropdownChangeEvent) => {
                      console.log('e line ----------- 405', e)
                      setCustomerId(e.target.value)
                      setStep(0.5)
                      setSelectedLoanType(null)
                      setSelectedLoan(null)
                      setShowLoanInfo(false)
                      setShowForm(false)
                    }}
                    required
                    options={customerList}
                    optionLabel="label"
                    placeholder="Select Customer To Provide Loan"
                  />
                </div>
                <div className="w-[20%]">
                  <label className="font-bold block mb-2">Select Calendar</label>
                  <Calendar
                    placeholder="DD/MM/YYYY"
                    value={date}
                    onChange={(e) => {
                      setDate(e.value ?? new Date())
                      setSelectedLoanType(null)
                    }}
                    dateFormat="dd/mm/yy"
                    // minDate={firstDayOfMonth}
                    maxDate={today}
                  />
                </div>
              </div>
              <div className="w-full flex justify-content-around my-1">
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Loan Type</label>
                  <Dropdown
                    value={selectedLoanType}
                    className="w-full"
                    disabled={step < 0.5}
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedLoanType(e.value)
                      getUserLoanData()
                      getAllLoanData()
                      setProductId(null)
                      setSelectedLoan(null)
                      show(e.value, null)
                      setStep(0.6)
                      setSelectedRepaymentType(null)
                    }}
                    required
                    options={loanTypeOptions ?? []}
                    optionLabel="name"
                    placeholder="Select Loan Type"
                  />
                </div>
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Old Loan</label>
                  <Dropdown
                    value={selectedLoan}
                    disabled={selectedLoanType === 1 || selectedLoanType === 0}
                    className="w-full"
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedLoan(e.value)
                      getLoanEntireDetails(e.value)
                      show(selectedLoanType || 0, e.value)
                    }}
                    filter
                    options={userLoan}
                    optionLabel="name"
                    placeholder="Select Old Loan"
                  />
                </div>
              </div>

              {showLoanInfo && (
                <div className="flex justify-center">
                  <div className="mt-3 w-[95%]">
                    <Accordion activeIndex={0}>
                      <AccordionTab header="Loan Details">
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
                              Loan Duration :{' '}
                              <b>
                                {' '}
                                {loadDetailsResponse?.loanDuration}{' '}
                                {loadDetailsResponse?.durationType === 1
                                  ? 'Months'
                                  : loadDetailsResponse?.durationType === 2
                                    ? 'Weeks'
                                    : 'Days'}
                              </b>
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-3">
                          <div className="flex-1">
                            <p>
                              Initial Interest - Amt :{' '}
                              <b>₹ {loadDetailsResponse?.initialInterest}</b>
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
                                {loadDetailsResponse?.durationType === 1
                                  ? 'Months'
                                  : loadDetailsResponse?.durationType === 2
                                    ? 'Weeks'
                                    : 'Days'}
                              </b>
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-3">
                          <div className="flex-1">
                            <p>
                              Total Principal Amt : <b>₹ {loadDetailsResponse?.totalPrincipal}</b>
                            </p>
                          </div>
                          <div className="flex-1">
                            <p>
                              Total Interest Amt : <b>₹ {loadDetailsResponse?.totalInterest}</b>
                            </p>
                          </div>
                          <div className="flex-1"></div>
                        </div>
                        <Divider layout="horizontal" className="flex">
                          <b>Calculation</b>
                        </Divider>
                        <div className="flex">
                          <div className="flex-1">
                            <p>
                              Total Principal Paid : <b>₹ {loadDetailsResponse?.totalPrincipal}</b>
                            </p>
                          </div>
                          <div className="flex-1">
                            <p>
                              Total Interest Paid :{' '}
                              <b>₹ {loadDetailsResponse?.totalInterestPaid}</b>
                            </p>
                          </div>
                          <div className="flex-1">
                            <p>
                              Initial Interest Paid :{' '}
                              <b>₹ {loadDetailsResponse?.totalInitialInterest}</b>
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-3">
                          <div className="flex-1">
                            <p>
                              Loan Duration :{' '}
                              <b>
                                {' '}
                                {loadDetailsResponse?.loanDuration}{' '}
                                {loadDetailsResponse?.durationType === 1
                                  ? 'Months'
                                  : loadDetailsResponse?.durationType === 2
                                    ? 'Weeks'
                                    : 'Days'}
                              </b>
                            </p>
                          </div>
                          <div className="flex-1">
                            <p>
                              Balance Amt : <b>₹ {loadDetailsResponse?.finalBalanceAmt}</b>
                            </p>
                          </div>
                        </div>
                      </AccordionTab>
                    </Accordion>
                  </div>
                </div>
              )}

              {showForm && (
                <div>
                  <Divider layout="horizontal" className="flex" />
                  <div className="w-full flex justify-content-around my-1">
                    <div className="w-[95%]">
                      <label className="font-bold block mb-2">Select Product</label>
                      <Dropdown
                        filter
                        value={productId}
                        required
                        className="w-full"
                        onChange={async (e: DropdownChangeEvent) => {
                          // console.log('e', e)
                          setProductId(e.value)
                          // console.log('e.value', e.value)
                          // setStep(2)
                          const selected = loanProduct.find(
                            (data) => data.refProductId === e.value.refProductId
                          )
                          // console.log('loanProduct', loanProduct)
                          // console.log('selected', selected)
                          setSelectedRepaymentType(selected ? selected.refRePaymentType : null)
                          getDateRange(e.value.refLoanDueType)
                          // setNewLoanAmt(null)
                          const data: interestCal = {
                            ...loanCalculationData,
                            interest: Number(e.value.refProductInterest),
                            interestCalType: Number(e.value.refInterestCalType),
                            duration: Number(e.value.refProductDuration),
                            loanDueType: Number(e.value.refLoanDueType),
                            rePaymentType: Number(e.value.refRePaymentType),
                            todayDate: date ?? undefined
                          }
                          setLoanCalculationData(data)
                          // await loanCalculation(data)
                        }}
                        options={loanProduct}
                        optionLabel="refProductName"
                        placeholder="Select Product"
                      />
                    </div>
                  </div>
                  <div className="w-full  flex justify-content-around my-1">
                    <div className="w-[45%]  flex flex-row justify-content-between gap-x-2">
                      <div className="w-full">
                        <label className="font-bold block mb-2">Enter Loan Amount</label>
                        <InputNumber
                          className="w-full"
                          placeholder="Enter Loan Amount"
                          inputId="currency-india"
                          required
                          // disabled={step < 2}
                          value={newLoanAmt}
                          onChange={async (e: any) => {
                            setNewLoanAmt(e.value)
                            // setStep(3)
                            // setBankId(null)
                            const value = parseFloat(e.value) || 0
                            const balance = oldBalanceAmt ?? 0
                            setFinalLoanAmt(value + Number(balance))
                            const data: interestCal = {
                              ...loanCalculationData,
                              loanAmount: value + Number(balance)
                            }
                            setLoanCalculationData(data)
                            // await loanCalculation(data)
                          }}
                          mode="currency"
                          currency="INR"
                          currencyDisplay="symbol"
                          locale="en-IN"
                        />
                      </div>
                      {(selectedLoanType === 2 || selectedLoanType === 3) && (
                        <div className="w-full">
                          <label className="font-bold block mb-2">Balance Amount</label>
                          <InputNumber
                            className="w-full"
                            disabled
                            placeholder="Old Loan Amount"
                            inputId="currency-india"
                            value={oldBalanceAmt}
                            required
                            mode="currency"
                            currency="INR"
                            currencyDisplay="symbol"
                            locale="en-IN"
                          />
                        </div>
                      )}
                    </div>
                    <div className="w-[45%]">
                      <label className="font-bold block mb-2">Select Amount Source</label>
                      <Dropdown
                        value={bankId}
                        filter
                        // disabled={step < 3}
                        className="w-full"
                        required
                        onChange={(e: DropdownChangeEvent) => {
                          setBankId(e.value)
                          // setStep(4)
                          // setRePaymentDate(null)
                        }}
                        options={bankList}
                        optionLabel="refBankName"
                        placeholder="Select Amount From"
                      />
                    </div>
                  </div>
                  <div className="w-full flex justify-content-around my-1">
                    <div className="w-[45%]  ml-2">
                      <label className="font-bold block mb-2">Select Loan Re-Payment Date</label>
                      <Calendar
                        placeholder="Repayment Schedule Date"
                        // disabled={step < 4}
                        dateFormat="dd/mm/yy"
                        className="w-full"
                        required
                        value={rePaymentDate ?? undefined}
                        onChange={async (e: any) => {
                          // console.log('e', e)
                          setRePaymentDate(e.value)
                          // setStep(5)
                          // setInterestFirst(null)
                          const data: interestCal = {
                            ...loanCalculationData,
                            rePaymentDate: e.value
                          }
                          setLoanCalculationData(data)
                          // await loanCalculation(data)
                        }}
                        minDate={minDate ?? undefined}
                        maxDate={maxDate ?? undefined}
                        viewDate={viewDate}
                      />
                    </div>
                    <div className="w-[45%] flex align-items-center pl-4">
                      <div className="w-[40%]">
                        <label className="font-bold block mb-2">Interest First</label>
                        <div className="flex flex-row gap-x-5 w-[100%]">
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="ingredient1"
                              name="pizza"
                              value="true"
                              required
                              // disabled={step < 5}
                              onChange={async (_e: RadioButtonChangeEvent) => {
                                setInterestFirst(true)
                                // setDocFee(null)
                                setMonthCount(1)
                                // setStep(6)
                                const data: interestCal = {
                                  ...loanCalculationData,
                                  interestMonth: 1
                                }
                                setLoanCalculationData(data)
                                // await loanCalculation(data)
                              }}
                              checked={interestFirst === true}
                            />
                            <label htmlFor="ingredient1" className="ml-2">
                              Yes
                            </label>
                          </div>
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="ingredient2"
                              name="pizza"
                              // disabled={step < 5}
                              value="Mushroom"
                              required
                              onChange={async (_e: RadioButtonChangeEvent) => {
                                // setDocFee(null)
                                setInterestFirst(false)
                                setMonthCount(0)
                                setInterestFirstAmt(0)
                                // setStep(6)
                                const data: interestCal = {
                                  ...loanCalculationData,
                                  interestMonth: 0
                                }
                                setLoanCalculationData(data)
                                // await loanCalculation(data)
                              }}
                              checked={interestFirst === false}
                            />
                            <label htmlFor="ingredient2" className="ml-2">
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                      {interestFirst && (
                        <div className="w-[60%]">
                          <label className="font-bold block mb-2">
                            Enter Number Of{' '}
                            {productId.refLoanDueType === 1
                              ? 'Month'
                              : productId.refLoanDueType === 2
                                ? 'Weeks'
                                : 'Days'}
                          </label>
                          <InputNumber
                            className="w-full"
                            inputId="expiry"
                            // disabled={step < 6}
                            value={monthCount}
                            required
                            onChange={async (e: any) => {
                              setMonthCount(e.value)
                              // setDocFee(null)
                              const data: interestCal = {
                                ...loanCalculationData,
                                interestMonth: e.value
                              }
                              setLoanCalculationData(data)
                              // await loanCalculation(data)
                            }}
                            suffix={
                              productId.refLoanDueType === 1
                                ? ' Month'
                                : productId.refLoanDueType === 2
                                  ? ' Weeks'
                                  : ' Days'
                            }
                          />
                        </div>
                      )}
                    </div>
                    <div></div>
                  </div>

                  <div className="w-full flex justify-content-around my-1">
                    <div className="w-[45%]">
                      <label className="font-bold block mb-2">Enter Documentation Fee</label>
                      <InputNumber
                        className="w-full"
                        placeholder="Document Fee"
                        inputId="currency-india"
                        // disabled={step < 6}
                        value={docFee}
                        required
                        mode="currency"
                        currency="INR"
                        currencyDisplay="symbol"
                        locale="en-IN"
                        onChange={(e: any) => {
                          setDocFee(e.value)
                          // setSecurity('')
                          // setSecurity('')
                          // setStep(7)
                        }}
                      />
                    </div>
                    <div className="w-[45%]">
                      <label className="font-bold block mb-2">Security</label>
                      <InputTextarea
                        className="w-full"
                        value={security}
                        // disabled={step < 7}
                        onChange={(e) => {
                          setSecurity(e.target.value)
                          // setStep(8)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* {step >= 7 && (
            <div className="my-3 shadow-2xl border-0 rounded-lg p-5">
              <b>Loan Details</b>
              <div className="flex w-full justify-content-between my-2">
                <div>
                  <p>
                    Total Loan Amount : ₹ <b>{FinalLoanAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    New Loan Amount : ₹ <b>{newLoanAmt}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Old Loan Amount : ₹ <b>{oldBalanceAmt}</b>
                  </p>
                </div>
              </div>
              <div className="flex w-full justify-content-between my-2 ">
                <div>
                  <p>
                    Initial Interest : ₹ <b>{initialInterestAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Interest for {monthCount}{' '}
                    {productId.refLoanDueType === 1
                      ? ' Month'
                      : productId.refLoanDueType === 2
                        ? ' Weeks'
                        : ' Days'}{' '}
                    : ₹ <b>{interestFirstAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Documentation Fee : ₹ <b>{(docFee ?? 0).toFixed(2)}</b>
                  </p>
                </div>
              </div>
              <b>Calculation</b>
              <div className="flex w-full justify-content-between my-2 ">
                <div>
                  <p>
                    Formula :{' '}
                    <b>
                      {' '}
                      [ Total Loan Amount - ( Initial Interest - Interest Paid {monthCount}{' '}
                      {productId.refLoanDueType === 1
                        ? ' Month'
                        : productId.refLoanDueType === 2
                          ? ' Weeks'
                          : ' Days'}{' '}
                      - Documentation Fee ) ]
                    </b>
                  </p>
                </div>

                <div>
                  <p>
                    Amount to User : ₹{' '}
                    <b>
                      {(
                        (newLoanAmt ?? 0) -
                        (initialInterestAmt ?? 0) -
                        (interestFirstAmt ?? 0) -
                        (docFee ?? 0)
                      ).toFixed(2)}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          )} */}

              <div></div>
            </div>
            {/* {step >= 7 && ( */}
            <div className="w-full flex justify-center">
              <button className="bg-[green] text-white py-2 px-10 rounded-md shadow-md">
                View Loan Details
              </button>
            </div>
            {/* )} */}
          </form>
        </>
      )}

      {loanSummary && (
        <>
          <div>
            <b className="text-[1.2rem]">Loan Details</b>
          </div>
          <div className="my-5 flex flex-col gap-y-5">
            {/* <div className="my-3 shadow-2xl border-0 rounded-lg p-5">
              <b>Loan Details</b>
              <div className="flex w-full justify-content-between my-2">
                <div>
                  <p>
                    Total Loan Amount : ₹ <b>{FinalLoanAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    New Loan Amount : ₹ <b>{newLoanAmt}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Old Loan Amount : ₹ <b>{oldBalanceAmt}</b>
                  </p>
                </div>
              </div>
              <div className="flex w-full justify-content-between my-2 ">
                <div>
                  <p>
                    Initial Interest : ₹ <b>{initialInterestAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Interest for {monthCount}{' '}
                    {productId.refLoanDueType === 1
                      ? ' Month'
                      : productId.refLoanDueType === 2
                        ? ' Weeks'
                        : ' Days'}{' '}
                    : ₹ <b>{interestFirstAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Documentation Fee : ₹ <b>{(docFee ?? 0).toFixed(2)}</b>
                  </p>
                </div>
              </div>
              <b>Calculation</b>
              <div className="flex w-full justify-content-between my-2 ">
                <div>
                  <p>
                    Formula :{' '}
                    <b>
                      {' '}
                      [ Total Loan Amount - ( Initial Interest - Interest Paid {monthCount}{' '}
                      {productId.refLoanDueType === 1
                        ? ' Month'
                        : productId.refLoanDueType === 2
                          ? ' Weeks'
                          : ' Days'}{' '}
                      - Documentation Fee ) ]
                    </b>
                  </p>
                </div>

                <div>
                  <p>
                    Amount to User : ₹{' '}
                    <b>
                      {(
                        (newLoanAmt ?? 0) -
                        (initialInterestAmt ?? 0) -
                        (interestFirstAmt ?? 0) -
                        (docFee ?? 0)
                      ).toFixed(2)}
                    </b>
                  </p>
                </div>
              </div>
            </div> */}
            <div className="w-full flex justify-center">
              <DataTable
                value={summaryData}
                className="w-[70%] text-center no-header"
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
            <div>
              <div className="w-full flex justify-between">
                <Button
                  label="Back to Edit"
                  icon="pi pi-arrow-left"
                  severity="danger"
                  onClick={() => {
                    setLoanSummary(false)
                  }}
                />

                <Button
                  label="Provide New Loan"
                  severity="success"
                  icon="pi pi-check"
                  loading={loading}
                  onClick={() => {
                    console.log(' -> Line Number ----------------------------------- 1243')
                    setLoading(true)
                    handelSubmit()
                  }}
                />
              </div>
              <div></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CreateNewLoan
