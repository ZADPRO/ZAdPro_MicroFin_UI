import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Sidebar } from 'primereact/sidebar'
import React, { useEffect, useState, useMemo } from 'react'
import AdminLoanCreation from './AdminLoanCreation'
import AdminLoanDetails from '../AdminLoanDetails/AdminLoanDetails'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { FilterMatchMode } from 'primereact/api'

interface LoanData {
  refLoanId: number
  refVendorId: number
  refVendorName: string
  refVendorMobileNo: string
  refVendorEmailId: string
  refDescription?: string
  refLoanAmount: string // If you plan to use this for calculations, consider changing to number
  refLoanDuration?: number
  refLoanInterest?: number
  refLoanStartDate?: string // Format: 'YYYY-MM-DD'
  refLoanStatus?: string
  refVenderType?: number
  refLoanStatusId?: number
}

interface propsInterface {
  reloadFlag: boolean
}

const AdminNewLoan: React.FC<propsInterface> = (reloadFlag) => {
  const [newData, setNewData] = useState(false)
  const [loanDetailsSidebar, setLoanDetailsSidebar] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [loanList, setLoanList] = useState<LoanData[]>([])
  const [filter, setFilter] = useState(0)
  const [userId, setUserId] = useState<number>()
  const [loanId, setLoanId] = useState<number>()

  const filterOption = [
    { label: 'All Loan', value: 0 },
    { label: 'Loan Opened', value: 1 },
    { label: 'Loan Closed', value: 2 },
    { label: 'Loan Extended', value: 4 },
    { label: 'Loan Top Up', value: 3 }
  ]

  const filteredLoanList = useMemo(() => {
    if (filter === 0) return loanList
    return loanList.filter((item) => item.refLoanStatusId === filter)
  }, [loanList, filter])

  const exportToCSV = () => {
    const headers = [
      'S.No',
      'Loan ID',
      'Vendor ID',
      'Vendor Name',
      'Vendor Mobile No',
      'Vendor Email ID',
      'Description',
      'Loan Amount',
      'Loan Duration',
      'Loan Interest',
      'Loan Start Date',
      'Loan Status',
      'Loan Status ID',
      'Vendor Type'
    ]

    const rows = filteredLoanList.map((item, index) => [
      index + 1,
      item.refLoanId,
      item.refVendorId,
      item.refVendorName,
      item.refVendorMobileNo,
      item.refVendorEmailId,
      item.refDescription || '',
      item.refLoanAmount,
      item.refLoanDuration !== undefined ? `${item.refLoanDuration} Month` : '',
      item.refLoanInterest !== undefined ? `${item.refLoanInterest}%` : '',
      item.refLoanStartDate || '',
      item.refLoanStatus || '',
      item.refLoanStatusId ?? '',
      item.refVenderType === 1 ? 'Outside Vendor' : item.refVenderType === 2 ? 'Bank' : 'Depositor'
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${new Date()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const vendorOptions = Array.from(new Set(loanList.map((item) => item.refVendorName))).map(
    (name) => ({ label: name, value: name })
  )

  const [filters, setFilters] = useState<any>({
    refVendorName: {
      value: null,
      matchMode: FilterMatchMode.EQUALS // Set EQUALS by default
    }
  })

  const onFilterChange = (e: any) => {
    const value = e.value
    setFilters((prev) => ({
      ...prev,
      refVendorName: {
        ...prev.refVendorName,
        value
      }
    }))
  }

  const nameBodyTemplate = (rowData: any) => (
    <span
      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
      onClick={() => {
        console.log('rowData line ----- 135', rowData)
        setLoanId(rowData.refLoanId)
        setUserId(rowData.refVendorId)
        setLoanDetailsSidebar(true)
      }}
    >
      {rowData.refVendorName}
    </span>
  )

  const closeSidebarNew = () => {
    setNewData(false)
    setLoanDetailsSidebar(false)
    setSelectedSupplier(null)
    getLoanList()
  }

  const getLoanList = () => {
    axios
      .get(import.meta.env.VITE_API_URL + '/adminLoan/allLoan', {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log('Data line ---------------- 65', data)
          setLoanList(data.data)
        }
      })
  }

  useEffect(() => {
    getLoanList()
  }, [reloadFlag])
  return (
    <div>
      <div className="flex justify-content-between">
        <div className="w-[30%] flex justify-between">
          <Dropdown
            id="statusChoose"
            value={filter}
            options={filterOption}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setFilter(e.value)}
            required
          />{' '}
          <Button label="Export CSV" className="" onClick={exportToCSV} />
        </div>
        <div>
          <Button label="Add New Loan" onClick={() => setNewData(true)} />
        </div>
      </div>

      <DataTable
        value={filteredLoanList}
        filters={filters}
        onFilter={(e) => setFilters(e.filters)}
        className="mt-4"
        showGridlines
        stripedRows
        scrollable
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
      >
        <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
        <Column
          field="refVendorName"
          header="Vendor Name"
          filter
          filterField="refVendorName"
          filterElement={
            <Dropdown
              value={filters.refVendorName.value}
              options={vendorOptions}
              onChange={onFilterChange}
              placeholder="Select Vendor"
              showClear
              style={{ width: '100%' }}
            />
          }
          body={nameBodyTemplate}
        />

        <Column
          field="refVenderType"
          header="Vendor Type"
          body={(rowData) =>
            rowData.refVenderType === 1
              ? 'Outside Vendor'
              : rowData.refVenderType === 2
                ? 'Bank'
                : 'Depositor'
          }
        />
        <Column field="refLoanStartDate" header="Date" />
        <Column
          field="refLoanAmount"
          header="Loan Amount"
          body={(rowData) => `₹ ${rowData.refLoanAmount}`}
        />
        <Column
          field="refLoanDuration"
          header="Loan Duration"
          body={(rowData) => `${rowData.refLoanDuration} Month`}
        />
        <Column
          field="refLoanInterest"
          header="Loan Interest"
          body={(rowData) => `${rowData.refLoanInterest} %`}
        />
        <Column field="refLoanStatus" header="Loan Status" />
      </DataTable>

      <Sidebar
        visible={newData}
        style={{ width: '80vw' }}
        position="right"
        onHide={closeSidebarNew}
      >
        <AdminLoanCreation closeSidebarNew={closeSidebarNew} />
      </Sidebar>
      <Sidebar
        visible={loanDetailsSidebar}
        style={{ width: '80vw' }}
        position="right"
        onHide={closeSidebarNew}
      >
        <AdminLoanDetails
          closeSidebarNew={closeSidebarNew}
          userId={userId ?? 0}
          loanId={loanId ?? 0}
        />
      </Sidebar>
    </div>
  )
}

export default AdminNewLoan
