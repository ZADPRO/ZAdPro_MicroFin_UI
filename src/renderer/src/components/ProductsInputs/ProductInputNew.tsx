import axios from 'axios'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'
import { InputTextarea } from 'primereact/inputtextarea'

const ProductInputNew = ({ closeSidebarNew }) => {
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

  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedDurationType, setSelectedDurationType] = useState({ name: 'Monthly', code: 1 })
  const [selectedInterestCal, setSelectedInterestCal] = useState<number>(1)

  const [inputs, setInputs]: any = useState({
    refProductName: '',
    refProductInterest: '',
    refProductDuration: '',
    refProductStatus: 'active',
    refProductDescription: ''
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
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminRoutes/addProduct',
        {
          refProductName: inputs.refProductName,
          refProductInterest: inputs.refProductInterest,
          refProductDuration: inputs.refProductDuration,
          refProductStatus: inputs.refProductStatus,
          refProductDescription: inputs.refProductDescription,
          refProductDurationType: selectedDurationType.code,
          refProductMonthlyCal: selectedInterestCal
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
        setSubmitLoading(false)
        closeSidebarNew()
      }
    } catch (e: any) {
      console.log(e)
    }
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
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>Add New Product</div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleNewUser()
        }}
      >
        <div style={{ margin: '5px 0px', height: '78vh', overflow: 'auto', padding: '10px' }}>
          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="refProductName"
                name="refProductName"
                value={inputs.refProductName}
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="refProductName">Enter Product Name</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="refProductDuration"
                name="refProductDuration"
                value={inputs.refProductDuration}
                type="number"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="refProductDuration">Enter Product Duration</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <Dropdown
                inputId="durationType"
                value={selectedDurationType}
                onChange={(e) => {
                  setSelectedDurationType(e.value)
                  if (e.value.code === 1) {
                    setSelectedInterestCal(1)
                  } else {
                    setSelectedInterestCal(0)
                  }
                }}
                options={durationType}
                optionLabel="name"
                placeholder="Select Duration"
                className="w-full"
                required
              />
              <label htmlFor="durationType">Select Duration Type</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="refProductInterest"
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
              <InputTextarea
                value={inputs.refProductDescription}
                name="refProductDescription"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />

              <label htmlFor="refProductDescription">Enter Description</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            {selectedDurationType.code === 1 && (
              <FloatLabel style={{ width: '50%' }}>
                <Dropdown
                  value={selectedInterestCal}
                  options={interestCalculationType}
                  optionLabel="name"
                  optionValue="code"
                  onChange={(e: any) => {
                    console.log('e', e)
                    setSelectedInterestCal(e.value)
                  }}
                  className="w-full"
                  required
                />
                <label htmlFor="refProductStatus">Monthly Interest Calculation Type</label>
              </FloatLabel>
            )}

            <FloatLabel style={{ width: '50%' }}>
              <Dropdown
                name="refProductStatus"
                value={inputs.refProductStatus}
                options={status}
                optionLabel="name"
                optionValue="code"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                className="w-full"
                required
              />
              <label htmlFor="refProductStatus">Active Status</label>
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
              <Button style={{ width: '20%' }} type="submit" label="Submit" />
            </div>
          )}
        </div>
      </form>
    </>
  )
}

export default ProductInputNew
