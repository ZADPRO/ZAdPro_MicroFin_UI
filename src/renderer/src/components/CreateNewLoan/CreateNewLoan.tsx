import React, { useState } from 'react'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Divider } from 'primereact/divider'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { Calendar } from 'primereact/calendar'
import { Slide, toast, ToastContainer } from 'react-toastify'

import { InputNumber } from 'primereact/inputnumber'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'
import { CalculateFirstInterest, CalculateInterest, FirstInterest } from '@renderer/helper/loanFile'
import { getRemainingDaysInCurrentMonth } from '../../helper/loanFile'
import { getDateAfterMonths } from '@renderer/helper/date'

interface CreateNewLoanProps {
  id: number
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
}

const CreateNewLoan: React.FC<CreateNewLoanProps> = ({ id, goToHistoryTab }) => {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const [rePaymentDate, setRePaymentDate] = useState<Date>(nextMonth)
  const [newLoanAmt, setNewLoanAmt] = useState<number | null>()
  const [oldBalanceAmt, setOldBalanceAmt] = useState<number | null>(0)
  const [FinalLoanAmt, setFinalLoanAmt] = useState<number>(0)
  const [interestFirst, setInterestFirst] = useState<boolean | null>(false)
  const [monthCount, setMonthCount] = useState<number>(0)
  const [bankId, setBankId] = useState<number | null>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [interestFirstAmt, setInterestFirstAmt] = useState<number>(0)
  const [initialInterestAmt, setInitialInterestAmt] = useState<number>(0)
  const [loadDetailsResponse, setLoanDetailsReponse] = useState<LoadDetailsResponseProps | null>(
    null
  )
  const [selectedLoanType, setSelectedLoanType] = useState<number>(0)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [showLoanInfo, setShowLoanInfo] = useState<boolean>(false)
  const loanTypeOptions: LoanType[] = [
    { name: 'New Loan', value: 1 },
    { name: 'Loan TopUp', value: 2 },
    { name: 'Loan Extension', value: 3 }
  ]
  const [selectedRepaymentType, setSelectedRepaymentType] = useState<LoanType | null>(null)
  const rePaymentTypeOptions: LoanType[] = [
    { name: 'Flat Loan', value: 1 },
    { name: 'Diminishing Loan', value: 2 }
  ]
  const [userLoan, setUserLoan] = useState<any[]>([])
  const [selectedLoan, setSelectedLoan] = useState<any[]>([])
  const [loanProduct, setLoanProduct] = useState<any[]>([])
  const [bankList, setBankList] = useState<any[]>([])
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  const [step, setStep] = useState(0)

  const handleBack = () => {
    goToHistoryTab()
  }

  const getUserLoanData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/adminRoutes/addLoanOption`,
        { userId: id },
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
          name: `Loan Amt : ${d.refLoanAmount} - Interest : ${d.refProductInterest} - Duration : ${d.refProductDuration}`,
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
        import.meta.env.VITE_API_URL + '/adminRoutes/getLoan',
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

        if (data.success) {
          console.log('data =======> ', data)
          const productList = data.productList
          data.productList.map((data, index) => {
            const name = `Name : ${data.refProductName} - Interest : ${data.refProductInterest} %- Duration : ${data.refProductDuration} Months`
            productList[index] = { ...productList[index], refProductName: name }
          })
          setLoanProduct(productList)

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
    console.log('data', data)
    const firstInterestAmt = await CalculateFirstInterest(data)
    console.log('firstInterestAmt line ---- 149', firstInterestAmt)
    // setNewLoan({ ...newLoan, interestFirstAmt: firstInterestAmt })
    setInterestFirstAmt(firstInterestAmt)
  }

  const initialInterest = (Pamt) => {
    const days = getRemainingDaysInCurrentMonth()
    console.log('days', days)
    const amt = CalculateInterest({
      annualInterest: parseInt(productId?.refProductInterest),
      principal: Pamt,
      totalDays: days
    })
    console.log('amt line ----- 175', amt)
    // setNewLoan({ ...newLoan, initialInterestAmt: amt })
    setInitialInterestAmt(amt)
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

  const show = (LoanType: number, Loan: number) => {
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
    axios
      .post(
        import.meta.env.VITE_API_URL + '/newLoan/CreateNewLoan',
        {
          refUserId: id,
          refProductId: productId?.refProductId,
          refLoanAmount: FinalLoanAmt.toFixed(2),
          refLoanDueDate: getDateAfterMonths(
            rePaymentDate,
            parseInt(productId?.refProductDuration)
          ),
          refPayementType: 'bank',
          refRepaymentStartDate: rePaymentDate,
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
          oldBalanceAmt: (oldBalanceAmt ?? 0).toFixed(2)
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

  return (
    <div>
      <ToastContainer />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handelSubmit()
        }}
      >
        <div className="w-[100%] flex flex-col justify-content-between">
          <div className="w-full flex justify-content-around my-1">
            <div className="w-[45%]">
              <label className="font-bold block mb-2">Select Loan Type</label>
              <Dropdown
                value={selectedLoanType}
                className="w-full"
                onChange={(e: DropdownChangeEvent) => {
                  setSelectedLoanType(e.value)
                  getUserLoanData()
                  getAllLoanData()
                  setSelectedLoan(null)
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
                  show(selectedLoanType, e.value)
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
                          Loan Duration : <b> {loadDetailsResponse?.loanDuration} Month</b>
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
                          Interest Paid (First) : <b> {loadDetailsResponse?.interestFirstMonth} Month</b>
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
                    <Divider layout="horizontal" className="flex" align="start">
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
                          Total Interest Paid : <b>₹ {loadDetailsResponse?.totalInterestPaid}</b>
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
                          Loan Duration : <b> {loadDetailsResponse?.loanDuration} Month</b>
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
              <Divider layout="horizontal" className="flex" align="start" />
              <div className="w-full flex justify-content-around my-1">
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Loan Duration and Interest</label>
                  <Dropdown
                  filter
                    value={productId}
                    required
                    className="w-full"
                    onChange={(e: DropdownChangeEvent) => {
                      setProductId(e.value)
                      setStep(1)
                      setSelectedRepaymentType(null)
                    }}
                    options={loanProduct}
                    optionLabel="refProductName"
                    placeholder="Select Product"
                  />
                </div>
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Repayment Type</label>
                  <Dropdown
                    value={selectedRepaymentType}
                    disabled={step < 1}
                    required
                    className="w-full"
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedRepaymentType(e.value)
                      setStep(2)
                      setNewLoanAmt(null)
                    }}
                    options={rePaymentTypeOptions}
                    optionLabel="name"
                    placeholder="Select Re-payment Type"
                  />
                </div>
              </div>
              <div className="w-full flex justify-content-around my-1">
                <div className="w-[45%] flex flex-row justify-content-between gap-x-2">
                  <div className="w-full">
                    <label className="font-bold block mb-2">Enter Loan Amount</label>
                    <InputNumber
                      className="w-full"
                      placeholder="Enter Loan Amount"
                      inputId="currency-india"
                      required
                      disabled={step < 2}
                      value={newLoanAmt}
                      onChange={(e: any) => {
                        setNewLoanAmt(e.value)
                        setStep(3)
                        setBankId(null)
                        const value = parseFloat(e.value) || 0
                        const balance = oldBalanceAmt ?? 0
                        setFinalLoanAmt(value + Number(balance))
                        initialInterest(value + Number(balance))
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
                    disabled={step < 3}
                    className="w-full"
                    required
                    onChange={(e: DropdownChangeEvent) => {
                      setBankId(e.value)
                      setStep(4)
                      setRePaymentDate(nextMonth)
                    }}
                    options={bankList}
                    optionLabel="refBankName"
                    placeholder="Select Amount From"
                  />
                </div>
              </div>
              <div className="w-full flex flex-row justify-content-around my-1">
                <div className="w-[45%]">
                  <label className="font-bold block mb-2">Select Loan Re-Payment Date</label>
                  <Calendar
                    placeholder="Repayment Schedule Date"
                    disabled={step < 4}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    required
                    value={rePaymentDate}
                    onChange={(e: any) => {
                      setRePaymentDate(e.value)
                      setStep(5)
                      setInterestFirst(null)
                    }}
                    minDate={nextMonthStart}
                    maxDate={nextMonthEnd}
                    viewDate={nextMonthStart}
                  />
                </div>
                <div className="w-[45%] flex align-items-center">
                  <div className="w-[40%]">
                    <label className="font-bold block mb-2">Interest First</label>
                    <div className="flex flex-row gap-x-5 w-[100%]">
                      <div className="flex align-items-center">
                        <RadioButton
                          inputId="ingredient1"
                          name="pizza"
                          value="true"
                          required
                          disabled={step < 5}
                          onChange={(e: RadioButtonChangeEvent) => {
                            setInterestFirst(true)
                            setMonthCount(1)
                            setStep(6)
                            calculateInterest({
                              Interest: parseInt(productId?.refProductInterest),
                              PrincipalAmt: Number(FinalLoanAmt),
                              monthCount: 1,
                              rePaymentDate: rePaymentDate?.toString() || '',
                              rePaymentType:
                                (selectedRepaymentType as any)?.value ?? selectedRepaymentType ?? 1,
                              loanDuration: Number(productId?.refProductDuration)
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
                          onChange={(e: RadioButtonChangeEvent) => {
                            setInterestFirst(false)
                            setMonthCount(0)
                            setInterestFirstAmt(0)
                            setStep(6)
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
                      <label className="font-bold block mb-2">Enter Number Of Month</label>
                      <InputNumber
                        className="w-full"
                        inputId="expiry"
                        disabled={step < 6}
                        value={monthCount}
                        required
                        onChange={(e: any) => {
                          setMonthCount(e.value)
                          setStep(7)
                          calculateInterest({
                            Interest: parseInt(productId?.refProductInterest),
                            PrincipalAmt: Number(FinalLoanAmt),
                            monthCount: e.value || 1,
                            rePaymentDate: rePaymentDate?.toString() || '',
                            rePaymentType:
                              (selectedRepaymentType as any)?.value ?? selectedRepaymentType ?? 1,
                            loanDuration: Number(productId?.refProductDuration)
                          })
                        }}
                        suffix=" Month"
                      />
                    </div>
                  )}
                </div>
                <div></div>
              </div>
            </div>
          )}

          {step >= 6 && (
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
                    Interest For This Month : ₹ <b>{initialInterestAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Interest for {monthCount} Month : ₹ <b>{interestFirstAmt.toFixed(2)}</b>
                  </p>
                </div>
                <div>
                  <p>
                    Amount to User : ₹{' '}
                    <b>
                      {(
                        (FinalLoanAmt ?? 0) -
                        (initialInterestAmt ?? 0) -
                        (interestFirstAmt ?? 0)
                      ).toFixed(2)}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div></div>
        </div>
        {step >= 6 && (
          <div className="w-full flex justify-center">
            <button className="bg-[green] text-white py-2 px-10 rounded-md shadow-md">
              Create Loan
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default CreateNewLoan
