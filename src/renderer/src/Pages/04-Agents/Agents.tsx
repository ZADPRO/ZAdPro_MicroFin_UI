import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useRef, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
import AgentInputsUpdate from '@renderer/components/AgentInputs/AgentInputsUpdate'
import AgentInputNew from '@renderer/components/AgentInputs/AgentInputNew'

const Customers = () => {
  const [userLists, setUserLists] = useState([])

  const dt = useRef<DataTable<any>>(null)

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)

  const loadData = () => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/adminRoutes/getPersonList',
          {
            roleId: 2
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
          console.log(data)

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
            setUserLists(data.data)
            console.log(data.data)
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
        <p className="line-clamp-2">
          {rowData.refUserAddress}, {rowData.refUserDistrict}, {rowData.refUserState} -{' '}
          {rowData.refUserPincode}
        </p>
      </>
    )
  }

  const StatusBody = (rowData: any) => {
    return (
      <>
        {rowData.refActiveStatus === 'active' ? (
          <div
            style={{
              padding: '5px',
              backgroundColor: '#00b600',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}
          >
            Active
          </div>
        ) : (
          <div
            style={{
              padding: '5px',
              backgroundColor: '#f95f5f',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}
          >
            Inactive
          </div>
        )}
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
          }}
          style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {rowData.refCustId}
        </div>
      </>
    )
  }

  const [newData, setNewData] = useState(false)

  const [updateData, setUpdateData] = useState(false)
  const [updateUserId, setUpdateUserId] = useState({
    id: '',
    custId: ''
  })

  const closeSidebarUpdate = () => {
    setUpdateData(false)
    loadData()
  }

  const closeSidebarNew = () => {
    setNewData(false)
    loadData()
  }

  //   Filter Data - Start

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    const _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  //Filter Data - End

  // HEADER
  const exportCSV = (type: any) => {
    console.log('type', type)
    dt.current?.exportCSV()
  }

  const header = (
    <div className="flex align-items-center justify-content-end gap-2">
      <Button
        type="button"
        icon="pi pi-file"
        rounded
        onClick={() => exportCSV(false)}
        data-pr-tooltip="CSV"
      />
    </div>
  )
  const reLoadPage = () => {
    loadData()
  }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Agents'} reLoad={reLoadPage} />
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
          {/* New User Button - Start */}

          <Button
            label="New Agents"
            severity="warning"
            style={{ backgroundColor: '#f8d20f' }}
            onClick={() => {
              setNewData(true)
            }}
          />

          {/* New User Button - End */}

          {/* Search Input - Start */}
          <div
            style={{
              width: '100%',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <IconField style={{ width: '30%' }} iconPosition="left">
              <InputIcon className="pi pi-search"></InputIcon>
              <InputText
                placeholder="Search Customers"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
              />
            </IconField>
          </div>
          {/* Search Input - End */}

          {/* Datatable - Start */}

          <div>
            <DataTable
              filters={filters}
              paginator
              rows={5}
              ref={dt}
              size="small"
              header={header}
              rowsPerPageOptions={[5, 10, 25, 50]}
              value={userLists}
              showGridlines
              scrollable
              exportFilename="Agents Details"
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column
                header="S.No"
                body={(_rowData, options) => options.rowIndex + 1}
                exportable
                exportField="sno"
                style={{ minWidth: '3rem', textAlign: 'center' }}
              />

              <Column style={{ minWidth: '3rem' }} body={CustomerId} header="User ID"></Column>
              <Column
                style={{ minWidth: '8rem' }}
                field="refUserFname"
                header="First Name"
              ></Column>
              <Column style={{ minWidth: '8rem' }} field="refUserLname" header="Last Name"></Column>
              <Column
                style={{ minWidth: '10rem' }}
                field="refUserMobileNo"
                header="Phone Number"
              ></Column>
              <Column style={{ minWidth: '14rem' }} field="refUserEmail" header="Email"></Column>
              <Column
                style={{ minWidth: '20rem' }}
                exportField="address"
                body={AddressBody}
                header="Address"
              ></Column>
              <Column
                style={{ minWidth: '12rem' }}
                field="refAadharNo"
                header="Aadhar Number"
              ></Column>
              <Column style={{ minWidth: '8rem' }} field="refPanNo" header="Pan Number"></Column>
              <Column body={StatusBody} header="Status" exportField="Status"></Column>
            </DataTable>
          </div>

          {/* Datatable - End */}

          {/* New User Side Bar - Start */}

          <Sidebar
            visible={newData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setNewData(false)}
          >
            <AgentInputNew closeSidebarNew={closeSidebarNew} />
          </Sidebar>

          {/* New User Side Bar - End */}

          {/* Update Side Bar - Start */}

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <AgentInputsUpdate
              custId={updateUserId.custId}
              id={updateUserId.id}
              closeSidebarUpdate={closeSidebarUpdate}
            />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default Customers
