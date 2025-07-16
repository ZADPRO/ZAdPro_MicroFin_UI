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

const AdminRepayments = () => {
  const [userLists, setUserLists] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [userListType, setUserListType] = useState({ name: 'Over All', code: 0 })
  const [startDate, setStartDate] = useState<Nullable<Date>>(null)
  const [endDate, setEndDate] = useState<Nullable<Date>>(null)
  const userType = [
    { name: 'Over All', code: 0 },
    { name: 'Month', code: 1 }
  ]

  function formatToDDMMYYYY(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  const loadData = () => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/AdminRePayment/userList',
          {
            ifMonth: userListType.code === 0 ? false : true,
            startDate: startDate ? formatToDDMMYYYY(startDate) : '',
            endDate: endDate ? formatToDDMMYYYY(endDate) : ''
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

          if (data.success) {
            setLoadingStatus(false)
            setUserLists(list)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

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
            setUpdateData(true)
            setUpdateUserId({
              id: rowData.refUserId,
              custId: rowData.refCustId,
              loanId: rowData.refLoanId,
              rePayId: rowData.refRpayId
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
    loanId: ''
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
              size="small"
              value={userLists}
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
            />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default AdminRepayments
