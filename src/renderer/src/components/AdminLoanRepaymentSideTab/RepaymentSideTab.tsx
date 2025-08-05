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
import AdminLoanAudit from '../adminLoanAudit/AdminLoanAudit'
import { formatINRCurrency } from '@renderer/helper/amountFormat'
import { Nullable } from 'primereact/ts-helpers'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { formatToCustomDateTime } from '@renderer/helper/date'
import { getSettingData } from '@renderer/helper/SettingsData'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'

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
  value: number
  type: number
  balance: number
}

export interface SettingData {
  paymentMethod: number | null
  rePaymentMethod: number | null
  initialInterest: boolean | null
  weekStartEnd: String | null
  loanDueType: number | null
}

interface dueDetails {
  refArears: string
  refDuePaymentFor: string | null
  refInitialInterest: string | null
  refInterest: string
  refPaidInterest: string | null
  refPaidPrincipal: string | null
  refPaymentDate: string
  refPrincipal: string
  arearsAmt: string
}

interface BankOption {
  value: number | string
  label: string
  balance: string | number
}

const AdminLoanRepaymentSideTab = ({
  custId,
  id,
  closeSidebarUpdate,
  loanId,
  rePayId,
  loanCalculation
}) => {
  console.log('id', id)
  console.log('rePayId', rePayId)
  console.log('loanId', loanId)

  const [loading, setLoading] = useState(false)
  const [rePaymentInfo, setRePaymentInfo] = useState(false)
  // const [priamt, setPriAmt] = useState<number>(0)
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

  const [paymentSettingData, setPaymentSettingData] = useState<SettingData>()
  const [amountInCash, setAmountInCash] = useState<string | null>(null)
  const [amountInBank, setAmountInBank] = useState<string | null>(null)
  const [date, setDate] = useState<Nullable<Date>>(new Date())
  const [totalDueAmt, setTotalDueAmt] = useState<string>()
  const [dueData, setDueData] = useState<dueDetails[] | []>([])
  const [selectBank, setSelectBank] = useState<Bank | null>(null)
  const [selectCash, setSelectCash] = useState<Bank | null>(null)
  const [bankOption, setBankOption] = useState<BankOption[]>([])
  const [cashOption, setCashOption] = useState([])
  const [paidInterest, setPaidInterest] = useState<string | null>(null)
  const [paidPrincipal, setPaidPrincipal] = useState<string | null>(null)
  const [paidInitialInterest, setPaidInitialInterest] = useState<string | null>(null)
  const [closeLoan, setCloseLoan] = useState<boolean>(false)
  const getDueData = async () => {
    console.log('date', formatToCustomDateTime(date ?? new Date()))
    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminRePayment/dueAmountDetails',
          {
            loanId: loanId,
            date: formatToCustomDateTime(date ?? new Date())
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
            setDueData(data.data)
            setTotalDueAmt(data.data[0].arearsAmt)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const getLoanData = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/AdminRePayment/rePaymentCalculation',
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
          // setPriAmt(
          //   data.data[0].refPrincipalStatus === 'paid' ? 0 : Number(data.data[0].refPrincipal)
          // )

          const options = data.bank.map((data: any) => ({
            label: `Bank Name : ${data.refBankName} - Bank Ac.No : ${data.refBankAccountNo} - Balance : ₹ ${data.refBalance}`,
            value: data.refBankId,
            type: data.refAccountType,
            balance: data.refBalance
          }))
          console.log('options', options)
          setBankOption(options)
          setCashOption(options)
        }
      })
  }

  // const updateRepayment_old1 = () => {
  //   const selectedBank = bankOption.find((bank) => bank.value === selectBank?.value)

  //   if (Number(rePaymentForm.BalanceAmount) > Number(selectedBank?.balance)) {
  //     console.log('Selected Amount Source with less Balance')
  //     toast.error(`Selected Amount Source with less Balance`, {
  //       position: 'top-right',
  //       autoClose: 2999,
  //       hideProgressBar: false,
  //       closeOnClick: false,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: 'light',
  //       transition: Slide
  //     })
  //   } else {
  //     axios
  //       .post(
  //         import.meta.env.VITE_API_URL + '/AdminRePayment/updateRePayment',
  //         {
  //           todayDate: date,
  //           priAmt: rePaymentForm.BalanceAmount,
  //           interest: rePaymentForm.interestAmt,
  //           bankId: selectBank,
  //           paymentType: paymentType === 'online' ? 1 : 2,
  //           rePayId: rePayId
  //         },
  //         {
  //           headers: {
  //             Authorization: localStorage.getItem('token'),
  //             'Content-Type': 'application/json'
  //           }
  //         }
  //       )
  //       .then((response) => {
  //         const data = decrypt(
  //           response.data[1],
  //           response.data[0],
  //           import.meta.env.VITE_ENCRYPTION_KEY
  //         )
  //         console.log('data line ------ 246', data)
  //         localStorage.setItem('token', 'Bearer ' + data.token)

  //         if (data.success) {
  //           toast.success('Re-Payment Updated Successfully', {
  //             position: 'top-right',
  //             autoClose: 2999,
  //             hideProgressBar: false,
  //             closeOnClick: false,
  //             pauseOnHover: true,
  //             draggable: true,
  //             progress: undefined,
  //             theme: 'light',
  //             transition: Slide
  //           })
  //           closeSidebarUpdate()
  //         } else {
  //           toast.error(`${data.error}`, {
  //             position: 'top-right',
  //             autoClose: 2999,
  //             hideProgressBar: false,
  //             closeOnClick: false,
  //             pauseOnHover: true,
  //             draggable: true,
  //             progress: undefined,
  //             theme: 'light',
  //             transition: Slide
  //           })
  //         }
  //       })
  //   }
  // }
  const updateRepayment = () => {
    const selectedBank = bankOption.find((bank) => bank.value === selectBank?.value)

    if (Number(rePaymentForm.BalanceAmount) > Number(selectedBank?.balance)) {
      console.log('Selected Amount Source with less Balance')
      toast.error(`Selected Amount Source with less Balance`, {
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
    } else {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminRePayment/updateRePayment',
          {
            loanId: loanId,
            payDate: formatToCustomDateTime(date ?? new Date()),
            rePayId: rePayId,
            cashAmt: amountInCash,
            onlineAmt: amountInBank,
            paidTotalAmount: Number(amountInCash) + Number(amountInBank),
            bankId: selectBank,
            cashId: selectCash,
            paidInterest: paidInterest,
            paidPrincipal: paidPrincipal,
            paidInitialInterest: paidInitialInterest,
            refIfCalculation: loanCalculation,
            closeLoan: closeLoan
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
  }

  // const filteredBankOptions = bankOption.filter((bank) => {
  //   if (paymentType === 'online') return bank?.type === 1
  //   if (paymentType === 'cash') return bank?.type === 2
  //   return false
  // })

  const updateFollowUp = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/AdminRePayment/updateFollowUp',
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
    getDueData()
    const getSetData = async () => {
      const settingdatas = await getSettingData()
      setPaymentSettingData(settingdatas)
    }
    getSetData()
  }, [date])

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
                      {loanDetails?.refProductDurationType === 1
                        ? 'Months'
                        : loanDetails?.refProductDurationType === 2
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
                    <p>
                      No of{' '}
                      {loanDetails?.refProductDurationType === 1
                        ? 'Months'
                        : loanDetails?.refProductDurationType === 2
                          ? 'Weeks'
                          : 'Days'}{' '}
                      Paid First : {loanDetails?.refInterestMonthCount} Month
                    </p>
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
                      Loan Start{' '}
                      {loanDetails?.refProductDurationType === 1
                        ? 'Months'
                        : loanDetails?.refProductDurationType === 2
                          ? 'Weeks'
                          : 'Days'}{' '}
                      :{' '}
                      {loanDetails.refRepaymentStartDate
                        ? formatToFirstOfMonth(loanDetails.refRepaymentStartDate)
                        : ' -'}
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Loan End{' '}
                      {loanDetails?.refProductDurationType === 1
                        ? 'Months'
                        : loanDetails?.refProductDurationType === 2
                          ? 'Weeks'
                          : 'Days'}{' '}
                      : {loanDetails?.refLoanDueDate}
                    </p>
                  </div>
                </div>

                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>Total Interest Paid : &#8377; {loanDetails?.totalInterest}</p>
                  </div>
                  <div className="w-[30%]">
                    <p>Total Principal Paid : &#8377; {loanDetails?.totalPrincipal}</p>
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
            {/* <TabPanel header="Re-Payment">
              <div className="my-0 w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault(), updateRepayment()
                  }}
                  className="w-full"
                >
                  <div className="my-2 flex justify-between">
                    <div>
                      <b className="text-[1.2rem]">Re-Payment Form</b>
                    </div>
                    <div>
                      <label>
                        <b>Select Data :</b>{' '}
                      </label>
                      <Calendar
                        placeholder="DD/MM/YYYY"
                        value={date}
                        required
                        onChange={(e) => {
                          setDate(e.value ?? new Date())
                        }}
                        dateFormat="dd/mm/yy"
                        // minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                        maxDate={new Date()}
                      />
                    </div>
                  </div>

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
                          min={rePaymentForm.BalanceAmount}
                          max={loanDetails?.refBalanceAmt}
                          onChange={(e) => {
                            let val = e.value ?? 0

                            const min = priamt
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
                    {(paymentType === 'online' || paymentType === 'cash') && (
                      <div className="w-[60%]">
                        <label htmlFor="Interest" className="font-bold block mb-2">
                          Select Bank
                        </label>

                        <Dropdown
                          filter
                          required
                          value={selectBank}
                          onChange={(e: DropdownChangeEvent) => {
                            console.log('Selected Bank:', e.value)
                            setSelectBank(e.value)
                          }}
                          options={filteredBankOptions}
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
            </TabPanel> */}
            <TabPanel header="Re-Payment">
              <div className="my-0 w-full">
                {loanCalculation && (
                  <>
                    <div className="my-1 flex justify-between">
                      <b className="text-[1rem]">Un-Paid Due Details</b>
                      <b className="text-[1rem]">
                        Total Areas Amount : {formatINRCurrency(Number(totalDueAmt))}
                      </b>
                    </div>
                    <div className="flex flex-col gap-0 shadow-3 p-2 rounded-md">
                      <DataTable value={dueData} size="small" showGridlines>
                        <Column field="refPaymentDate" header="Due Amount of"></Column>
                        <Column
                          body={(rowData) => {
                            return (
                              <>
                                {formatINRCurrency(
                                  Number(rowData.refInterest) + Number(rowData.refInitialInterest)
                                )}
                              </>
                            )
                          }}
                          header="Interest"
                        ></Column>
                        <Column
                          field="refPrincipal"
                          body={(rowData) => {
                            return <>{formatINRCurrency(rowData.refPrincipal)}</>
                          }}
                          header="Principal"
                        ></Column>
                        <Column
                          field="refPaidInterest"
                          body={(rowData) => {
                            return <>{formatINRCurrency(rowData.refPaidInterest)}</>
                          }}
                          header="Paid Interest"
                        ></Column>
                        <Column
                          field="refPaidPrincipal"
                          body={(rowData) => {
                            return <>{formatINRCurrency(rowData.refPaidPrincipal)}</>
                          }}
                          header="Paid Principal"
                        ></Column>
                        <Column
                          field="refArears"
                          body={(rowData) => {
                            return <>{formatINRCurrency(rowData.refArears)}</>
                          }}
                          header="Areas Amount"
                        ></Column>
                      </DataTable>
                    </div>
                    <Divider />
                  </>
                )}

                <div className="my-3 flex justify-between">
                  <div>
                    <b className="text-[1.2rem]">New Entry</b>
                  </div>
                  <div>
                    <Calendar
                      value={date}
                      onChange={(e) => {
                        setDate(e.value)
                      }}
                      dateFormat="dd/mm/yy"
                      // maxDate={new Date()}
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
                  {!loanCalculation && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label>Enter Interest Amount Paid</label>
                        <InputText
                          keyfilter="int"
                          required
                          placeholder="Interest Amount Paid"
                          value={paidInterest}
                          onChange={(e) => setPaidInterest(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label>Enter Principal Amount Paid</label>
                        <InputText
                          keyfilter="int"
                          required
                          placeholder="Principal Amount Paid"
                          value={paidPrincipal}
                          onChange={(e) => setPaidPrincipal(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label>Enter Initial Interest Paid</label>
                        <InputText
                          keyfilter="int"
                          required
                          placeholder="Initial Interest Paid"
                          value={paidInitialInterest}
                          onChange={(e) => setPaidInitialInterest(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

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

                  {!loanCalculation && (
                    <div className="flex gap-x-4 align-items-center justify-between">
                      <div className="flex gap-x-5 align-items-center">
                        <InputSwitch
                          checked={closeLoan}
                          onChange={(e: InputSwitchChangeEvent) => setCloseLoan(e.value)}
                        />
                        <p className="italic">
                          Note: This entry should be used to close the loan as the final
                          transaction.
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <p className="text-[red]">
                          <b>
                            {Number(paidInterest) +
                              Number(paidPrincipal) +
                              Number(paidInitialInterest) ===
                            Number(amountInCash) + Number(amountInBank)
                              ? ''
                              : 'Kindly Check the Entered Amount, Total is Miss Match'}
                          </b>
                        </p>
                      </div>
                    </div>
                  )}

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
                    {(() => {
                      const isDisabled =
                        Number(paidInterest) +
                          Number(paidPrincipal) +
                          Number(paidInitialInterest) !==
                          Number(amountInCash) + Number(amountInBank) && !loanCalculation

                      return (
                        <button
                          type="submit"
                          disabled={isDisabled}
                          className={`w-[50%] p-2 px-7 text-white my-3 rounded-lg 
          ${isDisabled ? 'bg-[gray] cursor-not-allowed' : 'bg-[green]'}`}
                        >
                          Submit Loan Due amount
                        </button>
                      )
                    })()}
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
              <AdminLoanAudit loanId={loanId} />
            </TabPanel>
          </TabView>
        </>
      )}
    </>
  )
}

export default AdminLoanRepaymentSideTab
