import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { useRef } from 'react'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
// import Addnewloan from '@renderer/components/Addnewloan/Addnewloan'
import RepaymentSideTab from '@renderer/components/Repayment/RepaymentSideTab'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
import { OverlayPanel } from 'primereact/overlaypanel'
// import type { OverlayPanel as OverlayPanelType } from 'primereact/overlaypanel'
import { Divider } from 'primereact/divider'
import { formatINRCurrency } from '@renderer/helper/amountFormat'
import { Button } from 'primereact/button'
import { TbDeviceMobileMessage } from 'react-icons/tb'
const Repayments = () => {
  const [userLists, setUserLists] = useState([])

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [userListType, setUserListType] = useState({ name: 'Over All', code: 0 })
  const [startDate, setStartDate] = useState<Nullable<Date>>(null)
  const [endDate, setEndDate] = useState<Nullable<Date>>(null)
  const [selectedMonth, setSelectedMonth] = useState<Nullable<Date>>(new Date())
  const userType = [
    { name: 'Over All', code: 0 },
    // { name: 'Date Range', code: 1 },
    { name: 'Month', code: 2 }
  ]

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
          import.meta.env.VITE_API_URL + '/rePayment/dueList',
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
          console.log('list line ------ 72', list)

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)

            setUserLists(list)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  const reCalChart = async () => {
    try {
      await axios
        .get(
          import.meta.env.VITE_API_URL + '/rePayment/interestBaseLoanNewEntry',

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
          if (data.success) {
            console.log('RecAl Completed Successfully')
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    loadData()
    const getData = async () => {
      await reCalChart()
    }
    getData()
  }, [startDate, endDate, selectedMonth])

  const ProductBody = (rowData: any) => {
    const op = useRef<OverlayPanel | null>(null)
    return (
      <div onMouseOver={(e) => op.current?.toggle(e)} onMouseLeave={() => op.current?.hide()}>
        <p>
          <b>{rowData.refProductName}</b>
        </p>

        <OverlayPanel className="p-0" ref={op}>
          <div className="">
            <b className="w-full flex justify-center">{rowData.refProductName}</b>
            <Divider className="m-1" />
            <p>
              <b>Duration : </b>
              {rowData.refProductDuration}{' '}
              {rowData.refProductDurationType === 1
                ? 'Months'
                : rowData.refProductDurationType === 2
                  ? 'Weeks'
                  : 'Days'}{' '}
            </p>
            <p>
              <b>Interest : </b> {rowData.refProductInterest}%
            </p>
          </div>
        </OverlayPanel>
      </div>
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
          {rowData.refCustLoanId}
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

  const handleCopyMessage = async (userLoanId: number) => {
    let passDate = ''

    if (selectedMonth instanceof Date && !isNaN(selectedMonth.getTime())) {
      const year = selectedMonth.getFullYear()
      const month = String(selectedMonth.getMonth() + 1).padStart(2, '0')
      const day = '28' // Default to first day of month if you're using this as a month picker

      passDate = `${day}/${month}/${year}, 10:00:00 am` // Format: DD-MM-YYYY
    }
    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/rePayment/dueAmountDetails',
          {
            loanId: userLoanId,
            date: passDate
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          console.log('data line ----- 205', data)
          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            // setDueData(data.data)
            // setTotalDueAmt(data.data[0].arearsAmt)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
    const message = `📢 Loan Payment Reminder – ZaMicro-Fi

Dear [Customer Name],

This is a gentle reminder regarding your loan details:

🔹 Loan Amount: ₹[Loan Amount]
🔹 Interest Rate: [Interest %] per annum
🔹 Interest Amount: ₹[Interest Amount]
🔹 Total Due Amount: ₹[Total Amount]
🔹 Due Date: [Date / Week / Month]

Kindly ensure payment is made by the due date to avoid any penalties.

💳 To make a payment or for assistance, please contact us at [Contact Number] or visit [Website/Link].

Thank you for choosing ZaMicro-Fi.
Your financial wellbeing is our priority. 💼`

    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert('Reminder message copied to clipboard!')
      })
      .catch((err) => {
        alert('Failed to copy message: ' + err)
      })
  }

  //Filter Data - End
  const reLoadPage = () => {
    loadData()
  }

  // const copyButton = () => {
  //   return (
  //     <>
  //       <div>
  //         <Button>
  //           <TbDeviceMobileMessage />
  //         </Button>
  //       </div>
  //     </>
  //   )
  // }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Re-Payment'} reLoad={reLoadPage} />
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
        <div className="contentPage w-[100%]">
          <div className="my-2 flex flex-row align-items-center justify-end w-full">
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
                  {/* <Calendar
                    value={startDate}
                    placeholder="Select Start Range"
                    onChange={(e) => {
                      setStartDate(e.value)
                      if (endDate && e.value && endDate < e.value) {
                        setEndDate(e.value)
                      }
                    }}
                    view="month"
                    dateFormat="mm/yy"
                  /> */}
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
                  {/* <Calendar
                    value={endDate}
                    placeholder="Select End Range"
                    onChange={(e) => setEndDate(e.value)}
                    view="month"
                    dateFormat="mm/yy"
                    minDate={startDate || undefined}
                    disabled={!startDate}
                  />{' '} */}
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
          {/* Search Input - End */}

          {/* Datatable - Start */}

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
              <Column style={{ minWidth: '3rem' }} body={CustomerId} header="Loan ID"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refUserFname"
                body={(rowData) => `${rowData.refUserFname} ${rowData.refUserLname}`}
                header="Name"
              ></Column>
              <Column style={{ minWidth: '8rem' }} field="refRName" header="Join Name"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refUserMobileNo"
                header="Phone Number"
              ></Column>
              <Column style={{ minWidth: '10rem' }} field="Area" header="Address"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refLoanStartDate"
                header="Loan Taken"
              ></Column>

              <Column style={{ minWidth: '10rem' }} body={ProductBody} header="Product"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refLoanAmount"
                body={(rowData) => {
                  return <b>{formatINRCurrency(rowData.refLoanAmount)}</b>
                }}
                header="Principal Amount"
              ></Column>
              <Column
                header="Message"
                body={(rowData) => {
                  return (
                    <>
                      <div className="w-full">
                        <Button
                          className="w-full flex justify-center bg-transparent border-none focus:outline-none focus:ring-0 focus:border-transparent"
                          onClick={async () => {
                            await handleCopyMessage(rowData.refLoanId)
                          }}
                        >
                          <TbDeviceMobileMessage size={'1.5rem'} color="blue" />
                        </Button>
                      </div>
                    </>
                  )
                }}
              ></Column>
            </DataTable>
          </div>

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <RepaymentSideTab
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

export default Repayments
