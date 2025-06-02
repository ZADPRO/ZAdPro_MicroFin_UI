import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import React, { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import axios from 'axios'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'

interface CloseLoanProps {
  id: number
  goToHistoryTab?: any
}

interface setUserLoanProps {
  refLoanAmount: string
  refLoanId: number
  refProductDuration: string
  refProductInterest: string
}

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

  const [userLoan, setUserLoan] = useState<setUserLoanProps[]>([])
  const [selectedLoan, setSelectedLoan] = useState<number | null>()
  const [bankModeType, setBankModeType] = useState<string>('')
  const [loanDetails, setLoanDetails] = useState<any>()
  const [showCard, setShowCard] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [errorShow, setErrorShow] = useState(false)
  const [loanAmt, setLoanAmt] = useState<number | null>()
  const [bankDetailsResponse, setBankDetailsReponse] = useState<BankDetailsReponseProps[] | []>([])
  const [bankID, setBankid] = useState<number | null>()

  const getLoanDatas = async () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/loanCloseData',
        {
          LoanId: id
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
          setSelectedLoan(null)
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
    setErrorShow(false)
    setSelectedLoan(null)
    getLoanDatas()
    // getUserLoanData()
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
                  const maxValue = loanDetails?.refBalanceAmt

                  if (enteredValue <= maxValue) {
                    setLoanAmt(enteredValue)
                  } else {
                    setLoanAmt(maxValue) // force the value to max
                  }
                }}
              />
            </div>
            <div className="flex-1">
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
            </div>
          </div>
          {errorShow && (
            <div className="flex mt-3 ">
              <div className="flex-1">
                <Message text={errorMessage} />
              </div>
            </div>
          )}

          <div className="flex mt-3 gap-3">
            <div className="flex-1">
              <label className="font-bold block mb-2">Choose Bank</label>

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
                placeholder="Select a Bank"
                className="w-full"
              />
            </div>
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
