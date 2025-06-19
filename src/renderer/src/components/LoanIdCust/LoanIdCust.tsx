import axios from 'axios'
import  { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Dropdown } from 'primereact/dropdown'
import { Slide, toast, ToastContainer } from 'react-toastify'

interface Option {
  name: string
  code: number
}

export default function LoanIdCust() {
  const [settingOption, setOption] = useState<Option[] | []>([])
  const [selectedOption, setSelectedOption] = useState<number | null>()
  const [edit, setEdit] = useState<boolean>(false)
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
            console.log('data', data)
            const options = data.option.map((d: any) => ({
              name: d.refLoanIdName,
              code: d.refLoanTypeId
            }))
            setOption(options)
            const seetingData = data.settings.filter((e) => e.refSettingId === 2)
            console.log('seetingData.refSettingValue', seetingData)
            setSelectedOption(seetingData[0].refSettingValue)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }
  const updateOption = () => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/settings/updateOption',
          {
            id: 2,
            value: selectedOption
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
            toast.success('Customer Id Format Update Successfully', {
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
        <div>
          <b>Customer ID Configuration Type</b>
        </div>
        <div className="flex w-full justify-between align-items-end my-2">
          <div className="w-[80%] flex flex-col gap-y-1">
            <label htmlFor="lname">Selected Type</label>

            <Dropdown
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

        <div></div>
      </div>
    </>
  )
}
