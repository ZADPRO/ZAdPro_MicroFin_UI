import axios from 'axios'
import { useEffect } from 'react'
import { Button } from 'primereact/button'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { FloatLabel } from 'primereact/floatlabel'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast, ToastContainer } from 'react-toastify'

import { TabView, TabPanel } from 'primereact/tabview'
import { InputNumber, InputNumberChangeEvent } from 'primereact/inputnumber'

// interface for mode of payment
interface MoneyType {
  name: string
  id: number
}

interface BankOptions {
  refBankName: string
  refBankId: number
  label: string
  refAccountType: number
  refAccountTypeName: string
  refBalance: string
}

const AddnewFund = ({ closeSidebarNew }) => {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const [moneyType, setMoneyType] = useState<MoneyType | null>(null)
  // Need to maintain that the input amount was from in hand (liquid cash) or from bank
  const moneyOptions: MoneyType[] = [
    { name: 'Bank', id: 1 },
    { name: 'Cash', id: 2 }
  ]
  // Handle the from and to account with validation
  const [handleSelfTransferFrom, setHandleSelfTransferFrom] = useState<number | null>(null)
  console.log('handleSelfTransferFrom', handleSelfTransferFrom)
  const [handleSelfTransferTo, setHandleSelfTransferTo] = useState<number | null>(null)
  const [transferAmount, setTransferAmount] = useState<number | null>(null)

  const [bankOptions, setBankOptions] = useState<BankOptions[] | []>([])

  const filteredToOptions = bankOptions.filter((bank) => bank?.refBankId !== handleSelfTransferFrom)
  console.log('bankOptions', bankOptions)
  console.log('filteredToOptions', filteredToOptions)

  const [inputs, setInputs]: any = useState({
    refBankId: '',
    refbfTransactionDate: '',
    refbfTransactionType: 'credit',
    refbfTransactionAmount: '',
    refBankName: '',
    refTxnId: '',
    refFundType: 'fund'
  })

  const handleInput = (e: any) => {
    console.log('e', e)
    const { name, value } = e.target
    console.log('value', value)
    console.log('name', name)

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const Addnewback = async () => {
    setSubmitLoading(true)

    console.log('inputs.refbfTransactionAmount', inputs.refbfTransactionAmount)
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/adminRoutes/addBankFund',
          {
            refBankId: inputs.refBankId,
            refbfTransactionDate: inputs.refbfTransactionDate,
            refbfTransactionType: inputs.refbfTransactionType,
            refbfTransactionAmount: Number(inputs.refbfTransactionAmount),
            refTxnId: null,
            refFundType: inputs.refFundType
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response: any) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )

          localStorage.setItem('token', 'Bearer ' + data.token)

          console.log(data)
          setSubmitLoading(false)

          if (data.success) {
            toast.success('Successfully Added', {
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

            closeSidebarNew()
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  const fetchBankDetails = async (e: any) => {
    console.log('e', e)
    setMoneyType(e.value)
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + '/adminRoutes/getBankList', {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      })

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)

      localStorage.setItem('token', 'Bearer ' + data.token)

      console.log('data', data)
      console.log('moneyType', moneyType)
      if (data.success) {
        console.log('moneyType', moneyType)

        const filteredBankData = data.BankFund.filter(
          (item: any) => item.refAccountType === e.value
        ).map((item: any) => ({
          ...item,
          label: `Name: ${item.refBankName} | ₹ ${item.refBalance ?? 0}`
        }))

        console.log('Filtered Bank Data:', filteredBankData)
        setBankOptions(filteredBankData)
      }
    } catch (error) {
      console.log('Error fetching bank details:', error)
    }
  }

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setInputs((prevState) => ({
      ...prevState,
      refbfTransactionDate: today
    }))

    const selfTransferAccAPI = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL + '/adminRoutes/getBankList',
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )

        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )

        localStorage.setItem('token', 'Bearer ' + data.token)

        console.log('data', data)
        console.log('moneyType', moneyType)
        if (data.success) {
          console.log('moneyType', moneyType)

          const filteredBankData = data.BankFund.map((item: any) => ({
            ...item,
            label: `Name:  ${item.refBankName} | ₹ ${item.refBalance ?? 0}`
          }))

          console.log('Filtered Bank Data:', filteredBankData)
          setBankOptions(filteredBankData)
        }
      } catch (error) {
        console.log('Error fetching bank details:', error)
      }
    }

    selfTransferAccAPI()
  }, [activeIndex])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setInputs((prevState) => ({
      ...prevState,
      refbfTransactionDate: today
    }))
  }, [])

  const handleSelfTransferFunds = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/fund/selfTransfer',
        {
          fromId: handleSelfTransferFrom,
          toId: handleSelfTransferTo,
          amt: transferAmount
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )
      .then((response: any) => {
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )

        localStorage.setItem('token', 'Bearer ' + data.token)
        if (data.success) {
          toast.success('Amount Transfered Successfully', {
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
          closeSidebarNew()
        } else {
          toast.error('Error in Making SelfTransfer', {
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

        console.log(data)
      })
  }

  const handleAmountChange = (e: InputNumberChangeEvent) => {
    const selectedBank = bankOptions.find((bank: any) => bank.refBankId === handleSelfTransferFrom)

    const balance = parseFloat(selectedBank?.refBalance ?? '0')
    console.log('balance', balance)
    const enteredAmount = e.value ?? 0
    console.log('enteredAmount', enteredAmount)

    if (enteredAmount > balance) {
      toast.warn(`You cannot transfer more than ₹${balance.toLocaleString('en-IN')}`)
      return
    }

    setTransferAmount(enteredAmount)
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid grey',
          paddingBottom: '10px'
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>Add New Fund</div>
      </div>

      <TabView
        className="mt-3"
        activeIndex={activeIndex}
        onTabChange={(e) => {
          console.log(e.index)
          setActiveIndex(e.index)
        }}
      >
        <TabPanel header="Add Funds">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              Addnewback()
            }}
          >
            <div style={{ margin: '5px 0px', overflow: 'auto', padding: '10px' }}>
              <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                <FloatLabel style={{ width: '100%' }}>
                  <Dropdown
                    name="moneyType"
                    style={{ width: '100%', minWidth: '100%' }}
                    value={moneyType}
                    options={moneyOptions}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e: DropdownChangeEvent) => {
                      fetchBankDetails(e)
                    }}
                    required
                  />
                  <label htmlFor="refBankId">Choose Bank Type</label>
                </FloatLabel>
              </div>
            </div>
            <div style={{ margin: '5px 0px', height: '78vh', overflow: 'auto', padding: '10px' }}>
              <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '15px' }}>
                <FloatLabel style={{ width: '100%' }}>
                  <Dropdown
                    name="refBankId"
                    style={{ width: '100%', minWidth: '100%' }}
                    value={inputs.refBankId}
                    options={bankOptions}
                    optionLabel="label"
                    optionValue="refBankId"
                    onChange={(e: any) => handleInput(e)}
                    required
                  />
                  <label htmlFor="refBankId">Choose Bank</label>
                </FloatLabel>

                <FloatLabel style={{ width: '100%', marginTop: '' }}>
                  <InputNumber
                    id="refbfTransactionAmount"
                    name="refbfTransactionAmount"
                    mode="currency"
                    currency="INR"
                    currencyDisplay="symbol"
                    className="w-full"
                    locale="en-IN"
                    value={inputs.refbfTransactionAmount}
                    onValueChange={(e: any) => handleInput(e)}
                    required
                  />
                  <label htmlFor="refbfTransactionAmount">Transaction Amount</label>
                </FloatLabel>
              </div>

              <input
                type="hidden"
                name="refbfTransactionDate"
                value={inputs.refbfTransactionDate}
              />
              <input
                type="hidden"
                name="refbfTransactionType"
                value={inputs.refbfTransactionType}
              />
              <input type="hidden" name="refTxnId" value={inputs.refTxnId} />
              <input type="hidden" name="refFundType" value={inputs.refFundType} />

              {submitLoading ? (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '35px'
                  }}
                >
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: '2rem', color: '#0478df' }}
                  ></i>
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '35px'
                  }}
                >
                  <Button style={{ width: '20%' }} type="submit" label="Submit" />
                </div>
              )}
            </div>
          </form>
        </TabPanel>
        {/* CHANGES DONE - THIRU */}
        {/* Need a separate UI to maintain the transfer of money from one to another : the agent or admin can transfer the amount from one bank to another or inhand to other */}
        <TabPanel header="Self Transfer">
          <div className="card flex flex-column md:flex-row gap-3 mt-6 mx-[5px]">
            <FloatLabel className="w-full flex-1">
              <Dropdown
                value={handleSelfTransferFrom}
                onChange={(e: DropdownChangeEvent) => setHandleSelfTransferFrom(e.value)}
                options={bankOptions}
                optionLabel="label"
                optionValue="refBankId"
                className="w-full"
                placeholder="Select from"
              />
              <label>Self Transfer From</label>
            </FloatLabel>

            <FloatLabel className="w-full flex-1">
              <Dropdown
                value={handleSelfTransferTo}
                onChange={(e: DropdownChangeEvent) => setHandleSelfTransferTo(e.value)}
                options={filteredToOptions}
                optionLabel="label"
                className="w-full"
                optionValue="refBankId"
                placeholder="Select to"
                disabled={!handleSelfTransferFrom}
              />
              <label>Self Transfer To</label>
            </FloatLabel>
          </div>
          <div className="card flex flex-column md:flex-row gap-3 mt-5 mx-[5px]">
            <FloatLabel className="w-full flex-1">
              <InputNumber
                id="username"
                value={transferAmount}
                mode="currency"
                currency="INR"
                currencyDisplay="symbol"
                locale="en-IN"
                className="w-full"
                onChange={handleAmountChange}
              />

              <label htmlFor="username">Transfer Amount</label>
            </FloatLabel>
          </div>

          {submitLoading ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '35px'
              }}
            >
              <i
                className="pi pi-spin pi-spinner"
                style={{ fontSize: '2rem', color: '#0478df' }}
              ></i>
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '35px'
              }}
            >
              <Button
                style={{ width: '20%' }}
                type="submit"
                label="Submit"
                onClick={handleSelfTransferFunds}
              />
            </div>
          )}
        </TabPanel>
      </TabView>
    </>
  )
}

export default AddnewFund
