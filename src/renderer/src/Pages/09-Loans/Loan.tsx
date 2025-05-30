import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import Addnewloan from '@renderer/components/Addnewloan/Addnewloan'
import { Slide, toast, ToastContainer } from 'react-toastify'
import CreateNewLoan from '@renderer/components/CreateNewLoan/CreateNewLoan'

const Loan = () => {
  const [userLists, setUserLists] = useState([])

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [loanId, setLoanId] = useState<number>()

  const loadData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/adminRoutes/getAllLoan', {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        })
        .then((response: any) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )

          localStorage.setItem('token', 'Bearer ' + data.token)

          console.log(data)

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
            setUserLists(data.AllLoanData)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const AddressBody = (rowData: any) => {
    return (
      <>
        {rowData.refUserAddress}, {rowData.refUserDistrict}, {rowData.refUserState} -{' '}
        {rowData.refUserPincode}
      </>
    )
  }

  const CustomerId = (rowData: any) => {
    return (
      <>
        <div
          onClick={() => {
            setUpdateData(true)
            setUpdateUserId({ id: rowData.refUserId, custId: rowData.refCustId })
            setLoanId(rowData.refLoanId)
            console.log('rowData.refLoanId line -------- 76', rowData.refLoanId)
          }}
          style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {rowData.refCustLoanId}
        </div>
      </>
    )
  }

  const [updateData, setUpdateData] = useState(false)
  const [newLoan, setNewLoan] = useState(false)
  const [updateUserId, setUpdateUserId] = useState({
    id: '',
    custId: ''
  })

  const closeSidebarUpdate = () => {
    console.log(' -> Line Number ----------------- clossing side bar------------------ 94')
    setUpdateData(false)
    loadData()
    setNewLoan(false)
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

  const sendNotification = () => {
    axios
      .get(import.meta.env.VITE_API_URL + '/rePayment/Notification', {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      })
      .then((response: any) => {
        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )
        console.log('data line ------ 135', data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        if (data.success) {
          toast.success('Remainder Notification Send Successfully', {
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
        }
      })
  }

  const reLoadPage = () => {
    setUpdateData(false)
    loadData()
    setNewLoan(false)
  }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Loan'} reLoad={reLoadPage} />
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
        <div className="contentPage">
          <div
            style={{
              width: '100%',
              marginBottom: '10px'
            }}
            className="flex justify-between align-items-center"
          >
            <div className="w-[50%]">
              <button
                className="bg-[#007bff] py-2 px-5 hover:bg-[blue] text-white rounded-lg"
                onClick={(e) => {
                  e.preventDefault(), sendNotification()
                }}
              >
                Send Remainder
              </button>
            </div>

            <div className="flex w-[50%] align-items-center justify-around">
              <IconField style={{ width: '60%' }} iconPosition="left">
                <InputIcon className="pi pi-search"></InputIcon>
                <InputText
                  placeholder="Search Customers"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                  m-1
                  px-5
                  text-white
                  rounded-lg
                />
              </IconField>
              <div>
                <button
                  className="bg-[green] hover:bg-[#008000ec] px-7 text-[white] rounded-md py-2"
                  onClick={() => {
                    setNewLoan(true)
                  }}
                >
                  New Loan
                </button>
              </div>
            </div>
          </div>
          {/* Search Input - End */}

          {/* Datatable - Start */}

          <div>
            <DataTable
              filters={filters}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              value={userLists}
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
              <Column
                field="refCustLoanId"
                style={{ minWidth: '3rem' }}
                body={CustomerId}
                header="Loan ID"
              ></Column>
              <Column style={{ minWidth: '3rem' }} field="refCustId" header="User ID"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                header="Customer Name"
                field="refUserFname"
                body={(rowData) => {
                  return `${rowData.refUserFname} ${rowData.refUserLname}`
                }}
              ></Column>

              <Column
                style={{ minWidth: '8rem' }}
                field="refLoanStartDate"
                header="Loan Date"
              ></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refLoanAmount"
                header="Loan Amount"
              ></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refProductDuration"
                body={(rowData) => {
                  return (
                    <>
                      <p>
                        {rowData.refProductDuration}{' '}
                        {rowData.refProductDurationType === 1
                          ? 'Months'
                          : rowData.refProductDurationType === 2
                            ? 'Weeks'
                            : 'Days'}
                      </p>
                    </>
                  )
                }}
                header="Loan Duration"
              ></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refProductInterest"
                body={(rowData) => {
                  return (
                    <>
                      <p>{rowData.refProductInterest} %</p>
                    </>
                  )
                }}
                header="Loan Interest"
              ></Column>
              <Column
                style={{ minWidth: '8rem' }}
                filter
                field="refLoanStatus"
                header="Status"
              ></Column>
            </DataTable>
          </div>

          {/* Datatable - End */}

          {/* Update Side Bar - Start */}

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => closeSidebarUpdate()}
          >
            <Addnewloan
              custId={updateUserId.custId}
              id={updateUserId.id}
              loanNo={loanId}
              closeSidebarUpdate={closeSidebarUpdate}
            />
          </Sidebar>

          <Sidebar
            visible={newLoan}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => {
              closeSidebarUpdate()
            }}
          >
            <CreateNewLoan goToHistoryTab={closeSidebarUpdate} />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default Loan
