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

  useEffect(() => {
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
              setSelectedLoan(e.value)
            }}
            options={userLoan}
            optionLabel="name"
            placeholder="Select Old Loan"
          />
        </div>
        <div className="flex-1"></div>
      </div>
      <div className="mt-3">
        <Accordion>
          <AccordionTab header="Loan Details">
            <div className="flex">
              <div className="flex-1">
                <p>Total Loan :</p>
              </div>
              <div className="flex-1">
                <p>Loan Interest : </p>
              </div>
              <div className="flex-1">
                <p>Loan Duration : </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-1">Initial Interest Paid (First) :</div>
              <div className="flex-1">Initial Interest Amount :</div>
              <div className="flex-1">Initial Interest Month :</div>
            </div>
            <Divider />
            <div className="flex">
              <div className="flex-1">
                <p>Loan Amount Paid :</p>
              </div>
              <div className="flex-1">
                <p>Loan Balance Month : </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-1">
                <p>Loan Paid Duration : </p>
              </div>
              <div className="flex-1">
                <p>Loan Balance Duration : </p>
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
            currency="INR"
            className="w-full"
            currencyDisplay="symbol"
            locale="en-IN"
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
      <div className="flex mt-3 ">
        <div className="flex-1">
          <Message text="Error Message" />
        </div>
      </div>
      <div className="flex mt-3 justify-content-end">
        <Button label="Close Loan" severity="success" disabled />
      </div>
    </div>
  )
}

export default CloseLoan
