import axios from 'axios'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import React, { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Divider } from 'primereact/divider'
import { InputNumber } from 'primereact/inputnumber'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'
import { getDateAfterMonths } from '@renderer/helper/date'
import { Slide, toast, ToastContainer } from 'react-toastify'

import {
  CalculateFirstInterest,
  CalculateInitialInterest,
  FirstInterest,
  getRemainingDaysInCurrentMonth
} from '@renderer/helper/loanFile'
import { Calendar } from 'primereact/calendar'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
interface AddNewSupplierProps {
  closeSidebarNew: () => void
}

interface LoanType {
  name: string
  value: number
}

interface DurationType {
  name: string
  code: number
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

const AdminLoanCreation: React.FC<AddNewSupplierProps> = ({ closeSidebarNew }) => {
  const [date, setDate] = useState<Date | null>(new Date())
  // const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const [vendorId, setVendorId] = useState<any | null>()
  const [rePaymentDate, setRePaymentDate] = useState<any | null>()
  const [newLoanAmt, setNewLoanAmt] = useState<number | null>()
  const [oldBalanceAmt, setOldBalanceAmt] = useState<number | null>(0)
  const [FinalLoanAmt, setFinalLoanAmt] = useState<number>(0)
  const [interestFirst, setInterestFirst] = useState<boolean | null>(false)
  const [monthCount, setMonthCount] = useState<number>(0)
  const [bankId, setBankId] = useState<any | null>(null)
  const [loanDuration, setLoanDuration] = useState<number | null>()
  const [loanInterest, setLoanInterest] = useState<number | null>()
  const [interestFirstAmt, setInterestFirstAmt] = useState<number>(0)
  const [initialInterestAmt, setInitialInterestAmt] = useState<number>(0)
  const [loadDetailsResponse, setLoanDetailsReponse] = useState<LoadDetailsResponseProps | null>(
    null
  )
  const [selectedDurationType, setSelectedDurationType] = useState<DurationType | null>()
  const [selectedInterestCal, setSelectedInterestCal] = useState<number | null>()
  const [docFee, setDocFee] = useState<number | null>()
  const [security, setSecurity] = useState<string>()
  const [selectedLoanType, setSelectedLoanType] = useState<number | null>(0)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [showLoanInfo, setShowLoanInfo] = useState<boolean>(false)
  const [ifInitialIntrest, setIfInitialInterest] = useState<boolean>(true)
  const [loanSummary, setLoanSummary] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [summaryData, setSummaryData] = useState<
    { label: string; value: string | number | undefined }[]
  >([])
  const loanTypeOptions: LoanType[] = [
    { name: 'New Loan', value: 1 },
    { name: 'Loan TopUp', value: 2 },
    { name: 'Loan Extension', value: 3 }
  ]

  const initialInterestOption: any[] = [
    {
      name: 'Yes',
      value: true
    },
    {
      name: 'No',
      value: false
    }
  ]

  const durationType = [
    { name: 'Monthly', code: 1 },
    { name: 'Weekly', code: 2 },
    { name: 'Daily', code: 3 }
  ]

  const interestCalculationType = [
    { name: 'DayWise Monthly Calculation', code: 1 },
    { name: 'Monthly Calculation', code: 2 }
  ]

  const [selectedRepaymentType, setSelectedRepaymentType] = useState<number | null>(null)
  const rePaymentTypeOptions: LoanType[] = [
    { name: 'Flat Loan', value: 1 },
    { name: 'Diminishing Loan', value: 2 },
    { name: 'Monthly Interest', value: 3 }
  ]
  const [userLoan, setUserLoan] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any[] | null>([])
  const [bankList, setBankList] = useState<any[]>([])
  const [minDate, setMinDate] = useState<Date | null>()
  const [maxDate, setMaxDate] = useState<Date | null>()
  const [viewDate, setViewDate] = useState<Date | null>()

  const getDateRange = (durationType: number) => {
    console.log('durationType line ------ 108', durationType)
    const today = new Date(date ?? new Date())

    switch (durationType) {
      case 1: // Next Month
        setMinDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        setMaxDate(new Date(today.getFullYear(), today.getMonth() + 2, 0))
        setViewDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        // setRePaymentDate(new Date(today.getFullYear(), today.getMonth() + 1, 1))
        break
      case 2: // Next Week
        const nextWeekStart = new Date(today)
        nextWeekStart.setDate(today.getDate() + (7 - today.getDay()))
        const nextWeekEnd = new Date(nextWeekStart)
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
        setMinDate(nextWeekStart)
        setMaxDate(nextWeekEnd)
        setViewDate(nextWeekStart)
        // setRePaymentDate(nextWeekStart)
        break

      case 3: // Next Day
        const nextDay = new Date(today)
        nextDay.setDate(today.getDate() + 1)
        setMinDate(nextDay)
        setMaxDate(nextDay)
        setViewDate(nextDay)
        // setRePaymentDate(nextDay)
        break

      default:
        console.log(' -> Line Number ----------------------------------- 132')
        setMinDate(null)
        setMaxDate(null)
        setViewDate(null)
    }
  }

  const [step, setStep] = useState(0)

  const [vendorList, setVendorList] = useState<LoanType[]>([])

  const handleBack = () => {
    closeSidebarNew()
  }

  const getUserLoanData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/adminLoan/addLoanOption`,
        { userId: vendorId?.refVendorId },
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
        console.log('data.data line ----- 118', data.data)
        const options = data.data.map((d: any) => ({
          name: `Loan Amt : ${d.refLoanAmount} - Interest : ${d.refLoanInterest} % - Duration : ${d.refLoanDuration} ${
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

  const getAllLoanData = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/getLoan',
        {
          userId: vendorId?.refVendorId
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

          const bankList = data.allBankAccountList
          console.log('bankList line ------ 202', bankList)
          bankList.map((data, index) => {
            const name = `Name : ${data.refBankName} | Balance : ₹ ${data.refBalance}`
            bankList[index] = { ...bankList[index], refBankName: name }
          })
          console.log('bankList', bankList)
          setBankList(bankList)
        }
      })
  }

  const calculateInterest = async (data: FirstInterest) => {
    const firstInterestAmt = await CalculateFirstInterest(data)
    console.log('firstInterestAmt line ---- 149', firstInterestAmt)
    setInterestFirstAmt(firstInterestAmt)
  }

  const initialInterest = async (Pamt, ifInterest) => {
    const days = await getRemainingDaysInCurrentMonth(
      selectedDurationType?.code,
      date || new Date()
    )
    console.log('days line ------ 242', days)

    if (ifInterest) {
      const amt = CalculateInitialInterest({
        annualInterest: Number(loanInterest),
        principal: Pamt,
        totalDays: days,
        interestCal: Number(selectedInterestCal),
        duration: loanDuration ?? 1
      })
      console.log('amt line ----- 175', amt)
      // setNewLoan({ ...newLoan, initialInterestAmt: amt })
      setInitialInterestAmt(amt)
    } else {
      setInitialInterestAmt(0)
    }
  }

  const getLoanEntireDetails = (value?: number) => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/selectedLoanDetails',
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
        setOldBalanceAmt(data.data.finalBalanceAmt)
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
    console.log('Loan line ----- 230', Loan)
    console.log('LoanType lin e----- 231', LoanType)
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
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/CreateNewLoan',
        {
          todayDate: date,
          refUserId: vendorId?.refVendorId,
          refLoanDuration: loanDuration,
          refLoanInterest: loanInterest,
          refLoanAmount: FinalLoanAmt.toFixed(2),
          refLoanDueDate: getDateAfterMonths(rePaymentDate, Number(loanDuration)),
          refPayementType: 'bank',
          refRepaymentStartDate: rePaymentDate.toLocaleDateString('en-CA'),
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
          oldBalanceAmt: (Number(oldBalanceAmt) ?? 0).toFixed(2),
          refDocFee: docFee,
          refSecurity: security,
          refProductDurationType: selectedDurationType?.code,
          refProductMonthlyCal: selectedInterestCal
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

  const getVendorList = () => {
    axios
      .get(import.meta.env.VITE_API_URL + '/adminLoan/vendorList', {
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
        console.log('data line ----------- 334', data)
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          const venList = data.data
          venList.map((data, index) => {
            const name = `Name : ${data.refVendorName} | Mobile : ${data.refVendorMobileNo} | Vendor Type : ${data.refVenderType === 1 ? 'Outside Vendor' : 'Bank'}`
            venList[index] = { ...venList[index], refVendorName: name }
          })

          setVendorList(venList)
        }
      })
  }

  useEffect(() => {
    getVendorList()
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
    console.log('productId line ------ 465', selectedRepaymentType)
    setLoanSummary(true)
    if (true) {
      console.log(' -> Line Number ----------------------------------- 468')
      // loanCalculation(loanCalculationData)
      const summaryDatas = {
        newLoanAmount: formatINRCurrency(newLoanAmt),
        oldLoanAmount: formatINRCurrency(oldBalanceAmt),
        FinalLoanAmount: formatINRCurrency(FinalLoanAmt),
        Interest: `${loanInterest} %`,
        Duration: `${loanDuration} ${selectedDurationType?.code === 1 ? 'Months' : selectedDurationType?.code === 2 ? 'Weeks' : 'Days'}`,
        rePaymentType:
          selectedRepaymentType === 1
            ? 'Flat Loan'
            : selectedRepaymentType
              ? 'Diminishing Loan'
              : 'Interest Based',
        rePaymentDate: rePaymentDate?.toLocaleDateString('en-CA'),

        interestCalType: selectedInterestCal === 1 ? 'Day Wise Calculation' : 'Overall Calculation',
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
      <h2>
        <b className="text-[1.2rem]">Add New Loan</b>
      </h2>
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
              <div className="w-full flex justify-content-around my-1">
                <div className="w-[73%]">
                  <label className="font-bold block mb-2">Select vendor</label>
                  <Dropdown
                    filter
                    value={vendorId}
                    className="w-full"
                    onChange={(e: DropdownChangeEvent) => {
                      console.log('VendorId', vendorId)
                      console.log('e.value line ----- 377', e.value)
                      setVendorId(e.value)
                      console.log('e.value.refVendorId', e.value.refVendorId)
                      // show(selectedLoanType, e.value)
                    }}
                    options={vendorList}
                    optionLabel="refVendorName"
                    placeholder="Select Vendor"
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
                    maxDate={new Date()}
                    // minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                  />
                </div>
              </div>
              <div className="w-full flex justify-content-around my-1">
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Loan Type</label>
                  <Dropdown
                    value={selectedLoanType}
                    className="w-full"
                    disabled={vendorId === null || vendorId === undefined}
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedLoanType(e.value)
                      getUserLoanData()
                      getAllLoanData()
                      setSelectedLoan(null)
                      setStep(0)
                      show(e.value, null)
                    }}
                    required
                    options={loanTypeOptions}
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
                      if (selectedLoanType) {
                        show(selectedLoanType, e.value)
                      }
                    }}
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
                              Loan Interest : <b> {loadDetailsResponse?.loanInterest}</b>
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
                              Interest Paid (First) :{' '}
                              <b> {loadDetailsResponse?.interestFirst === true ? 'Yes' : 'No'}</b>
                            </p>
                          </div>
                          <div className="flex-1">
                            <p>
                              Initial Interest - Amt :{' '}
                              <b>₹ {loadDetailsResponse?.initialInterest}</b>
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
                    <div className="w-[45%] flex justify-between">
                      <div className="w-[48%]">
                        <label className="font-bold block mb-2">Loan Duration</label>
                        <InputNumber
                          className="w-full"
                          placeholder="Enter Loan Duration"
                          required
                          disabled={step < 0}
                          value={loanDuration}
                          onChange={(e: any) => {
                            setStep(0.3)
                            setLoanDuration(e.value)
                            setSelectedDurationType(null)
                          }}
                          locale="en-IN"
                        />
                      </div>
                      <div className="w-[48%]">
                        <label className="font-bold block mb-2">Select Duration Type</label>
                        <Dropdown
                          inputId="durationType"
                          value={selectedDurationType}
                          onChange={(e) => {
                            setStep(0.5)
                            setSelectedDurationType(e.value)
                            setLoanInterest(null)
                            getDateRange(e.value.code)

                            setSelectedInterestCal(null)
                          }}
                          options={durationType}
                          disabled={step < 0.3}
                          optionLabel="name"
                          placeholder="Select Duration"
                          className="w-full"
                          required
                        />
                      </div>
                    </div>
                    <div className="w-[45%] flex justify-between">
                      <div className="w-[48%]">
                        <label className="font-bold block mb-2">Enter Loan Interest</label>
                        <InputNumber
                          className="w-full"
                          placeholder="Enter Loan Interest"
                          required
                          disabled={step < 0.5}
                          value={loanInterest}
                          onChange={(e: any) => {
                            setLoanInterest(e.value)
                            setStep(1)
                            setBankId(null)
                            setSelectedRepaymentType(null)
                            const value = parseFloat(e.value) || 0
                            const balance = oldBalanceAmt ?? 0
                            setFinalLoanAmt(Number(value) + Number(balance))
                            initialInterest(Number(value) + Number(balance), ifInitialIntrest)
                          }}
                          suffix=" %"
                          locale="en-IN"
                        />
                      </div>
                      <div className="w-[48%]">
                        <label className="font-bold block mb-2">Select Repayment Type</label>
                        <Dropdown
                          value={selectedRepaymentType}
                          disabled={step < 1}
                          required
                          className="w-full"
                          onChange={(e: DropdownChangeEvent) => {
                            setSelectedRepaymentType(e.value)
                            setStep(2)
                            if (selectedDurationType) {
                              if (selectedDurationType.code !== 1) {
                                setStep(2.5)
                              }
                            }
                            setNewLoanAmt(null)
                          }}
                          options={rePaymentTypeOptions}
                          optionLabel="name"
                          placeholder="Select Re-payment Type"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-content-around my-1">
                    <div className="w-[45%] flex flex-row justify-content-between gap-x-2">
                      {selectedDurationType?.code === 1 && (
                        <div className="w-[48%]">
                          <label className="font-bold block mb-2">Interest Calculation Type</label>

                          <Dropdown
                            value={selectedInterestCal}
                            options={interestCalculationType}
                            optionLabel="name"
                            optionValue="code"
                            placeholder="Interest Calculation Type"
                            disabled={step < 2 || selectedDurationType.code !== 1}
                            onChange={(e: any) => {
                              console.log('e', e)
                              setStep(2.5)
                              setSelectedInterestCal(e.value)
                            }}
                            className="w-full"
                            required
                          />
                        </div>
                      )}

                      <div className="w-full">
                        <div className="w-full">
                          <label className="font-bold block mb-2">Enter Loan Amount</label>
                          <InputNumber
                            className="w-full"
                            placeholder="Enter Loan Amount"
                            inputId="currency-india"
                            required
                            disabled={step < 2.5}
                            value={newLoanAmt}
                            onChange={(e: any) => {
                              setNewLoanAmt(e.value)
                              setStep(3)
                              setBankId(null)
                              const value = parseFloat(e.value) || 0
                              const balance = oldBalanceAmt ?? 0
                              setFinalLoanAmt(Number(value) + Number(balance))
                              initialInterest(Number(value) + Number(balance), ifInitialIntrest)
                            }}
                            mode="currency"
                            currency="INR"
                            currencyDisplay="symbol"
                            locale="en-IN"
                          />
                        </div>
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
                      <label className="font-bold block mb-2">Select Amount To</label>
                      <Dropdown
                        value={bankId}
                        disabled={step < 3}
                        className="w-full"
                        required
                        onChange={(e: DropdownChangeEvent) => {
                          setBankId(e.value)
                          setStep(4)
                        }}
                        options={bankList}
                        optionLabel="refBankName"
                        placeholder="Select Amount To"
                      />
                    </div>
                  </div>
                  <div className="w-full flex flex-row justify-content-around my-1">
                    <div className="w-[45%] ml-[1rem] flex justify-between">
                      <div className="w-[65%]">
                        <label className="font-bold block mb-2">Select Loan Re-Payment Date</label>
                        <Calendar
                          placeholder="Repayment Schedule Date"
                          disabled={step < 4}
                          dateFormat="dd/mm/yy"
                          className="w-full"
                          required
                          value={rePaymentDate ?? undefined}
                          onChange={(e: any) => {
                            console.log('e', e)
                            setRePaymentDate(e.value)
                            setStep(5)
                            setInterestFirst(null)
                            setIfInitialInterest(true)
                          }}
                          minDate={minDate ?? undefined}
                          maxDate={maxDate ?? undefined}
                          viewDate={viewDate}
                        />
                      </div>
                      <div className="w-[30%]">
                        <label className="font-bold block mb-2">Initial Interest</label>
                        <Dropdown
                          value={ifInitialIntrest}
                          disabled={step < 5}
                          className="w-full"
                          required
                          onChange={(e: DropdownChangeEvent) => {
                            setIfInitialInterest(e.target.value)
                            setStep(5.5)
                            setInterestFirst(null)
                            initialInterest(
                              Number(newLoanAmt) + Number(oldBalanceAmt ?? 0),
                              e.target.value
                            )
                          }}
                          options={initialInterestOption}
                          optionLabel="name"
                          optionValue="value"
                          placeholder="Select Initial Interest"
                        />
                      </div>
                    </div>
                    <div className="w-[45%] flex align-items-center">
                      <div className="w-[40%] ml-[2rem]">
                        <label className="font-bold block mb-2">Interest First</label>
                        <div className="flex flex-row gap-x-5 w-[100%]">
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="ingredient1"
                              name="pizza"
                              value="true"
                              required
                              disabled={step < 5.5}
                              onChange={(_e: RadioButtonChangeEvent) => {
                                setInterestFirst(true)
                                setMonthCount(1)
                                setStep(6)
                                setDocFee(null)
                                calculateInterest({
                                  Interest: Number(loanInterest),
                                  PrincipalAmt: Number(FinalLoanAmt),
                                  monthCount: 1,
                                  rePaymentDate: rePaymentDate?.toString() || '',
                                  rePaymentType:
                                    (selectedRepaymentType as any)?.value ??
                                    selectedRepaymentType ??
                                    1,
                                  loanDuration: Number(loanDuration),
                                  durationType: selectedDurationType?.code,
                                  interestCal: selectedInterestCal || 0
                                })
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
                              disabled={step < 5}
                              value="Mushroom"
                              required
                              onChange={(_e: RadioButtonChangeEvent) => {
                                setInterestFirst(false)
                                setMonthCount(0)
                                setInterestFirstAmt(0)
                                setStep(6)
                                setDocFee(null)
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
                            {selectedDurationType?.code === 1
                              ? 'Month'
                              : selectedDurationType?.code === 2
                                ? 'Weeks'
                                : 'Days'}
                          </label>
                          <InputNumber
                            className="w-full"
                            inputId="expiry"
                            disabled={step < 6}
                            value={monthCount}
                            required
                            onChange={(e: any) => {
                              setMonthCount(e.value)
                              setStep(7)
                              setDocFee(null)
                              calculateInterest({
                                Interest: Number(loanInterest),
                                PrincipalAmt: Number(FinalLoanAmt),
                                monthCount: e.value || 1,
                                rePaymentDate: rePaymentDate?.toString() || '',
                                rePaymentType:
                                  (selectedRepaymentType as any)?.value ??
                                  selectedRepaymentType ??
                                  1,
                                loanDuration: Number(loanDuration),
                                durationType: selectedDurationType?.code,
                                interestCal: selectedInterestCal || 0
                              })
                            }}
                            suffix={
                              selectedDurationType?.code === 1
                                ? ' Month'
                                : selectedDurationType?.code === 2
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
                        disabled={step < 6}
                        value={docFee}
                        required
                        mode="currency"
                        currency="INR"
                        currencyDisplay="symbol"
                        locale="en-IN"
                        onChange={(e: any) => {
                          setDocFee(e.value)
                          setSecurity('')
                          setStep(7)
                        }}
                      />
                    </div>
                    <div className="w-[45%]">
                      <label className="font-bold block mb-2">Security</label>
                      <InputTextarea
                        className="w-full"
                        value={security}
                        disabled={step < 7}
                        onChange={(e) => {
                          setSecurity(e.target.value)
                          setStep(8)
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
                        Total Loan Amount : ₹ <b>{FinalLoanAmt}</b>
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
                        Interest For This{' '}
                        {selectedDurationType?.code === 1
                          ? 'Month'
                          : selectedDurationType?.code === 2
                            ? 'Weeks'
                            : 'Days'}{' '}
                        : ₹ <b>{initialInterestAmt.toFixed(2)}</b>
                      </p>
                    </div>
                    <div>
                      <p>
                        Interest for {monthCount}{' '}
                        {selectedDurationType?.code === 1
                          ? 'Month'
                          : selectedDurationType?.code === 2
                            ? 'Weeks'
                            : 'Days'}{' '}
                        : ₹ <b>{interestFirstAmt.toFixed(2)}</b>
                      </p>
                    </div>
                    <div>
                      <p>
                        Amount to User : ₹{' '}
                        <b>
                          {(
                            (newLoanAmt ?? 0) -
                            (initialInterestAmt ?? 0) -
                            (interestFirstAmt ?? 0)
                          ).toFixed(2)}
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              <div></div>
            </div>

            <div className="w-full flex justify-center">
              <button className="bg-[green] text-white py-2 px-10 rounded-md shadow-md">
                View Loan Details
              </button>
            </div>
          </form>
        </>
      )}

      {loanSummary && (
        <>
          <div>
            <b className="text-[1.2rem]">Loan Details</b>
          </div>
          <div className="my-5 flex flex-col gap-y-5">
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

export default AdminLoanCreation
