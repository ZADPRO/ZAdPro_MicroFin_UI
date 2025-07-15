import axios from 'axios'
import { TabPanel, TabView } from 'primereact/tabview'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast, ToastContainer } from 'react-toastify'
// import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
// import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'

import { BsInfoCircle } from 'react-icons/bs'
import { IoCloseCircleOutline } from 'react-icons/io5'
import LoanAudit from '../LoanAudit/LoanAudit'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { getSettingData, SettingData } from '@renderer/helper/SettingsData'
import { Nullable } from 'primereact/ts-helpers'
import { formatToCustomDateTime } from '@renderer/helper/date'

interface RePaymentForm {
  interestAmt: number
  principalAmt: number
  totalAmt: number
  TotalPaidAmt: number
  BalanceAmount: number
  loanClosingBalance: number
}

interface FollowUpForm {
  Message: string
  Date: any
}

interface Bank {
  name: string
  code: string
}

const RepaymentSideTab = ({ custId, id, closeSidebarUpdate, loanId, rePayId }) => {
  console.log('id', id)
  console.log('rePayId', rePayId)
  console.log('loanId', loanId)
  // const [priamt, setPriAmt] = useState<number>(0)

  const [loading, setLoading] = useState(false)
  const [rePaymentInfo, setRePaymentInfo] = useState(false)
  const [rePaymentForm, setRePaymentForm] = useState<RePaymentForm>({
    interestAmt: 0,
    principalAmt: 0,
    totalAmt: 0,
    TotalPaidAmt: 0,
    BalanceAmount: 0,
    loanClosingBalance: 0
  })
  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    Message: '',
    Date: null
  })
  const [loanDetails, setLoanDetails] = useState<any>()

  const [selectBank, setSelectBank] = useState<Bank | null>(null)
  const [selectCash, setSelectCash] = useState<Bank | null>(null)
  const [bankOption, setBankOption] = useState([])
  const [cashOption, setCashOption] = useState([])
  // const [paymentType, setPaymentType] = useState<string>('')
  const [paymentSettingData, setPaymentSettingData] = useState<SettingData>()
  const [amountInCash, setAmountInCash] = useState<string | null>(null)
  const [amountInBank, setAmountInBank] = useState<string | null>(null)
  const [date, setDate] = useState<Nullable<Date>>(new Date())
  const getLoanData = async () => {
    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/rePayment/rePaymentCalculation',
          {
            loanId: loanId,
            rePayId: rePayId
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
          console.log('data line ----- 205', data)
          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            setLoading(false)
            setLoanDetails(data.data[0])

            console.log('line ---- 7777')
            console.log('data.data[0].refInterestStatus', data.data[0].refInterestStatus)
            setRePaymentForm({
              ...rePaymentForm,
              interestAmt: Number(data.data[0].refInterest),
              BalanceAmount: Number(data.data[0].refArears),
              principalAmt: Number(data.data[0].refPrincipal),
              totalAmt: Number(data.data[0].refRepaymentAmount),
              TotalPaidAmt:
                Number(data.data[0].refPaidInterest) + Number(data.data[0].refPaidPrincipal),
              loanClosingBalance: Number(data.data[0].loanClosingBalance)
            })
            // setPriAmt(
            //   data.data[0].refPrincipalStatus === 'paid' ? 0 : Number(data.data[0].refPrincipal)
            // )

            const options = data.bank
              .filter((item: any) => item.refAccountType === 1)
              .map((item: any) => ({
                label: `Bank Name: ${item.refBankName} - Bank Ac.No: ${item.refBankAccountNo} - IFSC Code: ${item.refIFSCsCode}`,
                value: item.refBankId
              }))

            setBankOption(options)
            const options1 = data.bank
              .filter((item: any) => item.refAccountType === 2)
              .map((item: any) => ({
                label: `Cash Name: ${item.refBankName}`,
                value: item.refBankId
              }))

            setCashOption(options1)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const updateRepayment = () => {
    console.log('selectBank', selectBank)
    console.log('selectCash', selectCash)
    axios
      .post(
        import.meta.env.VITE_API_URL + '/rePayment/updateRePayment',
        {
          payDate: formatToCustomDateTime(date ?? new Date()),
          rePayId: rePayId,
          cashAmt: amountInCash,
          onlineAmt: amountInBank,
          paidTotalAmount: Number(amountInCash) + Number(amountInBank),
          bankId: selectBank,
          cashId: selectCash
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
        console.log('data line ------ 246', data)
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          toast.success('Re-Payment Updated Successfully', {
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
          closeSidebarUpdate()
        } else {
          toast.error(`${data.error}`, {
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

  const updateFollowUp = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/rePayment/updateFollowUp',
        {
          rePayId: rePayId,
          message: followUpForm.Message,
          nextDate: followUpForm.Date
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
          toast.success('Follow Up Updated Successfully', {
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
          closeSidebarUpdate()
        } else {
          toast.error('Error in Updating the Follow Up', {
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

  useEffect(() => {
    getLoanData()
    const getSetData = async () => {
      const settingdatas = await getSettingData()
      console.log('settingdatas line ------ 172', settingdatas)
      setPaymentSettingData(settingdatas)
    }
    getSetData()
  }, [])

  const [activeIndex, setActiveIndex] = useState(0)

  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString)

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // months are 0-indexed
    const day = '01'

    return `${year}-${month}-${day}`
  }

  return (
    <>
      <ToastContainer />
      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>{custId}</div>
      {loading ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#0478df',
              height: '76vh',
              width: '100%'
            }}
          >
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
          </div>
        </>
      ) : (
        <>
          <div className="w-full my-3 border-2 border-transparent rounded-md shadow-3">
            <div className="m-3 w-full flex ">
              <div className="w-[30%]">
                <p>Payment Month : {loanDetails?.refPaymentDate}</p>
              </div>
              <div className="w-[30%]">
                <p>Total Amount : &#8377; {loanDetails?.refLoanAmount}</p>
              </div>
              <div className="w-[30%]">
                <p>Balance Amount : &#8377; {loanDetails?.refBalanceAmt}</p>
              </div>
              {!rePaymentInfo ? (
                <div className="w-[10%]">
                  <BsInfoCircle
                    size={'1.5rem'}
                    color="blue"
                    onClick={() => {
                      setRePaymentInfo(true)
                    }}
                  />
                </div>
              ) : (
                <div className="w-[10%]">
                  <IoCloseCircleOutline
                    size={'1.7rem'}
                    color="red"
                    onClick={() => {
                      setRePaymentInfo(false)
                    }}
                  />
                </div>
              )}
            </div>
            {rePaymentInfo && (
              <>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Loan Duration : {loanDetails?.refProductDuration}{' '}
                      {loanDetails.refLoanDueType === 1
                        ? 'Months'
                        : loanDetails.refLoanDueType === 2
                          ? 'Weeks'
                          : 'Days'}
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>Interest : {loanDetails?.refProductInterest}%</p>
                  </div>
                  <div className="w-[30%]">
                    <p>Re-Payment Type : {loanDetails?.refRepaymentTypeName}</p>
                  </div>
                </div>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Interest Paid Initial : {loanDetails?.isInterestFirst === true ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>No of Month Paid First : {loanDetails?.refInterestMonthCount} Month</p>
                  </div>
                  <div className="w-[30%]">
                    <p>Initial Interest : ₹ {loanDetails?.refInitialInterest}</p>
                  </div>
                </div>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>Loan Get Date : {loanDetails?.refLoanStartDate}</p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Loan Start Month :{' '}
                      {loanDetails.refRepaymentStartDate
                        ? formatToFirstOfMonth(loanDetails.refRepaymentStartDate)
                        : ' -'}
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>Loan End Month : {loanDetails?.refLoanDueDate}</p>
                  </div>
                </div>

                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>Total Interest Paid : &#8377; {loanDetails?.totalInterest}</p>
                  </div>
                  <div className="w-[30%]">
                    <p>Total Principal Paid : &#8377; {loanDetails?.totalPrincipal}</p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Interest Calculation :{' '}
                      {loanDetails.refInterestCalType === 2
                        ? 'Month Wise Interest'
                        : 'Day wise Interest'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => {
              console.log(e.index)
              setActiveIndex(e.index)
            }}
            style={{ marginTop: '1rem' }}
          >
            <TabPanel header="Re-Payment">
              <div className="my-0 w-full">
                <div className="my-1">
                  <b className="text-[1.2rem]">Re-Payment Details</b>
                </div>
                <div className="flex flex-col gap-0 shadow-3 p-2 rounded-md">
                  <div className="flex gap-x-5">
                    <div className="flex-1 p-1 rounded-md">
                      <p>
                        Interest Amount : &#8377; <b>{rePaymentForm.interestAmt}</b>{' '}
                      </p>
                    </div>
                    <div className="flex-1 p-1 rounded-md">
                      <p>
                        Principal Amount : &#8377; <b>{rePaymentForm.principalAmt}</b>
                      </p>
                    </div>
                    <div className="flex-1 p-1 rounded-md">
                      <p>
                        Total Due Amount : &#8377; <b>{rePaymentForm.totalAmt}</b>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-x-5">
                    <div className="flex-1 p-1 rounded-md">
                      <p>
                        Paid Due Amount : &#8377; <b>{rePaymentForm.TotalPaidAmt}</b>{' '}
                      </p>
                    </div>
                    <div className="flex-1 p-1 rounded-md">
                      <p>
                        Pending Due Amount : &#8377; <b>{rePaymentForm.BalanceAmount}</b>{' '}
                      </p>
                    </div>
                    <div className="flex-1  p-1 rounded-md">
                      <p>
                        Loan Closing Amount : &#8377; <b>{rePaymentForm.loanClosingBalance}</b>
                      </p>
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="my-3 flex justify-between">
                  <div>
                    <b className="text-[1.2rem]">New Entry</b>
                  </div>
                  <div>
                    <Calendar
                      value={date}
                      onChange={(e) => setDate(e.value)}
                      dateFormat="dd/mm/yy"
                      maxDate={new Date()}
                      // minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                    />
                  </div>
                </div>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    updateRepayment()
                  }}
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label>Enter Collected Amount in Cash</label>
                      <InputText
                        keyfilter="int"
                        required
                        placeholder="Amount in Cash"
                        value={amountInCash}
                        onChange={(e) => setAmountInCash(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label>Enter Collected Amount in Bank</label>
                      <InputText
                        keyfilter="int"
                        required
                        placeholder="Amount in Bank"
                        value={amountInBank}
                        onChange={(e) => setAmountInBank(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label>Total Amount Collected</label>
                      <InputText
                        keyfilter="int"
                        required
                        placeholder="Total Amount"
                        value={String(Number(amountInCash) + Number(amountInBank))}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {((paymentSettingData?.paymentMethod === 1 &&
                      paymentSettingData.rePaymentMethod === 1 &&
                      loanDetails?.refAccountType === 1) ||
                      (paymentSettingData?.paymentMethod === 1 &&
                        paymentSettingData.rePaymentMethod === 2) ||
                      paymentSettingData?.paymentMethod === 2) && (
                      <div className="flex-1">
                        <label>Select Bank Account</label>
                        <Dropdown
                          value={selectBank}
                          onChange={(e: DropdownChangeEvent) => setSelectBank(e.value)}
                          options={bankOption}
                          required={Number(amountInBank) > 0}
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select an Account"
                          className="w-full"
                        />
                      </div>
                    )}

                    {((paymentSettingData?.paymentMethod === 1 &&
                      paymentSettingData.rePaymentMethod === 1 &&
                      loanDetails?.refAccountType === 2) ||
                      (paymentSettingData?.paymentMethod === 1 &&
                        paymentSettingData.rePaymentMethod === 2) ||
                      paymentSettingData?.paymentMethod === 3) && (
                      <div className="flex-1">
                        <label>Select Cash Flow</label>
                        <Dropdown
                          value={selectCash}
                          onChange={(e: DropdownChangeEvent) => setSelectCash(e.value)}
                          options={cashOption}
                          optionValue="value"
                          optionLabel="label"
                          required={Number(amountInCash) > 0}
                          placeholder="Select an Account"
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="bg-[green] w-[50%] p-2 px-7 text-white my-3 rounded-lg hover:bg-[#008000f1]"
                    >
                      Submit Loan Due amount
                    </button>
                  </div>
                </form>
              </div>
            </TabPanel>
            <TabPanel header="Follow up">
              <form
                className=""
                onSubmit={(e) => {
                  e.preventDefault()
                  updateFollowUp()
                }}
              >
                <div className="w-[100%] flex flex-col justify-center align-items-center">
                  <div className="w-[60%]">
                    <label htmlFor="Message" className="font-bold block mb-2">
                      Comment Given By User
                    </label>
                    <InputTextarea
                      required
                      className="h-full"
                      placeholder="Type your Message Here"
                      value={followUpForm.Message}
                      onChange={(e) =>
                        setFollowUpForm({ ...followUpForm, Message: e.target.value ?? '' })
                      }
                      rows={5}
                      cols={30}
                    />
                  </div>
                  <div className="w-[60%]">
                    <label htmlFor="Date and Time" className="font-bold block mb-2">
                      Date and Time Asked By the User
                    </label>
                    <Calendar
                      required
                      className="w-full"
                      value={followUpForm.Date}
                      onChange={(e) =>
                        setFollowUpForm({ ...followUpForm, Date: e.target.value ?? '' })
                      }
                      showTime
                      hourFormat="12"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[green] p-2 px-7 text-white my-3 rounded-lg hover:bg-[#008000f1]"
                  >
                    Submit Message
                  </button>
                </div>
              </form>
            </TabPanel>
            <TabPanel header="Audit">
              <LoanAudit loanId={loanId} />
            </TabPanel>
          </TabView>
        </>
      )}
    </>
  )
}

export default RepaymentSideTab
