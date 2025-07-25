import axios from 'axios'
import { City, State } from 'country-state-city'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'

const AgentInputNew = ({ closeSidebarNew }) => {
  const status = [
    { name: 'Active', code: 'active' },
    { name: 'Inactive', code: 'inactive' }
  ]

  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])

  const [submitLoading, setSubmitLoading] = useState(false)

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
    state: '',
    district: '',
    pincode: null,
    profileImg: '',
    password: '12345678',

  })

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))

    if (name === 'state') {
      const districts: any = City.getCitiesOfState('IN', value) // Use 'value' instead of 'inputs.state'
      setDistricts(districts)
    }
  }

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          [field]: { name: file.name, data: file } // Store both name and base64 data
        }))
      }
    }
  }

  const handleNewUser = async () => {
    setSubmitLoading(true)

    const formData = new FormData()
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
      console.log(data)

      localStorage.setItem("token", "Bearer " + data.token);

      if (data.success) {
        console.log(data.filePaths.images.aadhar)

        axios
          .post(
            import.meta.env.VITE_API_URL + '/adminRoutes/addPerson',
            {
              BasicInfo: {
                user: {
                  refRollId: 2,
                  refPerFName: inputs.fname,
                  refPerLName: inputs.lname,
                  refDOB: inputs.dob,
                  refAadharNo: inputs.aadharno,
                  refPanNo: inputs.panno,
                  activeStatus: inputs.status,
                  ProfileImgPath: data.filePaths.images.profile,
                  refPanPath: data.filePaths.images.pan,
                  refAadharPath: data.filePaths.images.aadhar
                },
                Communtication: {
                  refPerMob: inputs.mobileno,
                  refPerEmail: inputs.email,
                  refPerAddress: inputs.address,
                  refPerDistrict: inputs.district,
                  refPerState: inputs.state,
                  refPerPincode: inputs.pincode
                }
              },
              DomainInfo: {
                refUserPassword: inputs.password
              }
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
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>Add New Agents</div>
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
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleInput(e); // Only update if it's a number and max 12 digits
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
                type='email'
                onChange={(e: any) => {
                  handleInput(e)
                }}
                value={inputs.email}
                required
              />
              <label htmlFor="email">E-Mail</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                id="aadharno"
                name="aadharno"

                onChange={(e: any) => {
                  const value = e.target.value;
                  if (/^\d{0,12}$/.test(value)) {
                    handleInput(e); // Only update if it's a number and max 12 digits
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
                onChange={(e: any) => {
                  let value = e.target.value.toUpperCase(); // Always uppercase
                  let valid = true;

                  // Enforce character-by-character format
                  for (let i = 0; i < value.length; i++) {
                    const char = value[i];

                    if (i < 5 && !/[A-Z]/.test(char)) {
                      valid = false; // First 5 should be A-Z
                      break;
                    } else if (i >= 5 && i < 9 && !/[0-9]/.test(char)) {
                      valid = false; // Next 4 should be 0-9
                      break;
                    } else if (i === 9 && !/[A-Z]/.test(char)) {
                      valid = false; // Last one should be A-Z
                      break;
                    }
                  }

                  if (valid && value.length <= 10) {
                    e.target.value = value;
                    handleInput(e);
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

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
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
              <label htmlFor="address">Address *</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <Dropdown
                name="state"
                style={{ width: '100%', minWidth: '100%', padding: '0' }}
                value={inputs.state}
                filter
                options={states}
                optionLabel="name" // Specifies the display text
                optionValue="isoCode" // Specifies the actual value
                onChange={(e) => handleInput(e)}
                required
              />
              <label>Select State *</label>
            </FloatLabel>
          </div>

          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
            <FloatLabel style={{ width: '100%' }}>
              <Dropdown
                className="dropDown"
                name="district"
                style={{ width: '100%', minWidth: '100%' }}
                value={inputs.district}
                filter
                options={districts}
                optionLabel="name" // Ensures dropdown displays district names
                optionValue="name" // Stores district name as the selected value
                onChange={(e) => handleInput(e)}
                required
              />
              <label>Select District *</label>
            </FloatLabel>
            <FloatLabel style={{ width: '100%' }}>
              <InputText
                type="text"
                name="pincode"
                style={{ width: '100%' }}
                id="pincode"
                value={inputs.pincode && null}
                onChange={(e: any) => {
                  const value = e.target.value;
                  if (/^\d{0,6}$/.test(value)) {
                    handleInput(e); // Only update if it's a number and max 12 digits
                  }
                }}
                required
              />
              <label htmlFor="pincode">Enter Pincode *</label>
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

export default AgentInputNew
