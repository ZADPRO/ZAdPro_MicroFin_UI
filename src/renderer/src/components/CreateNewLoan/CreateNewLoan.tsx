import React, { useState } from 'react'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { ToastContainer } from 'react-toastify'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { Calendar } from 'primereact/calendar'
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'
import { calculateLoanInterest, getRemainingDaysInMonth } from '@renderer/helper/loanFile'
import { Nullable } from 'primereact/ts-helpers'

interface LoanType {
  name: string
  code: number
}

interface RepaymentTypeProps {
  name: string
  code: number
}

interface SampleOpenLoansProps {
  name: string
  id: number
}

interface CreateNewLoanProps {
  id: number
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

interface BankProductListProps {
  createdAt: string
  createdBy: string
  refProductDescription: string
  refProductDuration: string
  refProductId: number
  refProductInterest: string
  refProductName: string
  refProductStatus: string
  updatedAt: string
  updatedBy: string
}

interface AllBankListProps {
  createdAt: string
  createdBy: string
  refAccountType: number
  refBalance: string
  refBankAccountNo: string
  refBankAddress: string
  refBankId: number
  refBankName: string
  refDummy1: string
  refDummy2: string
  refDummy3: string
  refDummy4: string
  refDummy5: string
  updatedAt: string
  updatedBy: string
}

interface BankProduct {
  refProductId: string
  refProductName: string
}

const CreateNewLoan: React.FC<CreateNewLoanProps> = ({ id }) => {
  const [selectedLoanType, setLoanType] = useState<LoanType | null>(null)
  const [selectedExistingLoan, setSelectedExistingLoan] = useState<SampleOpenLoansProps | null>(
    null
  )

  const [loadDetailsResponse, setLoanDetailsReponse] = useState<LoadDetailsResponseProps | null>(
    null
  )
  const [addLoanOption, setAddLoanOption] = useState([])
  const [showFullForm, setShowFullForm] = useState<boolean>(false)

  const [selectedBankList, setSelectedBankList] = useState('')
  const [selectedRepaymentType, setSelectedRepaymentType] = useState('')

  const [selectedProductId, setSelectedProductId] = useState<BankProduct[] | null>(null)

  const [ingredient, setIngredient] = useState<string>('')

  const [finalLoanAmount, SetFinalLoanAmount] = useState<number>(0)

  const [interestMonthDuration, setInterestMonthDuration] = useState<number>(0)

  const loanTypeOptions: LoanType[] = [
    { name: 'New Loan', code: 1 },
    { name: 'Top Up', code: 2 },
    { name: 'Extension', code: 3 }
  ]

  const repaymentType: RepaymentTypeProps[] = [
    { name: 'Flat Loan', code: 1 },
    { name: 'Diminishing Loan', code: 2 }
  ]

  const [date, setDate] = useState<Nullable<Date>>(null)

  const isSecondDropdownDisabled = selectedLoanType?.code !== 2 && selectedLoanType?.code !== 3

  const [bankProductList, setBankProductList] = useState<BankProductListProps[] | []>([])
  const [allBankList, setAllBankList] = useState<AllBankListProps[] | []>([])

  const [newLoanAmount, setNewLoanAmount] = useState<number>()

  const getUserLoanData = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminRoutes/addLoanOption',
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
          const options = data.data.map((data: any) => ({
            label: `Loan Amt : ${data.refLoanAmount} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`,
            value: data.refLoanId
          }))
          console.log('options', options)
          setAddLoanOption(options)
        } else {
          setShowFullForm(false)
        }
      })
      .catch(() => {
        setShowFullForm(false)
      })
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
          setBankProductList(productList)
          setAllBankList(data.allBankAccountList)

          // setLoadData(data.loanData)

          // setAllBankAccountList(data.allBankAccountList)
          // const productList = data.productList
          // data.productList.map((data, index) => {
          //   const name = `Name : ${data.refProductName} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`
          //   productList[index] = { ...productList[index], refProductName: name }
          // })
          // setProductList(productList)
        }
      })
  }

  const getLoanEntireDetails = (value?: number) => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/newLoan/selectedLoanDetailsV1',
        {
          loanId: value,
          loanTypeId: selectedLoanType?.code
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
        console.log('data', data.data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        setShowFullForm(true)
        setLoanDetailsReponse(data.data)
        getAllLoanData()
      })
      .catch(() => {
        setShowFullForm(false)
      })
  }

  const handleLoanTypeChange = (e: DropdownChangeEvent) => {
    const selected = e.value
    setLoanType(selected)
    setShowFullForm(false)

    if (selected.code === 2 || selected.code === 3) {
      getUserLoanData()
      setSelectedExistingLoan(null)
      setSelectedExistingLoan(null)
    } else {
      setShowFullForm(true)
      getAllLoanData()
    }
  }

  const handleLoanProductChange = (e: DropdownChangeEvent) => {
    console.log('e', e.value)
    setSelectedExistingLoan(e.value)
    getLoanEntireDetails(e.value)
  }

  const handleBankListChange = (e: DropdownChangeEvent) => {
    setSelectedBankList(e.value)
  }

  const handleRepaymentTypeChange = (e: DropdownChangeEvent) => {
    setSelectedRepaymentType(e.value)
  }

  const handleProductChange = (e: DropdownChangeEvent) => {
    console.log('e', e.value)
    setSelectedProductId(e.value)
  }

  const handleRadioChange = (e: RadioButtonChangeEvent) => {
    const value = e.value
    setIngredient(value)

    console.log('selectedProductId', selectedProductId)
    if (value === 'Yes') {
      const result = calculateLoanInterest({
        loanType: 1, // or 2 for diminishing
        principal: 100000,
        annualInterest: selectedProductId?.refProductInterest,
        durationInYears: selectedProductId?.refProductDuration
      })
      console.log('Interest (Yes selected):', result)
    } else if (value === 'No') {
      setInterestMonthDuration(0)
      const result = calculateLoanInterest({
        loanType: 2,
        principal: 100000,
        annualInterest: selectedProductId?.refProductInterest,
        durationInYears: selectedProductId?.refProductDuration
      })
      console.log('Interest (No selected):', result)
    }
  }

  const interestCalcualtion = () => {
    const today = new Date()
    const remainingDays = getRemainingDaysInMonth(today)
    console.log(remainingDays)
    console.log('remainingDays', remainingDays)
  }

  const initialInterestPerDay = () => {
    if (
      newLoanAmount == null ||
      selectedProductId?.refProductInterest == null ||
      selectedProductId?.refProductDuration == null
    ) {
      console.warn('Missing required loan data.')
      return
    }

    const calculateInitialInterestPerDay = calculateLoanInterest({
      loanType: 1, // or 2
      principal: newLoanAmount,
      annualInterest: selectedProductId.refProductInterest,
      durationInYears: selectedProductId.refProductDuration
    })

    console.log('calculateInitialInterestPerDay', calculateInitialInterestPerDay)
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex gap-3">
        <Dropdown
          value={selectedLoanType}
          onChange={handleLoanTypeChange}
          options={loanTypeOptions}
          optionLabel="name"
          placeholder="Select a Loan Type"
          className="flex-1"
        />

        <Dropdown
          value={selectedExistingLoan}
          onChange={handleLoanProductChange}
          options={addLoanOption}
          optionLabel="label"
          optionValue="value"
          placeholder="Select Existing Loans"
          className="flex-1"
          disabled={isSecondDropdownDisabled}
        />
      </div>

      {showFullForm && (selectedLoanType?.code === 2 || selectedLoanType?.code === 3) && (
        <>
          <div className="mt-3">
            <Accordion activeIndex={0}>
              <AccordionTab header="Loan Details">
                <div className="flex">
                  <div className="flex-1">
                    <p>
                      Total Loan: <b> {loadDetailsResponse?.totalLoanAmt}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Loan Interest : <b> {loadDetailsResponse?.loanInterest}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Loan Duration : <b> {loadDetailsResponse?.loanDuration}</b>
                    </p>
                  </div>
                </div>
                <div className="flex mt-3">
                  <div className="flex-1">
                    <p>
                      Interest Paid (First) : <b> {loadDetailsResponse?.interestFirst}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Initial Interest - Amt: <b> {loadDetailsResponse?.initialInterest}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Initial Interest - Month: <b> {loadDetailsResponse?.interestFirstMonth}</b>
                    </p>
                  </div>
                </div>
                <div className="flex mt-3">
                  <div className="flex-1">
                    <p>
                      Total Principal Amt : <b> {loadDetailsResponse?.totalPrincipal}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Total Interest Amt : <b> {loadDetailsResponse?.totalInterest}</b>
                    </p>
                  </div>
                  <div className="flex-1"></div>
                </div>
                <Divider layout="horizontal" className="flex" align="center">
                  <b>Calculation</b>
                </Divider>
                <div className="flex">
                  <div className="flex-1">
                    <p>
                      Total Principal Paid : <b> {loadDetailsResponse?.totalPrincipal}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Total Interest Paid : <b> {loadDetailsResponse?.totalInterestPaid}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Initial Interest Paid : <b> {loadDetailsResponse?.totalInitialInterest}</b>
                    </p>
                  </div>
                </div>
                <div className="flex mt-3">
                  <div className="flex-1">
                    <p>
                      Loan Duration : <b> {loadDetailsResponse?.loanDuration}</b>
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>
                      Balance Amt : <b> {loadDetailsResponse?.finalBalanceAmt}</b>
                    </p>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>
        </>
      )}
      {showFullForm && (
        <>
          <div className="mt-3">
            <div className="flex gap-3 align-items-center">
              <Dropdown
                name="productId"
                value={selectedProductId}
                onChange={handleProductChange}
                optionLabel="refProductName"
                options={bankProductList}
                filter
                className="flex-1"
                placeholder="Select Product"
                required
              />
              <InputNumber
                placeholder="New Loan Amount"
                className="flex-1"
                mode="currency"
                currency="INR"
                currencyDisplay="symbol"
                locale="en-IN"
                value={newLoanAmount}
                onChange={initialInterestPerDay}
                onValueChange={(e: InputNumberValueChangeEvent) => setNewLoanAmount(e.value)}
              />
              {showFullForm && (selectedLoanType?.code === 2 || selectedLoanType?.code === 3) && (
                <>
                  +
                  <InputText placeholder="Balance Loan Amount" className="flex-1" />
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex align-items-center gap-3">
              {showFullForm && (selectedLoanType?.code === 2 || selectedLoanType?.code === 3) && (
                <InputText placeholder="Loan Amount" className="flex-1" />
              )}
              <Calendar
                placeholder="Repayment Schedule Date"
                dateFormat="dd/mm/yy"
                className="flex-1"
                value={date}
                onChange={(e) => setDate(e.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex gap-3 align-items-center">
              <Dropdown
                placeholder="Bank Name"
                options={allBankList}
                optionLabel="refBankName"
                value={selectedBankList}
                optionValue="refBankId"
                onChange={handleBankListChange}
                className="flex-1"
              />
              <Dropdown
                placeholder="Repayment Type"
                options={repaymentType}
                value={selectedRepaymentType}
                onChange={handleRepaymentTypeChange}
                optionLabel="name"
                optionValue="code"
                className="flex-1"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex gap-3 align-items-center">
              <div className="flex gap-3">
                <div className="flex align-items-center">
                  <RadioButton
                    value="Yes"
                    onChange={handleRadioChange}
                    checked={ingredient === 'Yes'}
                  />
                  <label htmlFor="ingredient1" className="ml-2">
                    Yes
                  </label>
                </div>
                <div className="flex align-items-center">
                  <RadioButton
                    value="No"
                    onChange={handleRadioChange}
                    checked={ingredient === 'No'}
                  />
                  <label htmlFor="ingredient2" className="ml-2">
                    No
                  </label>
                </div>
              </div>
              <InputNumber
                placeholder="Interest Month Duration"
                className="flex-1"
                value={interestMonthDuration}
                onValueChange={(e: InputNumberValueChangeEvent) => {
                  setInterestMonthDuration(e.value)
                }}
                onChange={interestCalcualtion}
                disabled={ingredient === 'No'}
              />
              <InputNumber
                placeholder="Final Loan Amount"
                className="flex-1"
                mode="currency"
                currency="INR"
                currencyDisplay="code"
                locale="en-IN"
                value={finalLoanAmount}
                onValueChange={(e: InputNumberValueChangeEvent) => SetFinalLoanAmount(e.value)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CreateNewLoan
