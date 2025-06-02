import axios from 'axios'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'

const ProductInputsUpdate = ({ data, closeSidebarUpdate }) => {
  console.log('data', data)
  const [saveloading, setSaveloading] = useState(false)
  const [edit, setEdit] = useState(true)

  const [inputs, setInputs] = useState({
    refProductId: data.refProductId,
    refProductName: data.refProductName,
    refProductDuration: data.refProductDuration,
    refProductInterest: data.refProductInterest,
    refProductDescription: data.refProductDescription,
    refProductStatus: data.refProductStatus,
    refProductMonthlyCal: data.refProductMonthlyCal,
    refProductDurationType: data.refProductDurationType
  })

  const submitUpdate = async () => {
    setSaveloading(true)
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminRoutes/updateProduct',
        {
          refProductId: inputs.refProductId,
          refProductName: inputs.refProductName,
          refProductInterest: inputs.refProductInterest,
          refProductDuration: inputs.refProductDuration,
          refProductStatus: inputs.refProductStatus,
          refProductDescription: inputs.refProductDescription,
          refProductDurationType: inputs.refProductDurationType,
          refProductMonthlyCal: inputs.refProductMonthlyCal
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
    } catch (e) {
      console.log(e)
    }
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const status = [
    { name: 'Active', code: 'active' },
    { name: 'Inactive', code: 'inactive' }
  ]
  const durationType = [
    { name: 'Monthly', code: 1 },
    { name: 'Weekly', code: 2 },
    { name: 'Daily', code: 3 }
  ]

  const interestCalculationType = [
    { name: 'DayWise Monthly Calculation', code: 1 },
    { name: 'Monthly Calculation', code: 2 }
  ]

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
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8d20f' }}>
            Product Data
          </div>
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
                    width: '4rem ',
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
        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refProductName"
              name="refProductName"
              value={inputs.refProductName}
              onChange={handleInput}
              disabled={edit}
              required
            />
            <label htmlFor="refProductName">Enter Product Name</label>
          </FloatLabel>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refProductDuration"
              name="refProductDuration"
              value={inputs.refProductDuration}
              onChange={handleInput}
              disabled={edit}
              required
            />
            <label htmlFor="refProductDuration">Enter Product Duration (Months)</label>
          </FloatLabel>
        </div>

        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
          <FloatLabel style={{ width: '100%' }}>
            <Dropdown
              value={inputs.refProductDurationType}
              disabled={edit}
              onChange={(e: any) => {
                console.log('e', e)
                if (e.value === 1) {
                  setInputs({
                    ...inputs,
                    refProductDurationType: e.value,
                    refProductMonthlyCal: 1
                  })
                } else {
                  setInputs({
                    ...inputs,
                    refProductDurationType: e.value,
                    refProductMonthlyCal: 0
                  })
                }
              }}
              options={durationType}
              optionLabel="name"
              optionValue="code"
              placeholder="Select Duration"
              className="w-full"
              required
            />
            <label htmlFor="durationType">Select Duration Type</label>
          </FloatLabel>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refProductInterest"
              disabled={edit}
              name="refProductInterest"
              value={inputs.refProductInterest}
              onChange={(e: any) => {
                handleInput(e)
              }}
              required
            />
            <label htmlFor="refProductInterest">Enter Interest (%)</label>
          </FloatLabel>
        </div>

        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
          <FloatLabel style={{ width: '100%' }}>
            <InputText
              id="refProductDescription"
              name="refProductDescription"
              value={inputs.refProductDescription}
              onChange={handleInput}
              disabled={edit}
              required
            />
            <label htmlFor="refProductDescription">Enter Description</label>
          </FloatLabel>
        </div>

        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
          {inputs.refProductDurationType === 1 && (
            <FloatLabel style={{ width: '50%' }}>
              <Dropdown
                value={inputs.refProductMonthlyCal}
                options={interestCalculationType}
                optionLabel="name"
                optionValue="code"
                disabled={edit}
                onChange={(e: any) => {
                  setInputs({ ...inputs, refProductMonthlyCal: e.value })
                }}
                className="w-full"
                required
              />
              <label htmlFor="refProductStatus">Monthly Interest Calculation Type</label>
            </FloatLabel>
          )}
          <FloatLabel style={{ width: '50%' }}>
            <Dropdown
              id="refProductStatus"
              name="refProductStatus"
              style={{ width: '100%', minWidth: '100%' }}
              value={inputs.refProductStatus}
              options={status}
              optionLabel="name"
              optionValue="code"
              onChange={handleInput}
              disabled={edit}
            />
            <label htmlFor="refProductStatus">Active Status</label>
          </FloatLabel>
        </div>
      </div>
    </>
  )
}

export default ProductInputsUpdate
