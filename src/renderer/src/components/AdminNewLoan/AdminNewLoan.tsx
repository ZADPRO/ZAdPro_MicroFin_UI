import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Sidebar } from 'primereact/sidebar'
import React, { useEffect, useState, useMemo } from 'react'
import AdminLoanDetails from '../AdminLoanDetails/AdminLoanDetails'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { FilterMatchMode } from 'primereact/api'
import AdminNewLoanCreation from '../AdminLoanCreation/AdminNewLoanCreation'
import { formatINRCurrency } from '@renderer/helper/amountFormat'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'

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
  refProductDurationType?: number
  refProductMonthlyCal?: number
}

interface propsInterface {
  reloadFlag: boolean
}

const AdminNewLoan: React.FC<propsInterface> = (reloadFlag) => {
  const [newData, setNewData] = useState(false)
  const [loanDetailsSidebar, setLoanDetailsSidebar] = useState(false)
  const [loanList, setLoanList] = useState<LoanData[]>([])
  const [filter, setFilter] = useState(1)
  const [userId, setUserId] = useState<number>()
  const [loanId, setLoanId] = useState<number>()
  const [loadingStatus, setLoadingStatus] = useState(true)
  console.log('AdminNewLoan.tsx / loadingStatus / 42 ------------------- > ', loadingStatus)

  console.log('AdminNewLoan.tsx / 44 ------------------- > ')

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

  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    refLoanStatus: { value: ['opened'], matchMode: FilterMatchMode.IN }
  })

  const statusOptions = Array.from(new Set(loanList.map((item) => item.refLoanStatus))).map(
    (status) => ({ label: status, value: status })
  )

  const nameBodyTemplate = (rowData: any) => (
    <span
      style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
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
          setLoadingStatus(false)
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
      {loadingStatus ? (
        <>
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
        </>
      ) : (
        <div>
          <div className="flex justify-content-between align-items-center">
            <div className="flex flex-1 justify-content-between items-center gap-3 mt-2">
              {/* Left side: Status Filter */}
              <MultiSelect
                value={filters.refLoanStatus.value}
                options={statusOptions}
                className="-column-filter md:h-[2.5rem] text-sm align-items-center flex-1" // smaller text, padding
                onChange={(e) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    refLoanStatus: { ...prev.refLoanStatus, value: e.value }
                  }))
                }
                placeholder="Filter by Status"
                display="chip"
              />

              {/* Right side: Global Search */}
              <span className="p-input-icon-left flex-2">
                <InputText
                  value={filters.global.value || ''}
                  className="w-[100%]"
                  onChange={(e) =>
                    setFilters((prev: any) => ({
                      ...prev,
                      global: { ...prev.global, value: e.target.value }
                    }))
                  }
                  placeholder="Search Vendor"
                />
              </span>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                label="Add New Loan"
                className="py-1 px-5 flex gap-x-2"
                onClick={() => setNewData(true)}
              />
            </div>
          </div>

          <DataTable
            value={loanList}
            filters={filters}
            onFilter={(e) => setFilters(e.filters)}
            globalFilterFields={['refVendorName', 'refVendorEmailId', 'refLoanStatus']}
            paginator
            rows={10}
            scrollHeight="380px"
            rowsPerPageOptions={[10, 25, 50]}
            size="small"
            stripedRows
            scrollable
            className="mt-3"
            showGridlines
            emptyMessage="No Records Found"
          >
            <Column header="S.No" body={(_, options) => options.rowIndex + 1} />

            <Column field="refVendorName" body={nameBodyTemplate} header="Vendor Name" />

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
              body={(rowData) => ` ${formatINRCurrency(Number(rowData.refLoanAmount))}`}
            />
            <Column
              field="refLoanDuration"
              header="Loan Duration"
              body={(rowData) =>
                `${rowData.refLoanDuration} ${rowData?.refProductDurationType === 1 ? 'Months' : rowData?.refProductDurationType === 2 ? 'Weeks' : 'Days'}`
              }
            />
            <Column
              field="refLoanInterest"
              header="Loan Interest"
              body={(rowData) => `${rowData.refLoanInterest} %`}
            />
            <Column field="refLoanStatus" header="Loan Status" />
          </DataTable>

          {/* Admin loan Creation Module */}

          <Sidebar
            visible={newData}
            style={{ width: '80vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            {/* <AdminLoanCreation closeSidebarNew={closeSidebarNew} /> */}
            <AdminNewLoanCreation closeSidebarNew={closeSidebarNew} />
          </Sidebar>

          {/* view Loan Details Module */}
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
      )}
    </div>
  )
}

export default AdminNewLoan
