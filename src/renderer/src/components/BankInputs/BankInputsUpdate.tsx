import axios from 'axios'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { RadioButton } from 'primereact/radiobutton'

const BankInputsUpdate = ({ data, closeSidebarUpdate }) => {
  console.log('data', data)
  const [saveloading, setSaveloading] = useState(false)

  const [edit, setEdit] = useState(true)

  const [inputs, setInputs]: any = useState({
    refBankId: data.refBankId,
    refBankName: data.refBankName,
    refBankAccountNo: data.refBankAccountNo,
    refBankAddress: data.refBankAddress,
    refBalance: data.refBalance,
    refAccountType: data.refAccountType,
    refAccountTypeName: data.refAccountTypeName,
    refIFSCsCode: data.refIFSCsCode
  })

  const submitUpdate = async () => {
    setSaveloading(true)

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminRoutes/updateBankAccount',
        {
          refBankId: inputs.refBankId,
          refBankName: inputs.refBankName,
          refBankAccountNo: inputs.refBankAccountNo,
          refBankAddress: inputs.refBankAddress,
          refBalance: inputs.refBalance,
          refAccountType: inputs.refAccountType,
          refAccountTypeName: inputs.refAccountTypeName,
          refIFSCsCode: inputs.refIFSCsCode
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      console.log(data)

      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success) {
        closeSidebarUpdate()
        toast.success('Successfully Updated', {
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
    } catch (e: any) {
      console.log(e)
    }
  }

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

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
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8d20f' }}>Bank Data</div>
          <div>
            {!edit ? (
              <>
                {saveloading ? (
                  <div
                    style={{
                      backgroundColor: '#f8d20f',
                      width: '4rem',
                      textAlign: 'center',
                      padding: '10px 0px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  >
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#f8d20f',
                      width: '4rem',
                      textAlign: 'center',
                      padding: '10px 0px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                    onClick={submitUpdate}
                  >
                    Save
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    backgroundColor: '#f8d20f',
                    width: '4rem',
                    textAlign: 'center',
                    padding: '10px 0px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '700'
                  }}
                  onClick={() => {
                    setEdit(false)
                  }}
                >
                  Edit
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ margin: '5px 0px', height: '76vh', overflow: 'auto', padding: '10px' }}>
        <div className="flex gap-3">
          <div className="flex align-items-center">
            <RadioButton
              inputId="bank"
              name="accountType"
              value={1}
              onChange={(e) => setInputs({ ...inputs, refAccountType: e.value })}
              checked={inputs.refAccountType === 1}
              disabled
            />
            <label htmlFor="bank" className="ml-2">
              Bank
            </label>
          </div>
          <div className="flex align-items-center">
            <RadioButton
              inputId="cash"
              name="accountType"
              value={2}
              onChange={(e) => setInputs({ ...inputs, refAccountType: e.value })}
              checked={inputs.refAccountType === 2}
              disabled
            />
            <label htmlFor="cash" className="ml-2">
              Cash
            </label>
          </div>
        </div>
        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refBankName"
              name="refBankName"
              value={inputs.refBankName}
              onChange={(e: any) => {
                handleInput(e)
              }}
              disabled={edit}
              required
            />
            <label htmlFor="refBankName">Enter Bank Name</label>
          </FloatLabel>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              type="number"
              id="refBankAccountNo"
              name="refBankAccountNo"
              value={inputs.refBankAccountNo}
              onChange={(e: any) => {
                handleInput(e)
              }}
              disabled={edit}
              required
            />
            <label htmlFor="refBankAccountNo">Enter Account Number</label>
          </FloatLabel>
        </div>

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
              disabled={edit}
            />
            <label htmlFor="refBankAddress">Enter Bank Address</label>
          </FloatLabel>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refIFSCsCode"
              name="refIFSCsCode"
              value={inputs.refIFSCsCode}
              onChange={(e: any) => {
                handleInput(e)
              }}
              required
              disabled={edit}
            />
            <label htmlFor="refIFSCsCode">Enter Bank IFSC Code</label>
          </FloatLabel>
        </div>
      </div>
    </>
  )
}

export default BankInputsUpdate
