import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
import AdminLoanRepaymentSideTab from '../../components/AdminLoanRepaymentSideTab/RepaymentSideTab'
interface propsInterface {
  reloadFlag: boolean
}

const AdminRepayments: React.FC<propsInterface> = (reloadFlag) => {
  const [userLists, setUserLists] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [userListType, setUserListType] = useState({ name: 'Over All', code: 0 })
  const [startDate, setStartDate] = useState<Nullable<Date>>(null)
  const [endDate, setEndDate] = useState<Nullable<Date>>(null)
  const [selectedMonth, setSelectedMonth] = useState<Nullable<Date>>(new Date())

  const userType = [
    { name: 'Over All', code: 0 },
    // { name: 'Month', code: 1 },
    { name: 'Month', code: 2 }
  ]

  // function formatToDDMMYYYY(dateString) {
  //   const date = new Date(dateString)
  //   const day = String(date.getDate()).padStart(2, '0')
  //   const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  //   const year = date.getFullYear()

  //   return `${day}-${month}-${year}`
  // }

  const loadData = () => {
    let passDate = ''

    if (selectedMonth instanceof Date && !isNaN(selectedMonth.getTime())) {
      const year = selectedMonth.getFullYear()
      const month = String(selectedMonth.getMonth() + 1).padStart(2, '0')
      const day = '01' // Default to first day of month if you're using this as a month picker

      passDate = `${day}-${month}-${year}` // Format: DD-MM-YYYY
    }
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminRePayment/dueList',
          {
            ifMonth: userListType.code === 0 ? false : true,
            month: passDate
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

          console.log('data line ---- 70', data)
          const list = data.data
          const nonCalDue = data.nonCalDue

          if (data.success) {
            setLoadingStatus(false)
            let dueList = list.map((data) => ({
              refUserFname: data.refVendorName,
              refVendorName: data.refVendorName,
              refUserMobileNo: data.refVendorMobileNo,
              refUserAddress: data.refAddress,
              refPaymentDate: data.refPaymentDate,
              refLoanAmount: data.refLoanAmount,
              refProductDuration: data.refProductDuration,
              refProductInterest: data.refProductInterest,
              refProductName: data.refIfCalculation ? 'System Calculation' : 'Manual Calculation',
              refIfCalculation: data.refIfCalculation,
              refLoanId: data.refLoanId
            }))

            console.log('dueList line ----- 93', dueList)

            const temp = nonCalDue.map((data) => ({
              refUserFname: data.refVendorName,
              refVendorName: data.refVendorName,
              refUserMobileNo: data.refVendorMobileNo,
              refUserAddress: data.refAddress,
              refPaymentDate: data.refPaymentDate ?? new Date().toISOString().split('T')[0],
              refLoanAmount: data.refLoanAmount,
              refProductDuration: data.refProductDuration,
              refProductInterest: data.refProductInterest,
              refProductName: data.refIfCalculation ? 'System Calculation' : 'Manual Calculation',
              refIfCalculation: data.refIfCalculation,
              refLoanId: data.refLoanId
            }))

            console.log('temp line ------ 107', temp)

            // Merge arrays
            dueList = [...dueList, ...temp]

            console.log('dueList line ------ 109', dueList)

            setUserLists(dueList)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [startDate, endDate, selectedMonth, reloadFlag])

  const ProductBody = (rowData: any) => {
    return (
      <>
        <p>
          <b>{rowData.refProductName}</b>
        </p>
        <p>
          ( {rowData.refProductDuration} Month - {rowData.refProductInterest}% )
        </p>
      </>
    )
  }

  const CustomerId = (rowData: any) => {
    return (
      <>
        <div
          onClick={() => {
            console.log('rowData', rowData)
            setUpdateData(true)
            setUpdateUserId({
              id: rowData.refUserId,
              custId: rowData.refCustId,
              loanId: rowData.refLoanId,
              rePayId: rowData.refRpayId,
              loanCalculation: rowData.refIfCalculation
            })
          }}
          style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {rowData.refVendorName}
        </div>
      </>
    )
  }

  const [updateData, setUpdateData] = useState(false)
  const [updateUserId, setUpdateUserId] = useState({
    id: '',
    custId: '',
    rePayId: '',
    loanId: '',
    loanCalculation: false
  })

  const closeSidebarUpdate = () => {
    setUpdateData(false)
    loadData()
  }

  //   Filter Data - Start

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  //Filter Data - End

  return (
    <>
      <ToastContainer />
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
        <div className=" w-full h-[75vh]">
          <div className="flex flex-row align-items-center justify-end w-full">
            <div className="w-[50%] flex flex-row gap-x-10">
              <Dropdown
                value={userListType}
                onChange={(e) => {
                  if (e.value.code === 1) {
                    setStartDate(new Date())
                    setEndDate(new Date())
                  } else {
                    setEndDate(null)
                    setStartDate(null)
                  }
                  setUserListType(e.value)
                }}
                options={userType}
                optionLabel="name"
                placeholder="Select Filter"
                className="w-full md:w-14rem"
              />
              {userListType.code === 1 && (
                <>
                  <Calendar
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.value)
                      if (endDate && e.value && endDate < e.value) {
                        setEndDate(e.value)
                      }
                    }}
                    dateFormat="dd-mm-yy"
                  />
                  <Calendar
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.value)
                    }}
                    dateFormat="dd-mm-yy"
                    minDate={startDate || undefined}
                    disabled={!startDate}
                  />
                </>
              )}
              {userListType.code === 2 && (
                <>
                  <Calendar
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.value)
                    }}
                    view="month" // 👈 Enables month view instead of date
                    dateFormat="mm/yy" // 👈 Controls how the value is displayed
                    monthNavigator // (optional) enables month dropdown
                    placeholder="Select Month"
                  />
                </>
              )}
            </div>
            <div className="w-[50%] flex justify-end">
              <IconField style={{ width: '50%' }} iconPosition="left">
                <InputIcon className="pi pi-search"></InputIcon>
                <InputText
                  placeholder="Search Customers"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                />
              </IconField>
            </div>
          </div>

          <div>
            <DataTable
              filters={filters}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              size="small"
              className="my-3"
              value={userLists}
              scrollHeight="400px"
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
              <Column
                style={{ minWidth: '8rem' }}
                field="refUserFname"
                body={CustomerId}
                header="Name"
              ></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refUserMobileNo"
                header="Phone Number"
              ></Column>
              <Column
                style={{ minWidth: '10rem' }}
                field="refUserAddress"
                header="Address"
              ></Column>
              <Column style={{ minWidth: '8rem' }} field="refPaymentDate" header="Month"></Column>

              <Column style={{ minWidth: '10rem' }} body={ProductBody} header="Product"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refLoanAmount"
                body={(rowData) => `₹ ${rowData.refLoanAmount}`}
                header="Principal Amount"
              ></Column>
            </DataTable>
          </div>

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <AdminLoanRepaymentSideTab
              custId={updateUserId.custId}
              id={updateUserId.id}
              closeSidebarUpdate={closeSidebarUpdate}
              loanId={updateUserId.loanId}
              rePayId={updateUserId.rePayId}
              loanCalculation={updateUserId.loanCalculation}
            />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default AdminRepayments
