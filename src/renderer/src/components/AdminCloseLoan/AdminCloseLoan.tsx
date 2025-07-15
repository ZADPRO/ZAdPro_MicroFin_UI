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

interface CloseLoanProps {
  id: number
  goToHistoryTab?: any
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

  const [bankModeType, setBankModeType] = useState<string>('')
  const [loanDetails, setLoanDetails] = useState<any>()
  const [showCard, setShowCard] = useState(false)
  const [date, setDate] = useState<Date>(new Date())

  const [loanAmt, setLoanAmt] = useState<number | null>()
  const [bankDetailsResponse, setBankDetailsReponse] = useState<BankDetailsReponseProps[] | []>([])
  const [bankID, setBankid] = useState<number | null>()
  const [settingData, setSettingData] = useState<SettingData | null>()

  const getLoanDatas = async () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/loanCloseData',
        {
          LoanId: id,
          todayDate: date
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
          console.log('Loan', matchedLoan)
          setLoanDetails(matchedLoan)
          const options = data.bank.map((d: any) => ({
            name: `Name : ${d.refBankName} - A/C : ${d.refBankAccountNo} - IFSC's : ${d.refIFSCsCode}`,
            value: d.refBankId,
            refAccountType: d.refAccountType
          }))
          console.log('options', options)
          setBankDetailsReponse(options)
          setShowCard(true)
        }
      })
  }

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
          todayDate: date,
          LoanId: id,
          principalAmt: Number(loanAmt),
          bankId: bankID
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
          setLoanDetails(null)
          setBankModeType('')
          setBankid(null)
          setLoanAmt(null)
          handleBack()
        }
      })
  }

  useEffect(() => {
    setShowCard(false)
    getLoanDatas()
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
  }, [])

  return (
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
                      Loan Amount : <b>₹ {loanDetails?.refLoanAmount}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Balance Amount : <b>₹ {loanDetails?.refBalanceAmt}</b>
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
                      Initial Interest : ₹{' '}
                      <b>
                        {loanDetails?.refInitialInterest === null
                          ? 0
                          : loanDetails?.refInitialInterest}{' '}
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
                      Total Interest Paid : ₹ <b> {loanDetails?.totalInterest}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Total Principal Paid : ₹ <b> {loanDetails?.totalPrincipal}</b>
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
          <Divider />
          <div className="flex justify-between align-items-center">
            <div className="w-[30%]">
              <label className="font-bold block mb-2">Select Paid Date</label>
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
          <div className="flex mt-3 gap-3">
            <div className="flex-1">
              <label className="font-bold block mb-2">Enter Balance Amount</label>
              <InputNumber
                placeholder="Enter Balance Amount"
                mode="currency"
                value={loanAmt}
                max={loanDetails?.refBalanceAmt}
                currency="INR"
                className="w-full"
                currencyDisplay="symbol"
                locale="en-IN"
                onChange={(e: any) => {
                  const enteredValue = e.value
                  console.log('enteredValue line ----- 319', enteredValue)
                  const maxValue = loanDetails?.refBalanceAmt

                  if (enteredValue <= maxValue) {
                    console.log('enteredValue line ----- 323', enteredValue)

                    console.log(' -> Line Number ----------------------------------- 323')
                    setLoanAmt(enteredValue)
                  } else {
                    console.log(' -> Line Number ----------------------------------- 326')
                    console.log('enteredValue line ----- 330', enteredValue)

                    setLoanAmt(maxValue) // force the value to max
                  }
                }}
              />
            </div>
            {settingData?.paymentMethod === 1 && <></>}
            {/* <div className="flex-1">
              <label className="font-bold block mb-2">Select Amount Type</label>

              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex align-items-center">
                  <RadioButton
                    inputId="bankModeType1"
                    name="Bank"
                    value="Bank"
                    onChange={(e: RadioButtonChangeEvent) => setBankModeType(e.value)}
                    checked={bankModeType === 'Bank'}
                  />
                  <label htmlFor="bankModeType1" className="ml-2">
                    Bank
                  </label>
                </div>
                <div className="flex align-items-center">
                  <RadioButton
                    inputId="bankModeType2"
                    name="Cash"
                    value="Cash"
                    onChange={(e: RadioButtonChangeEvent) => setBankModeType(e.value)}
                    checked={bankModeType === 'Cash'}
                  />
                  <label htmlFor="bankModeType2" className="ml-2">
                    Cash
                  </label>
                </div>
              </div>
            </div> */}
            {settingData?.paymentMethod === 1 && (
              <>
                {' '}
                <div className="flex-1">
                  <label className="font-bold block mb-2">Select Payment Flow</label>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex align-items-center">
                      <RadioButton
                        inputId="bankModeType1"
                        name="Bank"
                        value="Bank"
                        onChange={(e: RadioButtonChangeEvent) => {
                          console.log('e.value', e.value)
                          setBankModeType(e.value)
                        }}
                        checked={bankModeType === 'Bank'}
                      />
                      <label htmlFor="bankModeType1" className="ml-2">
                        Bank
                      </label>
                    </div>
                    <div className="flex align-items-center">
                      <RadioButton
                        inputId="bankModeType2"
                        name="Cash"
                        value="Cash"
                        onChange={(e: RadioButtonChangeEvent) => {
                          console.log('e.value', e.value)
                          setBankModeType(e.value)
                        }}
                        checked={bankModeType === 'Cash'}
                      />
                      <label htmlFor="bankModeType2" className="ml-2">
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
          {/* {errorShow && (
            <div className="flex mt-3 ">
              <div className="flex-1">
                <Message text={errorMessage} />
              </div>
            </div>
          )} */}

          <div className="flex mt-3 gap-3">
            {settingData?.paymentMethod === 1 && (
              <div className="flex-1">
                <label className="font-bold block mb-2">
                  Choose {bankModeType === 'Bank' ? 'Bank Account' : 'Cash Flow'}
                </label>

                <Dropdown
                  value={bankID}
                  filter
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

          <div className="flex mt-3 justify-content-end">
            <Button label="Update Loan" severity="success" onClick={loanUpdate} />
          </div>
        </>
      )}
    </div>
  )
}

export default AdminCloseLoan
