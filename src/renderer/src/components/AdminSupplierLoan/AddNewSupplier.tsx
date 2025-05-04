import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface AddNewSupplierProps {
  closeSidebarNew: () => void
  supplierData?: {
    name: string
    contactNumber: string
    notes: string
    bankDetails: { acNumber: string; ifsc: string }[]
  }
}

const AddNewSupplier: React.FC<AddNewSupplierProps> = ({ closeSidebarNew, supplierData }) => {
  const [accountDetails, setAccountDetails] = useState([{ acNumber: '', ifsc: '' }])
  const [name, setName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (supplierData) {
      setName(supplierData.name)
      setContactNumber(supplierData.contactNumber)
      setNotes(supplierData.notes)
      setAccountDetails(
        supplierData.bankDetails.length > 0
          ? supplierData.bankDetails
          : [{ acNumber: '', ifsc: '' }]
      )
    } else {
      setName('')
      setContactNumber('')
      setNotes('')
      setAccountDetails([{ acNumber: '', ifsc: '' }])
    }
  }, [supplierData])

  const handleAddBankField = () => {
    setAccountDetails([...accountDetails, { acNumber: '', ifsc: '' }])
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

  const handleSubmit = () => {
    if (!name || !contactNumber) {
      toast.error('Name and Contact Number are required!')
      return
    }

    const hasEmptyBankField = accountDetails.some((item) => !item.acNumber || !item.ifsc)
    if (hasEmptyBankField) {
      toast.error('All bank details must be filled!')
      return
    }

    const data = {
      name,
      contactNumber,
      notes,
      bankDetails: accountDetails
    }

    console.log('Submitted Data:', data)
    toast.success('Supplier added successfully!')
  }

  return (
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
            <InputText placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <div className="flex gap-3 align-items-center">
              <div className="flex-1">
                <InputText
                  placeholder="A/C Number"
                  value={detail.acNumber}
                  onChange={(e) => handleInputChange(index, 'acNumber', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <InputText
                  placeholder="IFSC Code"
                  value={detail.ifsc}
                  onChange={(e) => handleInputChange(index, 'ifsc', e.target.value)}
                />
              </div>
              <Button label="Clear" severity="danger" onClick={() => handleClearBankField(index)} />
            </div>
          </div>
        ))}

        <Divider />
      </div>

      <div className="flex justify-content-end mt-3" style={{ paddingTop: '10px' }}>
        <Button label="Submit" severity="success" onClick={handleSubmit} />
      </div>
    </div>
  )
}

export default AddNewSupplier
