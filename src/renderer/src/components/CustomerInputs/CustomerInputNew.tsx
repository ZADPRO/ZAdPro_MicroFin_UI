import axios from 'axios'
import { City, State } from 'country-state-city'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'
import { Divider } from 'primereact/divider'
import { useNavigate } from 'react-router-dom'

// interface areaDetails {
//   areaName: string
//   areaPrifix: string
// }

interface option {
  label: string
  value: number
}

const CustomerInputNew = ({ closeSidebarNew }) => {
  const navigate = useNavigate()
  const status = [
    { name: 'Active', code: 'active' },
    { name: 'Inactive', code: 'inactive' }
  ]
  // const areaTypeOption: option[] = [
  //   { label: 'Add PinCode in Existing Area', value: 1 },
  //   { label: 'Add PinCode as New Area', value: 2 }
  // ]

  const [_states, setStates] = useState()
  const [_districts, setDistricts] = useState()
  // const [areaName, setAreaName] = useState<areaDetails | null>(null)
  // const [addArea, setAddArea] = useState<boolean | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [_showAddArea, setShowAddArea] = useState<boolean>(false)
  // const [areaTypeSelected, setAreaTypeSelected] = useState<number | null>()
  // const [areaList, setAreaList] = useState<option[]>([])
  const [mainAreaList, setMainAreaList] = useState<option[] | null>([])
  // const [selectedAreaId, setSelectedAreaId] = useState<number | null>()
  const [selectedArea, setSelectedArea] = useState<string | null>()
  const [filteredArea, setFilteredArea] = useState<option[]>([])
  useEffect(() => {
    const countryStates: any = State.getStatesOfCountry('IN')
    setStates(countryStates)
  }, [])

  const [inputs, setInputs]: any = useState({
    fname: '',
    lname: '',
    dob: null,
    status: 'active',
    mobileno: '',
    email: '',
    aadharno: '',
    panno: '',
    aadharImg: '',
    panImg: '',
    address: '',
    area: null,
    city: '',
    state: '',
    district: '',
    pincode: null,
    profileImg: '',
    password: '12345678',
    refRName: '',
    refRPhoneNumber: '',
    refRAddress: '',
    refAadharNumber: '',
    refPanNumber: ''
  })
  const [references, setReferences] = useState([
    { refRName: '', refRPhoneNumber: '', refRAddress: '', refAadharNumber: '', refPanNumber: '' }
  ])

  const handleReferenceInput = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const updatedReferences = [...references]
    updatedReferences[index][name] = value
    setReferences(updatedReferences)
  }

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))

    if (name === 'state') {
      const districts: any = City.getCitiesOfState('IN', value)
      setDistricts(districts)
    }
  }

  const Addnewreference = async () => {
    setReferences((prevReferences) => [
      ...prevReferences,
      {
        refRName: '',
        refRPhoneNumber: '',
        refRAddress: '',
        refAadharNumber: '',
        refPanNumber: ''
      }
    ])
  }

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          [field]: { name: file.name, data: file }
        }))
      }
    }
  }

  const handleNewUser = async () => {
    const formData = new FormData()
    setSubmitLoading(true)

    formData.append('profile', inputs.profileImg?.data || '')
    formData.append('pan', inputs.panImg?.data || '')
    formData.append('aadhar', inputs.aadharImg?.data || '')

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminRoutes/profileUpload',
        formData,
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      console.log('data profile api - 170 ', data)

      if (data.success) {
        axios
          .post(
            import.meta.env.VITE_API_URL + '/adminRoutes/addPerson',
            {
              BasicInfo: {
                user: {
                  refRollId: 3,
                  refPerFName: inputs.fname,
                  refPerLName: inputs.lname,
                  refDOB: inputs.dob,
                  refAadharNo: inputs.aadharno,
                  refPanNo: inputs.panno,
                  activeStatus: inputs.status,
                  ProfileImgPath: data.filePaths.images.profile
                    ? data.filePaths.images.profile
                    : '',
                  refPanPath: data.filePaths.images.pan ? data.filePaths.images.pan : '',
                  refAadharPath: data.filePaths.images.aadhar ? data.filePaths.images.aadhar : ''
                },
                Communtication: {
                  refPerMob: inputs.mobileno,
                  refPerEmail: inputs.email,
                  refPerAddress: inputs.address,
                  refPerDistrict: inputs.district,
                  refPerState: inputs.state,
                  refPerPincode: inputs.pincode,
                  refPerCity: selectedArea,
                  refPerAreaId: inputs.area,
                  refPerTaluk: inputs.city
                }
              },
              DomainInfo: {
                refUserPassword: inputs.password
              },
              reference: references
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
            console.log('data----------------------', data)

            if (data.success) {
              setSubmitLoading(false)

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
      }
    } catch (e: any) {
      console.log(e)
    }
  }

  const getAreaList = (data: string) => {
    console.log('data line ----- 277', data)
    if (data.length === 6) {
      console.log(' -> Line Number ----------------------------------- 279')
      axios
        .get(`https://api.postalpincode.in/pincode/${data}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response: any) => {
          const data = response.data[0].PostOffice
          console.log('data line ----- 288', data)
          if (data) {
            setInputs((prevState) => ({
              ...prevState,
              state: data[0].State,
              district: data[0].District,
              city: data[0].Block
            }))
            const options: any = data.map((item: any) => ({
              label: item.Name,
              value: item.Name
            }))
            setMainAreaList(options)
          }
        })
    } else {
      setMainAreaList(null)
    }
  }

  const getFilteredArea = (pincode: string | null, cityName: string | null) => {
    try {
      if (pincode && cityName) {
        axios
          .post(
            import.meta.env.VITE_API_URL + '/area/allAreaList',
            {
              pinCode: pincode,
              cityName: cityName
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
              const listArea = data.data.map((data: any) => {
                return {
                  label: `${data.refAreaPrefix} - ${data.refAreaName}`,
                  value: data.refAreaId
                }
              })
              setFilteredArea(listArea)
            }
          })
      }
    } catch (error) {
      console.log('error', error)
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
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>
          Add New Customers
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleNewUser()
        }}
      >
        <div style={{ margin: '5px 0px', height: '78vh', overflow: 'auto', padding: '10px' }}>
          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <label>Profile Image</label>
              <div className="mt-2">
                <label htmlFor="aadhar-upload" className="custom-file-upload">
                  {inputs.profileImg ? inputs.profileImg.name : 'Choose Image'}
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  id="aadhar-upload"
                  onChange={(e) => handleFile(e, 'profileImg')}
                />
              </div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="fname"
                name="fname"
                value={inputs.fname}
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="fname">Enter First Name *</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="lname"
                name="lname"
                value={inputs.lname}
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="lname">Enter Last Name *</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <Calendar
                dateFormat="dd/mm/yy"
                name="dob"
                style={{ width: '100%' }}
                value={inputs.dob ? new Date(inputs.dob) : null}
                id="dob"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="dob">Enter Date of Birth *</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <Dropdown
                name="status"
                style={{ width: '100%', minWidth: '100%' }}
                value={inputs.status}
                options={status}
                optionLabel="name"
                optionValue="code"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                required
              />
              <label htmlFor="lname">Active Status *</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="mobileno"
                name="mobileno"
                value={inputs.mobileno}
                onChange={(e: any) => {
                  const value = e.target.value
                  if (/^\d{0,10}$/.test(value)) {
                    handleInput(e) // Only update if it's a number and max 12 digits
                  }
                }}
                required
              />
              <label htmlFor="mobileno">Mobile Number *</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="email"
                name="email"
                type="email"
                onChange={(e: any) => {
                  handleInput(e)
                }}
                value={inputs.email}
                required
              />
              <label htmlFor="email">E-Mail *</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="aadharno"
                name="aadharno"
                keyfilter="pint" // PrimeReact built-in to allow only positive integers
                maxLength={12}
                onChange={(e: any) => {
                  const value = e.target.value
                  if (/^\d{0,12}$/.test(value)) {
                    handleInput(e) // Only update if it's a number and max 12 digits
                  }
                }}
                value={inputs.aadharno}
                required
              />
              <label htmlFor="aadharno">Aadhar Number *</label>
            </FloatLabel>

            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="panno"
                name="panno"
                value={inputs.panno}
                maxLength={10}
                onChange={(e: any) => {
                  let value = e.target.value.toUpperCase() // Always uppercase
                  let valid = true

                  // Enforce character-by-character format
                  for (let i = 0; i < value.length; i++) {
                    const char = value[i]

                    if (i < 5 && !/[A-Z]/.test(char)) {
                      valid = false // First 5 should be A-Z
                      break
                    } else if (i >= 5 && i < 9 && !/[0-9]/.test(char)) {
                      valid = false // Next 4 should be 0-9
                      break
                    } else if (i === 9 && !/[A-Z]/.test(char)) {
                      valid = false // Last one should be A-Z
                      break
                    }
                  }

                  if (valid && value.length <= 10) {
                    e.target.value = value
                    handleInput(e)
                  }
                }}
                required
              />
              <label htmlFor="panno">Pan Number *</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <div style={{ width: '100%' }}>
              <label>Aadhar Image</label>
              <div className="mt-2">
                <label htmlFor="aadharImg" className="custom-file-upload">
                  {inputs.aadharImg ? inputs.aadharImg.name : 'Choose Image'}
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  id="aadharImg"
                  onChange={(e) => handleFile(e, 'aadharImg')}
                />
              </div>
            </div>
            <div style={{ width: '100%' }}>
              <label>Pan Image</label>
              <div className="mt-2">
                <label htmlFor="panImg" className="custom-file-upload">
                  {inputs.panImg ? inputs.panImg.name : 'Choose Image'}
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  id="panImg"
                  onChange={(e) => handleFile(e, 'panImg')}
                />
              </div>
            </div>
          </div>
          <Divider />

          <div className="my-2">
            <b>Enter Address Details</b>
            <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
              <FloatLabel style={{ width: '100%' }}>
                <InputText
                  type="text" // Use text instead of number to allow maxlength to work
                  name="pincode"
                  maxLength={6}
                  style={{ width: '100%' }}
                  id="pincode"
                  value={inputs.pincode || ''} // Corrected this
                  onChange={(e) => {
                    const value = e.target.value

                    if (/^\d{0,6}$/.test(value)) {
                      handleInput(e) // Only update if it's 0-6 digits
                      if (value.length === 6) {
                        // validatePincode(value)
                        getAreaList(value)
                        getFilteredArea(value, selectedArea ?? null)
                        setShowAddArea(true)
                      } else {
                        setShowAddArea(false)
                      }
                    }
                  }}
                  required
                />

                <label htmlFor="pincode">Enter Pincode *</label>
              </FloatLabel>
              <FloatLabel style={{ width: '100%' }}>
                <InputText
                  id="address"
                  name="address"
                  value={
                    inputs.state && inputs.district
                      ? `${inputs.state} - ${inputs.district} ${inputs.city === inputs.district ? '' : `- ${inputs.city}`}`
                      : ''
                  }
                  // onChange={(e: any) => {
                  //   handleInput(e)
                  // }}
                  readOnly
                  required
                />
                <label htmlFor="address">State - District - Taluk*</label>
              </FloatLabel>
            </div>

            <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
              <FloatLabel style={{ width: '100%' }}>
                <Dropdown
                  value={selectedArea}
                  onChange={(e: DropdownChangeEvent) => {
                    getFilteredArea(inputs.pincode ?? null, e.value)

                    setSelectedArea(e.value)
                  }}
                  options={mainAreaList ?? []}
                  optionLabel="label"
                  optionValue="value"
                  className="w-full"
                  required
                />
                <label>Select Postoffice *</label>
              </FloatLabel>
              <FloatLabel style={{ width: '100%' }}>
                <InputText
                  id="address"
                  name="address"
                  value={inputs.address}
                  onChange={(e: any) => {
                    handleInput(e)
                  }}
                  required
                />
                <label htmlFor="address">Enter Door No & Area *</label>
              </FloatLabel>
            </div>
            <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
              <div className="w-full flex justify-between gap-x-3">
                <div className="w-[70%]">
                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      value={inputs.area}
                      onChange={(e: any) => {
                        handleInput(e)
                      }}
                      options={filteredArea ?? []}
                      optionLabel="label"
                      optionValue="value"
                      className="w-full"
                      required
                      name="area"
                      id="area"
                    />
                    <label>Select Area *</label>
                  </FloatLabel>
                </div>
                <div className="w-[30%]">
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/customize', { state: { enable: 'Area' } })
                    }}
                  >
                    Create Area
                  </Button>
                </div>
              </div>

              <FloatLabel style={{ width: '100%' }}></FloatLabel>
            </div>
          </div>

          <Divider />
          <div className="">
            <Button
              type="button"
              label="Add New Reference"
              className="my-2"
              onClick={Addnewreference}
              raised
            />

            {references.map((reference, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              >
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      name="refRName"
                      value={reference.refRName}
                      onChange={(e) => handleReferenceInput(index, e)}
                      required
                    />
                    <label>Enter Name *</label>
                  </FloatLabel>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      name="refRPhoneNumber"
                      value={reference.refRPhoneNumber}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d{0,10}$/.test(value)) {
                          handleReferenceInput(index, e)
                        }
                      }}
                      required
                    />
                    <label>Enter Phone Number</label>
                  </FloatLabel>
                </div>

                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      name="refRAddress"
                      value={reference.refRAddress}
                      onChange={(e) => handleReferenceInput(index, e)}
                      required
                    />
                    <label>Enter Address *</label>
                  </FloatLabel>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      name="refAadharNumber"
                      value={reference.refAadharNumber}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d{0,12}$/.test(value)) {
                          handleReferenceInput(index, e)
                        }
                      }}
                      required
                    />
                    <label>Enter Aadhar Number *</label>
                  </FloatLabel>
                </div>

                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '49%' }}>
                    <InputText
                      name="refPanNumber"
                      value={reference.refPanNumber}
                      onChange={(e) => {
                        let value = e.target.value.toUpperCase() // Always uppercase
                        let valid = true

                        // Enforce character-by-character format
                        for (let i = 0; i < value.length; i++) {
                          const char = value[i]

                          if (i < 5 && !/[A-Z]/.test(char)) {
                            valid = false // First 5 should be A-Z
                            break
                          } else if (i >= 5 && i < 9 && !/[0-9]/.test(char)) {
                            valid = false // Next 4 should be 0-9
                            break
                          } else if (i === 9 && !/[A-Z]/.test(char)) {
                            valid = false // Last one should be A-Z
                            break
                          }
                        }

                        if (valid && value.length <= 10) {
                          e.target.value = value
                          handleReferenceInput(index, e)
                        }
                      }}
                      required
                    />
                    <label>Enter PAN Number *</label>
                  </FloatLabel>
                </div>

                {index > 0 && (
                  <Button
                    label="Remove Reference"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    style={{ marginTop: '35px' }}
                    onClick={() => {
                      setReferences(references.filter((_, i) => i !== index))
                    }}
                  />
                )}
              </div>
            ))}

            {submitLoading ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '35px'
                }}
              >
                <Button style={{ width: '20%' }} type="submit" icon="pi pi-check pi-spinner" />
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
        </div>
      </form>
    </>
  )
}

export default CustomerInputNew
