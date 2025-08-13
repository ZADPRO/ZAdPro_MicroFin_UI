import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import decrypt from '../Helper/Helper'

interface AddNewSupplierProps {
  closeSidebarNew: () => void
  supplierData?: {
    vendorId: number
    vendorName: string
    mobileNo: string
    emailId: string
    address: string
    vendorType: number
    description: string
    vendorBank: {
      refAccountNo: string
      refIFSCCode: string
      refBankName: string
      refUPICode: string
      refBankId: number
    }[]
  }
}

const vendorTypeOptions = [
  { label: 'Outside Vendor', value: 1 },
  { label: 'Bank', value: 2 },
  { label: 'Depositor ', value: 3 }
]

const AddNewSupplier: React.FC<AddNewSupplierProps> = ({ closeSidebarNew, supplierData }) => {
  const [accountDetails, setAccountDetails] = useState([
    { refAccountNo: '', refIFSCCode: '', refBankName: '', upiCode: '', refBankId: '' }
  ])
  const [loadingStatus, setLoadingStatus] = useState(true)

  const [vendorId, setVendorId] = useState<number | null>()
  const [name, setName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [vendorType, setVendorType] = useState<number | null>(null)
  const [description, setDescription] = useState('')

  const setFromData = async () => {
    if (supplierData) {
      setVendorId(supplierData.vendorId)
      setName(supplierData.vendorName || '')
      setContactNumber(supplierData.mobileNo || '')
      setEmail(supplierData.emailId || '')
      setAddress(supplierData.address || '')
      setDescription(supplierData.description || '')
      setVendorType(supplierData.vendorType || 1)

      setAccountDetails(
        supplierData.vendorBank && supplierData.vendorBank.length > 0
          ? supplierData.vendorBank.map((detail) => ({
              refAccountNo: detail.refAccountNo || '',
              refIFSCCode: detail.refIFSCCode || '',
              refBankName: detail.refBankName || '',
              upiCode: detail.refUPICode || '',
              refBankId: String(detail.refBankId) || ''
            }))
          : [{ refAccountNo: '', refIFSCCode: '', refBankName: '', upiCode: '', refBankId: '' }]
      )
    } else {
      setName('')
      setContactNumber('')
      setEmail('')
      setAddress('')
      setDescription('')
      setVendorType(1)
      setAccountDetails([
        { refAccountNo: '', refIFSCCode: '', refBankName: '', upiCode: '', refBankId: '' }
      ])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await setFromData()
      setLoadingStatus(false)
    }

    loadData()
  }, [supplierData])

  const handleAddBankField = () => {
    setAccountDetails([
      ...accountDetails,
      { refAccountNo: '', refIFSCCode: '', refBankName: '', upiCode: '', refBankId: '' }
    ])
  }

  const handleClearBankField = (index: number) => {
    const updated = [...accountDetails]
    updated.splice(index, 1)
    setAccountDetails(updated)
  }

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...accountDetails]
    updated[index][field as keyof (typeof updated)[number]] = value
    setAccountDetails(updated)
  }

  const handleSubmit = async () => {
    if (!name || !contactNumber || !email || !address || !vendorType) {
      toast.error('Please fill all required fields!')
      return
    }

    const hasEmptyBankField = accountDetails.some(
      (item) => !item.refAccountNo || !item.refIFSCCode || !item.refBankName || !item.upiCode
    )

    if (hasEmptyBankField) {
      toast.error('All bank details must be filled!')
      return
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminLoan/Vendor/add',
        {
          vendorName: name,
          mobileNo: contactNumber,
          emailId: email,
          vendorType: vendorType,
          address: address,
          description: description,
          vendorBank: accountDetails
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success) {
        toast.success('Supplier added successfully!')
        // closeSidebarNew()
      } else {
        toast.error('Failed to add supplier!')
      }
    } catch (error) {
      toast.error('Failed to add supplier!')
      console.error(error)
    }
  }

  const handleUpdate = async () => {
    if (!name || !contactNumber || !email || !address || !vendorType) {
      toast.error('Please fill all required fields!')
      return
    }

    const hasEmptyBankField = accountDetails.some(
      (item) => !item.refAccountNo || !item.refIFSCCode || !item.refBankName || !item.upiCode
    )

    if (hasEmptyBankField) {
      toast.error('All bank details must be filled!')
      return
    }

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/adminLoan/vendor/update',
        {
          refVendorId: vendorId,
          vendorName: name,
          mobileNo: contactNumber,
          emailId: email,
          vendorType: vendorType,
          address: address,
          description: description,
          vendorBank: accountDetails.map((detail) => ({
            refBankId: detail.refBankId || null,
            refBankName: detail.refBankName || '',
            refAccountNo: detail.refAccountNo || '',
            refIFSCCode: detail.refIFSCCode || '',
            refUPICode: detail.upiCode || ''
          }))
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      localStorage.setItem('token', 'Bearer ' + data.token)

      console.log('data line ----- 195', data)
      if (data.success) {
        toast.success('Supplier updated successfully!')

        setTimeout(() => {
          closeSidebarNew()
        }, 3000)
      } else {
        toast.error('Failed to update supplier!')
      }
    } catch (error) {
      toast.error('Failed to update supplier!')
      console.error(error)
    }
  }

  return (
    <div>
      {loadingStatus ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#f8d20f',
            height: '92vh',
            width: '100%'
          }}
        >
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ToastContainer />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1.5px solid grey',
              paddingBottom: '10px'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>
              Add New Supplier Details
            </div>
          </div>

          <div
            className="inputForm mt-3"
            style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '10px' }}
          >
            <label>Basic Details</label>
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <InputText
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <InputText
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <InputText
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <InputText
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <Dropdown
                  value={vendorType}
                  options={vendorTypeOptions}
                  onChange={(e) => setVendorType(e.value)}
                  placeholder="Select Vendor Type"
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <InputText
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <Divider />
            <div className="flex align-items-center justify-content-between">
              <label>Bank Details</label>
              <Button label="Add" onClick={handleAddBankField} />
            </div>

            {accountDetails.map((detail, index) => (
              <div className="accountDetails mt-3" key={index}>
                <Divider align="left">
                  <div className="inline-flex align-items-center">
                    <i className="pi pi-wallet mr-2 text-[#007bff]"></i>
                    <b className="text-[#007bff]">Bank {index + 1}</b>
                  </div>
                </Divider>
                <div className="flex gap-3 align-items-center mb-2">
                  <div className="flex-1">
                    <InputText
                      placeholder="A/C Number"
                      value={detail.refAccountNo}
                      onChange={(e) => handleInputChange(index, 'refAccountNo', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <InputText
                      placeholder="IFSC Code"
                      value={detail.refIFSCCode}
                      onChange={(e) => handleInputChange(index, 'refIFSCCode', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 align-items-center">
                  <div className="flex-1">
                    <InputText
                      placeholder="Bank Name"
                      value={detail.refBankName}
                      onChange={(e) => handleInputChange(index, 'refBankName', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <InputText
                      placeholder="UPI Code"
                      value={detail.upiCode}
                      onChange={(e) => handleInputChange(index, 'upiCode', e.target.value)}
                    />
                  </div>
                  {!vendorId && (
                    <Button
                      label="Clear"
                      severity="danger"
                      onClick={() => handleClearBankField(index)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {vendorId ? (
            <>
              <div className="flex justify-content-end mt-3" style={{ paddingTop: '10px' }}>
                <Button label="Update" severity="success" onClick={handleUpdate} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-content-end mt-3" style={{ paddingTop: '10px' }}>
                <Button label="Submit" severity="success" onClick={handleSubmit} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AddNewSupplier
