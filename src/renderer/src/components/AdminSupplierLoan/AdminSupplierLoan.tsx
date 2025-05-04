import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Sidebar } from 'primereact/sidebar'
import React, { useState } from 'react'
import AddNewSupplier from './AddNewSupplier'

const AdminSupplierLoan: React.FC = () => {
  const [newData, setNewData] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

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

  const closeSidebarNew = () => {
    setNewData(false)
    setSelectedSupplier(null)
  }

  const nameBodyTemplate = (rowData: any) => (
    <span
      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
      onClick={() => {
        setSelectedSupplier(rowData)
        setNewData(true)
      }}
    >
      {rowData.name}
    </span>
  )

  return (
    <div>
      <Button
        label="Add New Supplier"
        severity="warning"
        style={{ backgroundColor: '#f8d20f' }}
        onClick={() => {
          setSelectedSupplier(null)
          setNewData(true)
        }}
      />
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
        style={{ width: '60vw' }}
        position="right"
        onHide={closeSidebarNew}
      >
        <AddNewSupplier closeSidebarNew={closeSidebarNew} supplierData={selectedSupplier} />
      </Sidebar>
    </div>
  )
}

export default AdminSupplierLoan
