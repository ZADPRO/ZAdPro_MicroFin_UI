import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import React, { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import axios from 'axios'
import { Accordion, AccordionTab } from 'primereact/accordion'
// import { Message } from 'primereact/message'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'
import { getSettingData, SettingData } from '@renderer/helper/SettingsData'
import { Divider } from 'primereact/divider'
import { Calendar } from 'primereact/calendar'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { Dialog } from 'primereact/dialog'
import { formatINRCurrency } from '@renderer/helper/amountFormat'

interface CloseLoanProps {
  id: number
  goToHistoryTab?: any
}

interface balanceAmt {
  finalInterest: number
  totalInterestWantToCollected: number
  totalPrincipalWantToPay: number
}
// interface setUserLoanProps {
//   refLoanAmount: string
//   refLoanId: number
//   refProductDuration: string
//   refProductInterest: string
// }

interface BankDetailsReponseProps {
  refAccountType: number
  refAccountTypeName: string
  refBankAccountNo: string
  refBankId: number
  refBankName: string
  refIFSCsCode: string
}

const AdminCloseLoan: React.FC<CloseLoanProps> = ({ id, goToHistoryTab }) => {
  // useEffect(() => {  }, [])
  const handleBack = () => {
    goToHistoryTab()
  }

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [balanceInfo, setBalanceInfo] = useState<balanceAmt>()

  const [bankModeType, setBankModeType] = useState<string>('')
  const [loanDetails, setLoanDetails] = useState<any>()
  const [showCard, setShowCard] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [closeLoan, setCloseLoan] = useState<boolean>(false)
  const [loanAmt, setLoanAmt] = useState<number | null>()
  const [interestAmt, setInterestAmt] = useState<number | null>()
  const [bankDetailsResponse, setBankDetailsReponse] = useState<BankDetailsReponseProps[] | []>([])
  const [bankID, setBankid] = useState<number | null>()
  const [settingData, setSettingData] = useState<SettingData | null>()
  const [summary, setSummary] = useState<boolean>(false)
  const getLoanDatas = async (LoanId: number, todayDate: Date) => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/loanCloseData',
        {
          LoanId: LoanId,
          todayDate: todayDate.toLocaleDateString('en-CA')
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
          const matchedLoan = data.data.find((item) => item.refLoanId === id)
          console.log('Loan line ------- 80', matchedLoan)
          setLoanDetails(matchedLoan)
          const options = data.bank.map((d: any) => ({
            name: `Name : ${d.refBankName} - A/C : ${d.refBankAccountNo} - IFSC's : ${d.refIFSCsCode}`,
            value: d.refBankId,
            refAccountType: d.refAccountType,
            refBankName: d.refBankName,
            refBankId: d.refBankId
          }))
          console.log('options', options)
          setBalanceInfo(data.balanceInfo)

          setBankDetailsReponse(options)
          setShowCard(true)
          setLoadingStatus(false)
        }
      })
  }

  const headerElement = (
    <div className="flex justify-between">
      <div>
        <span className="font-bold white-space-nowrap">Conform The Entered Amount</span>
      </div>
      <div className="mx-2">
        <p className="text-[1.2rem]">Date : {date.toLocaleDateString('en-GB')}</p>
      </div>
    </div>
  )

  const footerContent = (
    <div>
      <Button
        size="small"
        label="Edit"
        icon="pi pi-pencil"
        onClick={() => setSummary(false)}
        autoFocus
      />
      <Button
        size="small"
        label="Make Payment"
        icon="pi pi-check"
        onClick={() => loanUpdate()}
        autoFocus
      />
    </div>
  )

  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString)

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // months are 0-indexed
    const day = '01'

    return `${year}-${month}-${day}`
  }

  const loanUpdate = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/payPrincipalAmt',
        {
          todayDate: date.toLocaleDateString('en-CA'),
          LoanId: id,
          principalAmt: Number(loanAmt),
          interestAmt: Number(interestAmt),
          bankId: bankID,
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
        console.log('data line ------ 278', data)
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log(' -> Line Number ----------------------------------- 157')
          // setLoanDetails(null)
          // setBankModeType('')
          // setBankid(null)
          // setLoanAmt(null)
          // handleBack()
          setSummary(false)
          handleBack()
        }
      })
  }

  useEffect(() => {
    setShowCard(false)
    getLoanDatas(id, date)
    const getSetData = async () => {
      const settingdatas = await getSettingData()
      console.log('settingdatas line ------ 172', settingdatas)
      setSettingData(settingdatas)
      if (settingdatas.paymentMethod !== 1) {
        console.log('settingdatas.paymentMethod line ----- 175', settingdatas.paymentMethod)
        setBankModeType(settingdatas?.paymentMethod === 2 ? 'Bank' : 'Cash')
      }
    }
    getSetData()
  }, [date])

  const bankName =
    bankDetailsResponse.find((data) => data.refBankId === bankID)?.refBankName ?? 'N/A'

  console.log('Bank Name:', bankName)

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
          {showCard && (
            <>
              <div className="mt-3">
                <Accordion activeIndex={0}>
                  <AccordionTab header="Loan Details">
                    <div className="flex m-3">
                      <div className="flex-1">
                        <p>
                          Vendor Name : <b>{loanDetails?.refVendorName}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Loan Amount : <b> {formatINRCurrency(loanDetails?.refLoanAmount)}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Balance Amount : <b> {formatINRCurrency(loanDetails?.refBalanceAmt)}</b>
                        </p>
                      </div>
                    </div>
                    <div className="flex m-3">
                      <div className="flex-1">
                        <p>
                          Loan Duration :
                          <b>
                            {' '}
                            {loanDetails?.refProductDuration}{' '}
                            {loanDetails?.refProductDurationType === 1
                              ? 'Months'
                              : loanDetails?.refProductDurationType === 2
                                ? 'Weeks'
                                : 'Days'}{' '}
                          </b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Loan Interest : <b>{loanDetails?.refProductInterest} %</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Re-Payment Type : <b>{loanDetails?.refRepaymentTypeName}</b>
                        </p>
                      </div>
                    </div>
                    <div className="flex m-3">
                      <div className="flex-1">
                        <p>
                          Interest Paid First :
                          <b> {loanDetails?.isInterestFirst === true ? 'Yes' : 'No'}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          No of{' '}
                          {loanDetails?.refProductDurationType === 1
                            ? 'Months'
                            : loanDetails?.refProductDurationType === 2
                              ? 'Weeks'
                              : 'Days'}{' '}
                          Paid First :{' '}
                          <b>
                            {loanDetails?.refInterestMonthCount === null
                              ? 0
                              : loanDetails?.refInterestMonthCount}{' '}
                          </b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Initial Interest :
                          <b>
                            {formatINRCurrency(
                              loanDetails?.refInitialInterest === null
                                ? 0
                                : loanDetails?.refInitialInterest
                            )}{' '}
                          </b>
                        </p>
                      </div>
                    </div>
                    <div className="flex m-3">
                      <div className="flex-1">
                        <p>
                          Loan Get Date :<b> {loanDetails?.refLoanStartDate}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Loan Start{' '}
                          {loanDetails?.refProductDurationType === 1
                            ? 'Months'
                            : loanDetails?.refProductDurationType === 2
                              ? 'Weeks'
                              : 'Days'}{' '}
                          :{' '}
                          <b>
                            {loanDetails?.refRepaymentStartDate
                              ? formatToFirstOfMonth(loanDetails?.refRepaymentStartDate)
                              : ' -'}
                          </b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Loan End{' '}
                          {loanDetails?.refProductDurationType === 1
                            ? 'Months'
                            : loanDetails?.refProductDurationType === 2
                              ? 'Weeks'
                              : 'Days'}{' '}
                          : <b>{loanDetails?.refLoanDueDate} </b>
                        </p>
                      </div>
                    </div>
                    <div className="flex m-3">
                      <div className="flex-1">
                        <p>
                          Total Interest Paid :{' '}
                          <b> {formatINRCurrency(loanDetails?.totalInterest)}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Total Principal Paid :{' '}
                          <b> {formatINRCurrency(loanDetails?.totalPrincipal)}</b>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p>
                          Loan Status : <b>{loanDetails?.refLoanStatus} </b>
                        </p>
                      </div>
                    </div>
                  </AccordionTab>
                </Accordion>
              </div>
              {!loanDetails?.loanCalculation && (
                <div>
                  <p className="text-amber-500 italic">
                    <b>Note : </b>The above balance amount is an approximate value and may not
                    reflect the exact loan balance.
                  </p>
                </div>
              )}

              <Divider />
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSummary(true)
                }}
              >
                <div className="flex justify-center align-items-center">
                  <div className="flex-1">
                    <label className="font-bold block mb-2">Select Paid Date</label>
                    <Calendar
                      placeholder="DD/MM/YYYY"
                      value={date}
                      required
                      onChange={(e) => {
                        setDate(e.value ?? new Date())
                        getLoanDatas(id, e.value ?? new Date())
                      }}
                      dateFormat="dd/mm/yy"
                      // minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                      maxDate={new Date()}
                    />
                  </div>
                  <div className="flex flex-1 align-items-center justify-center">
                    <div className="flex align-items-center flex-1">
                      <p>
                        Total Interest :{' '}
                        <b>{formatINRCurrency(balanceInfo?.totalInterestWantToCollected)}</b>
                      </p>
                    </div>
                    <div className="flex align-items-center flex-1">
                      <p>
                        Total Principal :{' '}
                        <b>{formatINRCurrency(balanceInfo?.totalPrincipalWantToPay)}</b>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex mt-3 gap-3">
                  <div className="flex-2 flex gap-3">
                    <div className="flex-1">
                      <label className="font-bold block mb-2">Enter Paid Interest Amount</label>
                      <InputNumber
                        placeholder="Enter Interest Amount"
                        mode="currency"
                        required
                        value={interestAmt}
                        currency="INR"
                        className="w-full"
                        max={balanceInfo?.totalInterestWantToCollected}
                        currencyDisplay="symbol"
                        locale="en-IN"
                        onChange={(e: any) => {
                          setInterestAmt(e.value)
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-bold block mb-2">Enter Paid Principal Amount</label>
                      <InputNumber
                        placeholder="Enter principal Amount"
                        mode="currency"
                        required
                        max={balanceInfo?.totalPrincipalWantToPay}
                        value={loanAmt}
                        currency="INR"
                        className="w-full"
                        currencyDisplay="symbol"
                        locale="en-IN"
                        onChange={(e: any) => {
                          setLoanAmt(e.value)
                        }}
                      />
                    </div>
                  </div>

                  {settingData?.paymentMethod === 1 && (
                    <>
                      {' '}
                      <div className="flex-1">
                        <label className="font-bold block mb-2">Select Payment Flow</label>

                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="bankModeType"
                              required
                              name="bankModeType"
                              value="Bank"
                              onChange={(e: RadioButtonChangeEvent) => {
                                console.log('e.value', e.value)
                                setBankModeType(e.value)
                              }}
                              checked={bankModeType === 'Bank'}
                            />
                            <label htmlFor="bankModeType" className="ml-2">
                              Bank
                            </label>
                          </div>
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="bankModeType"
                              required
                              name="bankModeType"
                              value="Cash"
                              onChange={(e: RadioButtonChangeEvent) => {
                                console.log('e.value', e.value)
                                setBankModeType(e.value)
                              }}
                              checked={bankModeType === 'Cash'}
                            />
                            <label htmlFor="bankModeType" className="ml-2">
                              Cash
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {(settingData?.paymentMethod === 2 || settingData?.paymentMethod === 3) && (
                    <div className="flex-1">
                      <label className="font-bold block mb-2">
                        Choose {settingData.paymentMethod === 2 ? 'Bank Account' : 'Cash Flow'}
                      </label>

                      <Dropdown
                        value={bankID}
                        filter
                        required
                        onChange={(e: DropdownChangeEvent) => setBankid(e.value)}
                        options={bankDetailsResponse.filter(
                          (item) =>
                            (bankModeType === 'Bank' && item.refAccountType === 1) ||
                            (bankModeType === 'Cash' && item.refAccountType === 2)
                        )}
                        optionValue="value"
                        optionLabel="name"
                        placeholder={`Select ${settingData.paymentMethod === 2 ? 'Bank Account' : 'Cash Flow'}`}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex mt-3 gap-3">
                  {settingData?.paymentMethod === 1 && (
                    <div className="flex-1">
                      <label className="font-bold block mb-2">
                        Choose {bankModeType === 'Bank' ? 'Bank Account' : 'Cash Flow'}
                      </label>

                      <Dropdown
                        value={bankID}
                        required
                        filter
                        name="paymentType"
                        onChange={(e: DropdownChangeEvent) => setBankid(e.value)}
                        options={bankDetailsResponse.filter(
                          (item) =>
                            (bankModeType === 'Bank' && item.refAccountType === 1) ||
                            (bankModeType === 'Cash' && item.refAccountType === 2)
                        )}
                        optionValue="value"
                        optionLabel="name"
                        placeholder={`Select ${bankModeType === 'Bank' ? 'Bank Account' : 'Cash Flow'}`}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="flex-1"></div>
                </div>

                <div className="flex mt-3 justify-between">
                  {!loanDetails?.loanCalculation && (
                    <div>
                      <InputSwitch
                        checked={closeLoan}
                        onChange={(e: InputSwitchChangeEvent) => setCloseLoan(e.value)}
                      />
                      <p className="italic text-amber-500">
                        Note: This entry should be used to close the loan as the final transaction.
                      </p>
                    </div>
                  )}
                  {loanDetails?.loanCalculation && <div></div>}

                  <div>
                    <Button label="Update Loan" severity="success" />
                  </div>
                </div>
              </form>
            </>
          )}
          <Dialog
            visible={summary}
            modal
            header={headerElement}
            footer={footerContent}
            style={{ width: '50rem' }}
            onHide={() => {
              if (!summary) return
              setSummary(false)
            }}
          >
            <div className="flex flex-col gap-y-4">
              <div className="flex">
                {/* <div className="flex-1 flex gap-x-2">
                  <p>Payment Date : </p>
                  <b>{date.toLocaleDateString('en-GB')}</b>
                </div> */}
                <div className="flex-1 flex gap-x-2">
                  <p>Entered Interest : </p>
                  <b>{formatINRCurrency(interestAmt)}</b>
                </div>
                <div className="flex-1 flex gap-x-2">
                  <p>Entered Principal : </p>
                  <b>{formatINRCurrency(loanAmt)}</b>
                </div>
                <div className="flex-1 flex gap-x-2">
                  <p>Total Amount : </p>
                  <b>{formatINRCurrency((loanAmt ?? 0) + (interestAmt ?? 0))}</b>
                </div>
              </div>
              <div className="flex">
                <div className="flex-1 flex gap-x-2">
                  <p>Payment Type : </p>
                  <b>{bankModeType}</b>
                </div>
                <div className="flex-1 flex gap-x-2">
                  <p>Debit Amount From : </p>
                  <b>
                    {bankDetailsResponse.find((data) => data.refBankId === bankID)?.refBankName ??
                      'N/A'}
                  </b>
                </div>
              </div>
              {!loanDetails?.loanCalculation && (
                <div className="flex gap-x-2">
                  <p className="italic">Make this Payment As The Last To Close the Loan : </p>
                  <b>{closeLoan ? 'Yes' : 'NO'}</b>
                </div>
              )}
            </div>
          </Dialog>
        </div>
      )}
    </div>
  )
}

export default AdminCloseLoan
