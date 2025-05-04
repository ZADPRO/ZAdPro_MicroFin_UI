import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Sidebar } from 'primereact/sidebar'
import React, { useState } from 'react'
import AdminLoanCreation from './AdminLoanCreation'

const AdminNewLoan: React.FC = () => {
  const [newData, setNewData] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  const [filter, setFilter] = useState('all')

  const filterOption = [
    { label: 'All Loan', value: 'all' },
    { label: 'Loan Opened', value: 'opened' },
    { label: 'Loan Closed', value: 'closed' },
    { label: 'Loan Extended', value: 'extended' },
    { label: 'Loan Top Up', value: 'topup' }
  ]

  const sampleData = [
    {
      sno: 1,
      name: 'ABC Traders',
      contactNumber: '9876543210',
      openLoans: '3',
      closedLoans: '0',
      notes: 'Payment pending for 2 months',
      bankDetails: [
        { acNumber: '1234567890', ifsc: 'ABC0001234' },
        { acNumber: '2345678901', ifsc: 'XYZ0005678' },
        { acNumber: '3456789012', ifsc: 'LMN0009999' }
      ]
    },
    {
      sno: 2,
      name: 'XYZ Supplies',
      contactNumber: '8765432109',
      openLoans: '5',
      closedLoans: '2',
      notes: 'Partial payment received',
      bankDetails: [{ acNumber: '1111222233', ifsc: 'XYZ0001122' }]
    },
    {
      sno: 3,
      name: 'LMN Distributors',
      contactNumber: '7654321098',
      openLoans: '10',
      closedLoans: '5',
      notes: 'Cleared last month',
      bankDetails: []
    }
  ]

  const nameBodyTemplate = (rowData: any) => (
    <span
      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
      onClick={() => {
        setNewData(true)
      }}
    >
      {rowData.name}
    </span>
  )

  const closeSidebarNew = () => {
    setNewData(false)
    setSelectedSupplier(null)
  }

  return (
    <div>
      <div className="flex justify-content-between">
        <Dropdown
          id="statusChoose"
          value={filter}
          options={filterOption}
          optionLabel="label"
          optionValue="value"
          onChange={(e) => {
            setFilter(e.value)
          }}
          required
        />{' '}
        <Button label="Add New Loan" onClick={() => setNewData(true)} />
      </div>
      <DataTable
        value={sampleData}
        className="mt-4"
        showGridlines
        stripedRows
        scrollable
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
      >
        <Column field="sno" header="S.No" />
        <Column field="name" header="Name" body={nameBodyTemplate} />
        <Column field="openLoans" header="Open Loans" />
        <Column field="closedLoans" header="Closed Loans" />
        <Column field="notes" header="Notes" />
      </DataTable>

      <Sidebar
        visible={newData}
        style={{ width: '80vw' }}
        position="right"
        onHide={closeSidebarNew}
      >
        <AdminLoanCreation closeSidebarNew={closeSidebarNew} />
      </Sidebar>
    </div>
  )
}

export default AdminNewLoan
