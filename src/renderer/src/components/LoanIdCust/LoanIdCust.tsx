import axios from 'axios'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Dropdown } from 'primereact/dropdown'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { Divider } from 'primereact/divider'
import { MultiSelect } from 'primereact/multiselect'

interface Option {
  name: string
  code: number
}

export default function LoanIdCust() {
  const [settingOption, setOption] = useState<Option[] | []>([])
  const [interestClosingCalOption, setInterestClosingCalOption] = useState<Option[] | []>([])
  const [selectedOption, setSelectedOption] = useState<number | null>()
  const [selectedInterestClosingCal, setSelectedInterestClosingCal] = useState<number | null>()
  const [edit, setEdit] = useState<boolean>(false)
  const [selectedStartDay, setSelectedStartDay] = useState<number | null>()
  const [selectedEndDay, setSelectedEndDay] = useState<number | null>()
  const [checked, setChecked] = useState<boolean>(false)
  const [loanType, setLoanType] = useState<Option[] | null>([])
  const [rePaymentType, setRePaymentType] = useState<Option[] | null>([])
  const [selectedLoanDueType, setSelectedLoanDueType] = useState<number | null>()
  const [loanDueType, setLoanDueType] = useState<Option[] | null>([])
  const [selectedLoanType, setSelectedLoanType] = useState<number[] | null>([])
  const [selectedRePaymentType, setSelectedRePaymentType] = useState<number[] | null>([])
  const [loanAdvanceType, setLoanAdvanceType] = useState<Option[] | []>([])
  const [selectedLoanAdvanceType, setSelectedLoanAdvanceType] = useState<number[] | null>([])
  const daysOfWeek = [
    { label: 'Sunday', value: 'Sunday', code: 1 },
    { label: 'Monday', value: 'Monday', code: 2 },
    { label: 'Tuesday', value: 'Tuesday', code: 3 },
    { label: 'Wednesday', value: 'Wednesday', code: 4 },
    { label: 'Thursday', value: 'Thursday', code: 5 },
    { label: 'Friday', value: 'Friday', code: 6 },
    { label: 'Saturday', value: 'Saturday', code: 7 }
  ]

  const dateChange = (value) => {
    console.log('value', value)
    setSelectedStartDay(value)
    if (value === 1) {
      setSelectedEndDay(7)
    } else {
      setSelectedEndDay(value - 1)
    }
  }
  const getData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/settings/LoanId/getOption', {
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

          localStorage.setItem('token', 'Bearer ' + data.token)
          if (data.success) {
            console.log('data line ---- 62', data)
            const options = data.option.map((d: any) => ({
              name: d.refLoanIdName,
              code: d.refLoanTypeId
            }))
            setOption(options)
            const interestCalOptions = data.loanCalOption.map((d: any) => ({
              name: d.refLoanClosingCalType,
              code: d.refLoanClosingCalId
            }))
            console.log('interestCalOptions', interestCalOptions)
            setInterestClosingCalOption(interestCalOptions)
            const seetingData = data.settings.filter((e) => e.refSettingId === 2)
            setSelectedOption(seetingData[0].refSettingValue)

            const advanceCal = data.settings.filter((e) => e.refSettingId === 8)
            setSelectedLoanAdvanceType(advanceCal[0].refSettingValue)

            const loanDueType = data.settings.filter((e) => e.refSettingId === 9)
            console.log('loanDueType', loanDueType)
            setSelectedLoanDueType(loanDueType[0].refSettingValue)

            const loanClosingCalData = data.settings.filter((e) => e.refSettingId === 4)
            setSelectedInterestClosingCal(loanClosingCalData[0].refSettingValue)

            const initialInterest = data.settings.filter((e) => e.refSettingId === 3)
            console.log('loanClosingCalData', loanClosingCalData)
            setChecked(initialInterest[0].refSettingBoolean)

            const weekStartEnd = data.settings.filter((e) => e.refSettingId === 5)
            const days = weekStartEnd[0].refSettingData.split(',')
            console.log('days', days)

            const startDay = daysOfWeek.filter((e) => e.value === days[0])
            const endDay = daysOfWeek.filter((e) => e.value === days[1])
            setSelectedStartDay(startDay[0].code)
            setSelectedEndDay(endDay[0].code)

            const loanTypeOption = data.loanType.map((data) => {
              return {
                name: data.refLoanType,
                code: data.refLoanTypeId
              }
            })

            console.log('loanTypeOption line ----- 99', loanTypeOption)
            setLoanType(loanTypeOption)
            const rePaymentType = data.rePaymentType.map((data) => {
              return {
                name: data.refRepaymentTypeName,
                code: data.refRepaymentTypeId
              }
            })
            setRePaymentType(rePaymentType)
            const dueType = data.loanDueType.map((data) => {
              return {
                name: data.refDueTypes,
                code: data.refDueTypeId
              }
            })
            setLoanDueType(dueType)
            const advanceType = data.loanAdvanceCalOption.map((data) => {
              return {
                name: data.refLoanAdvanceCalType,
                code: data.refLoanAdvanceCalId
              }
            })
            setLoanAdvanceType(advanceType)
            setSelectedLoanType(data.loanTypeVisible.map((data) => data.refLoanTypeId))
            setSelectedRePaymentType(
              data.rePaymentTypeVisible.map((data) => data.refRepaymentTypeId)
            )
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }
  const updateOption = () => {
    try {
      const startDay = daysOfWeek.filter((e) => e.code === selectedStartDay)
      const endDay = daysOfWeek.filter((e) => e.code === selectedEndDay)
      axios
        .post(
          import.meta.env.VITE_API_URL + '/settings/updateOption',
          {
            settings: [
              {
                id: 2,
                refSettingValue: selectedOption
              },
              {
                id: 3,
                refSettingBoolean: checked
              },
              {
                id: 4,
                refSettingValue: selectedInterestClosingCal
              },
              {
                id: 5,
                refSettingData: [startDay[0].value, endDay[0].value]
              },
              {
                id: 8,
                refSettingValue: selectedLoanAdvanceType
              },
              {
                id: 9,
                refSettingValue: selectedLoanDueType
              }
            ],
            loanType: selectedLoanType,
            rePaymentType: selectedRePaymentType
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
            toast.success('Loan Configuration Update Successfully', {
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
            setEdit(false)
          }
        })
    } catch (error) {
      toast.error('Error In Updating Loan Configuration', {
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
      console.log('error', error)
    }
  }
  useEffect(() => {
    getData()
  }, [])
  return (
    <>
      <ToastContainer />
      <div>
        <div className="flex justify-between align-items-center">
          <div>{/* <b>Customer ID Configuration Type</b> */}</div>
          <div className="w-[15%]">
            {!edit && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setEdit(true)
                }}
                className="w-full py-2 rounded-md text-white  bg-[blue] hover:bg-[#2210ff]"
              >
                Edit
              </button>
            )}

            {edit && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  updateOption()
                }}
                className="w-full py-2 rounded-md text-white  bg-[green] hover:bg-[#408000]"
              >
                Update
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-x-5">
          <div className="w-[49%] flex flex-col gap-y-2">
            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Customer ID Configuration Type</label>

              <Dropdown
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                name="status"
                value={selectedOption}
                options={settingOption}
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  console.log('e.value', e.value)
                  setSelectedOption(e.value)
                }}
              />
            </div>
            <Divider className="my-1" />
            <div className="w-[100%] flex gap-x-2 align-items-center">
              <div className="flex flex-col flex-10">
                <label htmlFor="lname">Initial Interest</label>
                <small className="text-[#858585]">
                  Note : If we need to calculate the interest for the remaining days of the loan in
                  the given month or week.
                </small>
              </div>
              <div className="flex-1 flex align-items-center">
                <InputSwitch
                  disabled={!edit}
                  checked={checked}
                  onChange={(e: InputSwitchChangeEvent) => {
                    setChecked(e.value)
                  }}
                />
              </div>
            </div>
            <Divider className="my-1" />
            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Loan Closing Calculation Type</label>

              <Dropdown
                name="status"
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                value={selectedInterestClosingCal}
                options={interestClosingCalOption}
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  console.log('e.value', e.value)
                  setSelectedInterestClosingCal(e.value)
                }}
              />
            </div>
            <Divider className="my-1" />
            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Loan Advance Amount Calculation Type</label>

              <Dropdown
                name="status"
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                value={selectedLoanAdvanceType}
                options={loanAdvanceType}
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  setSelectedLoanAdvanceType(e.value)
                }}
                valueTemplate={(option) => (
                  <div className="truncate w-full" title={option?.name}>
                    {option?.name}
                  </div>
                )}
              />
            </div>
          </div>
          <Divider layout="vertical" />
          <div className="w-[49%] flex flex-col gap-y-2">
            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Select Loan Provided Option</label>

              <MultiSelect
                name="status"
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                value={selectedLoanType}
                options={loanType ?? []}
                required
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  console.log('e.value', e.value)
                  setSelectedLoanType(e.value)
                }}
              />
            </div>
            <Divider className="my-1" />

            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Select Loan RePayment Calculation Type</label>

              <MultiSelect
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                name="status"
                value={selectedRePaymentType}
                options={rePaymentType ?? []}
                required
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  console.log('e.value', e.value)
                  setSelectedRePaymentType(e.value)
                }}
              />
            </div>
            <Divider className="my-1" />

            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Select Loan Due Type</label>

              <Dropdown
                className="w-full md:h-[2.5rem] text-sm align-items-center"
                name="status"
                value={selectedLoanDueType}
                options={loanDueType ?? []}
                required
                optionLabel="name"
                optionValue="code"
                disabled={!edit}
                onChange={(e: any) => {
                  console.log('e.value', e.value)
                  setSelectedLoanDueType(e.value)
                }}
              />
            </div>
            <Divider className="my-1" />
            <div className="w-[100%] flex flex-col gap-y-1">
              <label htmlFor="lname">Selected Weekly Loan Start and End Day</label>

              <div className="flex justify-between gap-x-2">
                <Dropdown
                  className="flex-1 w-full md:h-[2.5rem] text-sm align-items-center"
                  disabled={!edit}
                  value={selectedStartDay}
                  options={daysOfWeek}
                  onChange={(e) => {
                    dateChange(e.value)
                  }}
                  placeholder="Select a Day"
                  optionLabel="label"
                  optionValue="code"
                />
                <Dropdown
                  className="flex-1 w-full md:h-[2.5rem] text-sm align-items-center"
                  disabled
                  value={selectedEndDay}
                  options={daysOfWeek}
                  placeholder="Select a Day"
                  optionLabel="label"
                  optionValue="code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
