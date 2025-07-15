import axios from 'axios'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { Divider } from 'primereact/divider'
// import { Button } from 'primereact/button'

interface Option {
  label: string
  value: number
}

export default function PaymentConfiguration() {
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<number | null>()
  const [selectedRePaymentOption, setSelectedRePaymentOption] = useState<number | null>()
  const [ifEdit, setIfEdit] = useState<boolean | null>()

  const paymentOptions: Option[] = [
    {
      label: 'Bank & Cash',
      value: 1
    },
    {
      label: 'Bank Only',
      value: 2
    },
    {
      label: 'Cash Only',
      value: 3
    }
  ]
  const rePaymentOptions: Option[] = [
    {
      label: 'Repayment should be made in the same mode as the loan was given',
      value: 1
    },
    {
      label: 'Repayment can be made either in bank or in cash.',
      value: 2
    }
  ]
  const getData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/settings/paymentMethod/getOption', {
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
            console.log('data line ------- 59', data)
            const seetingData = data.settings.filter((e) => e.refSettingId === 6)
            setSelectedPaymentOption(seetingData[0].refSettingValue)
            const seetingData1 = data.settings.filter((e) => e.refSettingId === 7)
            setSelectedRePaymentOption(seetingData1[0].refSettingValue)
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
            settings: [
              {
                id: 6,
                refSettingValue: selectedPaymentOption
              },
              {
                id: 7,
                refSettingValue: selectedRePaymentOption
              }
            ]
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
            toast.success('The Payment Method Update Successfully', {
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
            setIfEdit(false)
          }
        })
    } catch (error) {
      toast.error('Error In Updating Payment Method', {
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
        <div className="flex justify-end">
          {!ifEdit ? (
            <>
              <button
                className=" py-2 rounded-md text-white w-[20%]  bg-[blue] hover:bg-[#2210ff]"
                onClick={() => setIfEdit(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                className="w-[20%] py-2 rounded-md text-white  bg-[green] hover:bg-[#408000]"
                onClick={() => {
                  updateOption()
                }}
              >
                Update
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <div>
            <b>Select Payment Method Used In Application</b>
          </div>
          <div>
            <Dropdown
              value={selectedPaymentOption}
              onChange={(e: DropdownChangeEvent) => {
                console.log('e.value', e.value)
                setSelectedPaymentOption(e.value)
                setSelectedRePaymentOption(0)
              }}
              options={paymentOptions}
              required
              disabled={!ifEdit}
              optionLabel="label"
              placeholder="Select a Payment Method "
              className="w-full"
            />
          </div>
        </div>

        {selectedPaymentOption === 1 && (
          <div>
            <Divider className="my-3" />
            <div className="flex flex-col gap-y-2">
              <div>
                <b>Select Re-Payment Money Collection Method</b>
              </div>
              <div>
                <Dropdown
                  value={selectedRePaymentOption}
                  onChange={(e: DropdownChangeEvent) => setSelectedRePaymentOption(e.value)}
                  options={rePaymentOptions}
                  required
                  disabled={!ifEdit}
                  optionLabel="label"
                  placeholder="Select a Re-Payment Pay Mode "
                  className="w-full"
                />
              </div>
              <div>
                <small>
                  <p className="my-1">
                    <b>Note:</b> To show or hide cash flow data in the application and reports, the
                    "Repayment Mode" must be selected as either <b>Bank</b> or <b>Cash</b>.
                  </p>
                </small>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
