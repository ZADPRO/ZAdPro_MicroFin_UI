import axios from 'axios'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton'

const BankInputNew = ({ closeSidebarNew }) => {
  const [submitLoading, setSubmitLoading] = useState(false)

  const [bankType, setBankType] = useState<string>('')
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<number | null>()
  // const [selectedRePaymentOption, setSelectedRePaymentOption] = useState<number | null>()

  const [inputs, setInputs]: any = useState({
    refBankName: '',
    refBankAccountNo: '',
    refBankAddress: '',
    refBalance: 0,
    refBankIFSCCode: ''
  })

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleNewUser = async () => {
    setSubmitLoading(true)

    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/adminRoutes/addBankAccount',
          {
            refBankName: inputs.refBankName,
            refBankAccountNo: inputs.refBankAccountNo,
            refBankAddress: inputs.refBankAddress,
            refBalance: inputs.refBalance,
            refIFSCsCode: inputs.refBankIFSCCode,
            refAccountType: bankType === 'Cash' ? 2 : 1
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

          setSubmitLoading(false)

          localStorage.setItem('token', 'Bearer ' + data.token)

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

  const GetPaymentSettingsData = () => {
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
            const seetingData = data.settings.filter((e) => e.refSettingId === 6)
            setSelectedPaymentOption(seetingData[0].refSettingValue)

            if (seetingData[0].refSettingValue === 2) {
              setBankType('Bank')
            } else if (seetingData[0].refSettingValue === 3) {
              setBankType('Cash')
            }
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    GetPaymentSettingsData()
  }, [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid grey',
          paddingBottom: '10px'
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>
          Add New Payment Flow
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleNewUser()
        }}
      >
        <div style={{ margin: '5px 0px', height: '78vh', overflow: 'auto', padding: '10px' }}>
          {selectedPaymentOption === 1 && (
            <div className="flex gap-3">
              <div className="flex align-items-center">
                <RadioButton
                  value="Bank"
                  onChange={(e: RadioButtonChangeEvent) => setBankType(e.value)}
                  checked={bankType === 'Bank'}
                />
                <label htmlFor="bankType1" className="ml-2">
                  Bank
                </label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  value="Cash"
                  onChange={(e: RadioButtonChangeEvent) => setBankType(e.value)}
                  checked={bankType === 'Cash'}
                />
                <label htmlFor="bankType1" className="ml-2">
                  Cash
                </label>
              </div>
            </div>
          )}

          {selectedPaymentOption !== 1 && (
            <div>
              <b>Add New {selectedPaymentOption === 2 ? 'Bank Account' : 'Cash Flow'}</b>
            </div>
          )}

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '50%' }}>
              <InputText
                id="refBankName"
                name="refBankName"
                value={inputs.refBankName}
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="refBankName">
                Enter {bankType === 'Bank' ? 'Bank' : 'Cash Flow'} Name
              </label>
            </FloatLabel>
            {bankType !== 'Cash' && (
              <FloatLabel style={{ width: '50%' }}>
                <InputText
                  type="number"
                  id="refBankAccountNo"
                  name="refBankAccountNo"
                  value={inputs.refBankAccountNo}
                  onChange={(e: any) => {
                    handleInput(e)
                  }}
                  required
                />
                <label htmlFor="refBankAccountNo">Enter Account Number</label>
              </FloatLabel>
            )}
          </div>

          {bankType !== 'Cash' && (
            <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
              <FloatLabel style={{ width: '100%' }}>
                <InputText
                  id="refBankAddress"
                  name="refBankAddress"
                  value={inputs.refBankAddress}
                  onChange={(e: any) => {
                    handleInput(e)
                  }}
                  required
                />
                <label htmlFor="refBankAddress">Enter Bank Address</label>
              </FloatLabel>

              <FloatLabel style={{ width: '100%' }}>
                <InputText
                  id="refBankIFSCCode"
                  name="refBankIFSCCode"
                  value={inputs.refBankIFSCCode}
                  onChange={(e: any) => {
                    handleInput(e)
                  }}
                  required
                />
                <label htmlFor="refBankIFSCCode">Enter Bank IFSC Code</label>
              </FloatLabel>
            </div>
          )}

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
    </>
  )
}

export default BankInputNew
