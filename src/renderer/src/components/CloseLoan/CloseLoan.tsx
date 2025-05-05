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

interface CloseLoanProps {
  id: number
  goToHistoryTab: any
}

interface setUserLoanProps {
  refLoanAmount: string
  refLoanId: number
  refProductDuration: string
  refProductInterest: string
}

const CloseLoan: React.FC<CloseLoanProps> = ({ id, goToHistoryTab }) => {
  const handleBack = () => {
    goToHistoryTab()
  }

  const [userLoan, setUserLoan] = useState<setUserLoanProps[]>([])
  const [selectedLoan, setSelectedLoan] = useState<number | null>()
  const [checked, setChecked] = useState<boolean>(false)
  const [loanDetails, setLoanDetails] = useState<any>()
  const [showCard, setShowCard] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [errorShow, setErrorShow] = useState(false)
  const [loanAmt, setLoanAmt] = useState<number | null>()


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

      console.log('data', data)
      if (data.success) {
        const options = data.data.map((d: any) => ({
          name: `Loan Amt : ${d.refLoanAmount} - Interest : ${d.refProductInterest} - Duration : ${d.refProductDuration}`,
          value: d.refLoanId
        }))
        setUserLoan(options)
      }
    } catch (error) {
      console.error('Error loading loan data', error)
    }
  }

  const getLoanDatas = async (LoanId: number) => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/rePayment/loanDetails',
        {
          loanId: id
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
          const matchedLoan = data.data.find(item => item.refLoanId === LoanId);
          setLoanDetails(matchedLoan);
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
    if (loanAmt ?? 0 > loanDetails?.refBalanceAmt) {
      setErrorMessage("Loan Amount is Higher that Balance Amount")
      setErrorShow(true)
    }
    else {
      setErrorShow(false)

    }
  }

  useEffect(() => {
    setShowCard(false)
    setErrorShow(false)
    setSelectedLoan(null)
    getUserLoanData()
  }, [])

  return (
    <div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="font-bold block mb-2">Select Old Loan</label>
          <Dropdown
            value={selectedLoan}
            filter
            className="w-full"
            onChange={(e: DropdownChangeEvent) => {
              setShowCard(false)
              setErrorShow(false)

              setSelectedLoan(e.value)
              getLoanDatas(e.value)
            }}
            options={userLoan}
            optionLabel="name"
            placeholder="Select Old Loan"
          />
        </div>
        <div className="flex-1"></div>
      </div>
      {showCard &&
        (
          <><div className="mt-3">

            <Accordion activeIndex={0}>
              <AccordionTab header="Loan Details" >
                <div className="flex m-3">
                  <div className="flex-1">
                    <p>Loan Name : <b>{loanDetails?.refProductName}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Loan Amount : <b>₹ {loanDetails?.refProductInterest}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Balance Amount : <b>₹ {loanDetails?.refBalanceAmt}</b></p>
                  </div>
                </div>
                <div className="flex m-3">
                  <div className="flex-1">
                    <p>Loan Duration :<b> {loanDetails?.refProductDuration} Month </b></p>
                  </div>
                  <div className="flex-1">
                    <p>Loan Interest : <b>{loanDetails?.refProductInterest} %</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Re-Payment Type : <b>{loanDetails?.refRepaymentTypeName}</b></p>
                  </div>
                </div>
                <div className="flex m-3">
                  <div className="flex-1">
                    <p>Interest Paid First :<b> {loanDetails?.isInterestFirst === true ? "Yes" : "No"}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>No of Month Paid First : <b>{loanDetails?.refInterestMonthCount === null ? 0 : loanDetails?.refInterestMonthCount} %</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Initial Interest : ₹ <b>{loanDetails?.refInitialInterest === null ? 0 : loanDetails?.refInitialInterest} </b></p>
                  </div>
                </div>
                <div className="flex m-3">
                  <div className="flex-1">
                    <p>Loan Get Date :<b> {loanDetails?.refLoanStartDate}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Loan Start Month : <b>{loanDetails?.refRepaymentStartDate
                      ? formatToFirstOfMonth(loanDetails?.refRepaymentStartDate)
                      : ' -'}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Loan End Month : <b>{loanDetails?.refLoanDueDate} </b></p>
                  </div>
                </div>
                <div className="flex m-3">
                  <div className="flex-1">
                    <p>Total Interest Paid : ₹ <b> {loanDetails?.totalInterest}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Total Principal Paid : ₹ <b> {loanDetails?.totalPrincipal}</b></p>
                  </div>
                  <div className="flex-1">
                    <p>Loan Status : <b>{loanDetails?.refLoanStatus} </b></p>
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
                  currency="INR"
                  className="w-full"
                  currencyDisplay="symbol"
                  locale="en-IN"
                  onChange={(e: any) => { setLoanAmt(e.value); console.log(e.value) }}
                />
              </div>
              <div className="flex-1">
                <label className="font-bold block mb-2">Cash Collected</label>
                <InputSwitch
                  checked={checked}
                  style={{ marginTop: '5px' }}
                  onChange={(e: InputSwitchChangeEvent) => setChecked(e.value)}
                />
              </div>
            </div>
            {errorShow &&
              <div className="flex mt-3 ">
                <div className="flex-1">
                  <Message text={errorMessage} />
                </div>
              </div>
            }

            <div className="flex mt-3 justify-content-end">
              <Button label="Update Loan" severity="success" onClick={loanUpdate} />
            </div>
          </>
        )}

    </div>
  )
}

export default CloseLoan
