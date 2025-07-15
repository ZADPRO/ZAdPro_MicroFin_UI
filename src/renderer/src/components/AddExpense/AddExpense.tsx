import axios from 'axios'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import React, { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { getSettingData, SettingData } from '@renderer/helper/SettingsData'

interface AddNewSupplierProps {
  closeSidebarNew: () => void
}

interface option {
  label: string
  value: number
  refAccountType?: number
  amount?: string
}

export const AddExpense: React.FC<AddNewSupplierProps> = ({ closeSidebarNew }) => {
  const [date, setDate] = useState<any>(new Date())
  const [vocherId, setVoucherId] = useState<string>()
  const [category, setCategory] = useState<number>()
  const [categoryName, setCategoryName] = useState<string | null>()
  const [subCategory, setSubCategory] = useState<string>()
  const [amount, setAmount] = useState<number | null>()
  const [bank, setBank] = useState<number | null>()
  const [categoryOption, setCategoryOption] = useState<option[]>([])
  const [bankOption, setBankOption] = useState<option[]>([])
  const [settingData, setSettingData] = useState<SettingData | null>()

  const handleBack = () => {
    closeSidebarNew()
  }
  function formatDateToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  const getOption = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/expense/expenseOption', {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        })
        .then((response: any) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          console.log('data line -------------- > 42', data)

          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            const options = data.bank.map((d: any) => ({
              label: `Name : ${d.refBankName} - A/C : ${d.refBankAccountNo} - Balance : ₹ ${d.refBalance}`,
              value: d.refBankId,
              refAccountType: d.refAccountType,
              amount: d.refBalance
            }))
            console.log('options line ------- 73', options)
            setBankOption(options)
            const options1: option[] = data.category.map((item: any) => ({
              label: item.refExpenseCategory,
              value: item.refExpenseCategoryId
            }))

            // Add "Others" option
            options1.push({ label: 'Others', value: 0 })
            setCategoryOption(options1)
          }
        })
    } catch (error) {}
  }

  const handelSubmit = () => {
    let bankBalance
    bankOption.map((data) => {
      if (data.value === bank) {
        console.log('data.amount line ------- 94', data.amount)
        bankBalance = data.amount
      }
    })
    console.log('bankBalance', bankBalance)
    if (Number(bankBalance) < Number(amount)) {
      toast.error('Selected Money resource Have the Minimum Amount than the Expense Amount', {
        position: 'top-right',
        autoClose: 3599,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Slide
      })
    } else {
      try {
        axios
          .post(
            import.meta.env.VITE_API_URL + '/expense/addExpense',
            {
              expenseDate: formatDateToDDMMYYYY(date),
              voucherNo: vocherId,
              categoryId: category,
              categoryName: categoryName,
              newCategory: category === 0 ? true : false,
              subCategory: subCategory,
              Amount: amount,
              BankID: bank
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
            console.log('data line -------------- > 101', data)

            localStorage.setItem('token', 'Bearer ' + data.token)

            if (data.success) {
              console.log(' -> Line Number ----------------------------------- 138')
              toast.success('Expense Stored Successfully', {
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
              console.log(' -> Line Number ----------------------------------- 149')
              handleBack()
              console.log(' -> Line Number ----------------------------------- 151')
            }
          })
      } catch (error) {
        console.log('error', error)
        toast.error('Error in storing the Expense', {
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
    }
  }

  const filteredOptions = () => {
    if (settingData?.paymentMethod === 2) {
      return bankOption.filter((e) => e.refAccountType === 1) // For Bank
    }

    if (settingData?.paymentMethod === 3) {
      return bankOption.filter((e) => e.refAccountType === 2) // For Cash
    }

    return bankOption // Default: show all
  }

  useEffect(() => {
    getOption()
    const getSetData = async () => {
      const settingdatas = await getSettingData()
      console.log('settingdatas line ------ 172', settingdatas)
      setSettingData(settingdatas)
    }
    getSetData()
  }, [])
  return (
    <div>
      <ToastContainer />
      <div>
        <p>
          <b className="text-[1.2rem]">Add Expense</b>
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handelSubmit()
        }}
      >
        <div className="m-5">
          <div className="flex justify-around py-2">
            <div className="flex flex-col w-[45%]">
              <label>Select Date</label>
              <Calendar
                value={date}
                required
                placeholder="select Date"
                onChange={(e) => setDate(e.value)}
                dateFormat="dd / mm / yy"
                maxDate={new Date()}
                // minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                readOnlyInput
              />
            </div>
            <div className="flex flex-col w-[45%]">
              <label>Voucher Id</label>
              <InputText
                placeholder="Enter Voucher ID"
                value={vocherId}
                required
                onChange={(e) => setVoucherId(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-around py-2">
            <div className={`flex flex-col ${category === 0 ? 'w-[30%]' : 'w-[45%]'}`}>
              <label>Select Expense Category</label>

              <Dropdown
                filter
                value={category}
                required
                onChange={(e) => {
                  setCategory(e.value)
                  categoryOption.map((data) => {
                    if (data.value == e.value) {
                      setCategoryName(data.label)
                      console.log('data.label', data.label)
                    }
                  })
                }}
                options={categoryOption}
                optionLabel="label"
                placeholder="Select Expense Category"
                className="w-full"
              />
            </div>
            {category === 0 && (
              <div className="flex flex-col w-[30%]">
                <label>Enter Category Name</label>
                <InputText
                  value={categoryName}
                  required
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
            )}

            <div className={`flex flex-col ${category === 0 ? 'w-[30%]' : 'w-[45%]'}`}>
              <label>Enter Sub-Category</label>
              <InputText
                placeholder="Enter Sub-Category"
                value={subCategory}
                required
                onChange={(e) => setSubCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-around py-2">
            <div className="flex flex-col w-[45%]">
              <label>Enter Amount</label>
              <InputNumber
                placeholder="Enter Amount"
                inputId="currency-india"
                value={amount}
                required
                onValueChange={(e) => setAmount(e.value)}
                mode="currency"
                currency="INR"
                currencyDisplay="symbol"
                locale="en-IN"
              />
            </div>
            <div className="flex flex-col w-[45%]">
              <label>Select Amount Source</label>
              <Dropdown
                filter
                value={bank}
                onChange={(e) => setBank(e.value)}
                options={filteredOptions()}
                required
                optionLabel="label" // ensure your bankOption objects have a 'label' property
                placeholder="Select Amount Source"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-around py-2">
            <div className="flex flex-col w-[40%]">
              <button className="bg-[green] py-2 text-[white] rounded-lg" type="submit">
                Store Expense
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
