import axios from 'axios'
import { TabPanel, TabView } from 'primereact/tabview'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'

import { BsInfoCircle } from 'react-icons/bs'
import { IoCloseCircleOutline } from 'react-icons/io5'
import LoanAudit from '../LoanAudit/LoanAudit'

interface RePaymentForm {
  interestAmt: number
  BalanceAmount: number
  BalanceStatus: boolean
  interestStatus: boolean
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
  const [priamt, setPriAmt] = useState<number>(0)

  const [loading, setLoading] = useState(false)
  const [rePaymentInfo, setRePaymentInfo] = useState(false)
  const [rePaymentForm, setRePaymentForm] = useState<RePaymentForm>({
    interestAmt: 0,
    BalanceAmount: 0,
    BalanceStatus: false,
    interestStatus: false
  })
  const [followUpForm, setFollowUpForm] = useState<FollowUpForm>({
    Message: '',
    Date: null
  })
  const [loanDetails, setLoanDetails] = useState<any>()

  const [selectBank, setSelectBank] = useState<Bank | null>(null)
  const [bankOption, setBankOption] = useState([])
  const [paymentType, setPaymentType] = useState<string>('')

  const getLoanData = () => {
    axios
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
            interestAmt: Number(data.data[0].InteresePay),
            BalanceAmount: Number(data.data[0].refPrincipal),
            BalanceStatus: data.data[0].refPrincipalStatus === 'paid' ? true : false,
            interestStatus: data.data[0].refInterestStatus === 'paid' ? true : false
          })
          setPriAmt(
            data.data[0].refPrincipalStatus === 'paid' ? 0 : Number(data.data[0].refPrincipal)
          )

          const options = data.bank.map((data: any) => ({
            label: `Bank Name : ${data.refBankName} - Bank Ac.No : ${data.refBankAccountNo} - IFSC Code : ${data.refIFSCsCode}`,
            value: data.refBankId
          }))
          console.log('options', options)
          setBankOption(options)
        }
      })
  }

  const updateRepayment = () => {
    console.log('paymentType line ----- 101', paymentType)
    axios
      .post(
        import.meta.env.VITE_API_URL + '/rePayment/updateRePayment',
        {
          priAmt: rePaymentForm.BalanceAmount,
          interest: rePaymentForm.interestAmt,
          bankId: selectBank,
          paymentType: paymentType === 'online' ? 1 : 2,
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
                      {loanDetails.refProductDurationType === 1
                        ? 'Months'
                        : loanDetails.refProductDurationType === 2
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
                      {loanDetails.refProductMonthlyCal === 2
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
                  <b className="text-[1.2rem]">Re-Payment Form</b>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault(), updateRepayment()
                  }}
                  className="w-full"
                >
                  <div className="w-[100%] flex flex-col align-items-center gap-3">
                    <div className="flex flex-row w-[80%] justify-between">
                      <div className="w-[30%]">
                        <label htmlFor="Interest" className="font-bold block mb-2">
                          Interest Amount
                        </label>
                        <InputNumber
                          disabled
                          className="w-full"
                          inputId="percent"
                          value={
                            rePaymentForm.interestStatus ? 0 : Number(rePaymentForm.interestAmt)
                          }
                          onValueChange={(e) =>
                            setRePaymentForm({
                              ...rePaymentForm,
                              interestAmt: e.value ?? 0
                            })
                          }
                          prefix="&#8377; "
                        />
                      </div>
                      <div className="w-[30%]">
                        <label htmlFor="Principal" className="font-bold block mb-2">
                          Principal Amount
                        </label>
                        <InputNumber
                          required
                          className="w-full"
                          inputId="percent"
                          value={rePaymentForm.BalanceStatus ? 0 : rePaymentForm.BalanceAmount}
                          min={priamt}
                          max={loanDetails?.refBalanceAmt}
                          onChange={(e) => {
                            let val = e.value ?? 0

                            const min = rePaymentForm.BalanceAmount
                            const max = loanDetails?.refBalanceAmt ?? Number.MAX_SAFE_INTEGER

                            if (val < min) val = min
                            if (val > max) val = max

                            setRePaymentForm({
                              ...rePaymentForm,
                              BalanceAmount: val
                            })
                          }}
                          prefix="₹ "
                        />
                      </div>
                      <div className="w-[30%]">
                        <label htmlFor="Principal" className="font-bold block mb-2">
                          Total Amount
                        </label>
                        <InputNumber
                          required
                          className="w-full"
                          inputId="percent"
                          value={
                            rePaymentForm.BalanceAmount +
                            (rePaymentForm.interestStatus ? 0 : rePaymentForm.interestAmt)
                          }
                          disabled
                          prefix="&#8377; "
                        />
                      </div>
                    </div>
                    {/* <div className="flex-auto w-[60%]">

                                        </div> */}
                    <div className="flex flex-col w-[60%]">
                      <label htmlFor="Principal" className="font-bold block mb-2">
                        Payment Type
                      </label>

                      <div className="flex flex-start gap-3">
                        <div className="flex align-items-center">
                          <RadioButton
                            required
                            inputId="ingredient1"
                            name="pizza"
                            value="online"
                            onChange={(e: RadioButtonChangeEvent) => setPaymentType(e.value)}
                            checked={paymentType === 'online'}
                          />
                          <label htmlFor="ingredient1" className="ml-2">
                            Online
                          </label>
                        </div>
                        <div className="flex align-items-center">
                          <RadioButton
                            required
                            inputId="ingredient2"
                            name="pizza"
                            value="cash"
                            onChange={(e: RadioButtonChangeEvent) => setPaymentType(e.value)}
                            checked={paymentType === 'cash'}
                          />
                          <label htmlFor="ingredient2" className="ml-2">
                            Cash
                          </label>
                        </div>
                      </div>
                    </div>
                    {paymentType === 'online' && (
                      <div className="w-[60%]">
                        <label htmlFor="Interest" className="font-bold block mb-2">
                          Select Bank
                        </label>

                        <Dropdown
                          filter
                          required
                          value={selectBank}
                          onChange={(e: DropdownChangeEvent) => {
                            console.log('line --------------------- 452', e.value)
                            setSelectBank(e.value)
                          }}
                          options={bankOption}
                          optionLabel="label"
                          placeholder="Select a Bank"
                          className="w-full"
                          checkmark={true}
                          highlightOnSelect={false}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className=" bg-[green] hover:bg-[#008000f3] text-white p-2 px-5 rounded-lg"
                    >
                      Payment Collected
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
