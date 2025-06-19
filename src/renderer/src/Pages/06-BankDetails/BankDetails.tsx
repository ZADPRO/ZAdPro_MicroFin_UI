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
import BankInputNew from '@renderer/components/BankInputs/BankInputNew'
import BankInputsUpdate from '@renderer/components/BankInputs/BankInputsUpdate'

const BankDetails = () => {
  const [userLists, setUserLists] = useState([])

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)

  const [userData, setUserData] = useState({
    refBankId: '',
    refBankName: '',
    refBankAccountNo: '',
    refBankAddress: '',
    refBalance: '',
    refAccountType: '',
    refAccountTypeName: '',
    refIFSCsCode: ''
  })

  const dt = useRef<DataTable<any>>(null)

  const loadData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/adminRoutes/getBankAccountList', {
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

          console.log(data)

          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
            setUserLists(data.BankAccount)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const reLoadPage = () => {
    loadData()
  }

  const CustomerId = (rowData: any) => {
    return (
      <>
        <div
          onClick={() => {
            console.log('rowData', rowData)
            setUpdateData(true)
            setUserData({
              refBankId: rowData.refBankId,
              refBankName: rowData.refBankName,
              refBankAccountNo: rowData.refBankAccountNo,
              refBankAddress: rowData.refBankAddress,
              refBalance: rowData.refBalance,
              refAccountType: rowData.refAccountType,
              refAccountTypeName: rowData.refAccountTypeName,
              refIFSCsCode: rowData.refIFSCsCode
            })
          }}
          style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {rowData.refBankName}
        </div>
      </>
    )
  }

  const BankBalance = (rowData: any) => {
    return (
      <>
        <div>₹ {rowData.refBalance}</div>
      </>
    )
  }

  const [newData, setNewData] = useState(false)

  const [updateData, setUpdateData] = useState(false)

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
  const [first, setFirst] = useState(0)

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const footer = `In total there are ${userLists ? userLists.length : 0} Banks.`

  //Filter Data - End

  // EXPORT AS CSV

  const exportCSV = (selectionOnly: boolean) => {
    dt.current?.exportCSV({ selectionOnly })
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

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Bank Details'} reLoad={reLoadPage} />
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
            label="Add Bank Details"
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
                placeholder="Search Bank Deatils"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
              />
            </IconField>
          </div>
          {/* Search Input - End */}

          {/* Datatable - Start */}

          <div>
            <DataTable
              value={userLists}
              filters={filters}
              paginator
              first={first}
              onPage={(e) => setFirst(e.first)}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              footer={footer}
              header={header}
              ref={dt}
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column
                header="S.No"
                body={(_rowData, options) => options.rowIndex + 1 + first}
                style={{ width: '80px', textAlign: 'center' }}
              />

              <Column body={CustomerId} header="Bank Name"></Column>
              <Column field="refBalance" body={BankBalance} header="Bank Balance"></Column>
              <Column field="refBankAccountNo" header="Account Number"></Column>
              <Column field="refBankAddress" header="Bank Address"></Column>
              <Column field="refIFSCsCode" header="IFSC Code"></Column>
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
            <BankInputNew closeSidebarNew={closeSidebarNew} />
          </Sidebar>

          {/* New User Side Bar - End */}

          {/* Update Side Bar - Start */}

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <BankInputsUpdate data={userData} closeSidebarUpdate={closeSidebarUpdate} />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default BankDetails
