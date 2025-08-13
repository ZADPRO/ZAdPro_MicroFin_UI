import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Sidebar } from 'primereact/sidebar'
import React, { useEffect, useState } from 'react'
import AddNewSupplier from './AddNewSupplier'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'

interface Vendor {
  refVendorId: number
  refVendorName: string | null
  refVendorMobileNo: string | null
  refVenderType: number | null
  refVendorEmailId: string | null
  refDescription: string | null
  vendorBank?: Bank[] // Optional field for storing associated bank details
}

interface Bank {
  refBankId?: number // Optional, as it might be null or not available when creating a new bank entry
  refBankName: string
  refAccountNo: string
  refIFSCCode: string
  refUPICode: string
}

interface propsInterface {
  reloadFlag?: boolean
}

const AdminSupplierLoan: React.FC<propsInterface> = (reloadFlag) => {
  const [newData, setNewData] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  // const [selectedVendorId, setSelectedVendorId] = useState<number | null>()
  const [vendorList, setVendorList] = useState<Vendor[]>([])
  const [loadingStatus, setLoadingStatus] = useState(true)

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const getVendorList = () => {
    axios
      .get(import.meta.env.VITE_API_URL + '/adminLoan/vendor/list', {
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
          console.log(data)
          setLoadingStatus(false)
          setVendorList(data.data)
        }
      })
  }

  const getVendorDetails = (id: number): any => {
    console.log('id line ------ 65', id)
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/vendor/details',
        {
          refVendorId: id
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
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log('line ------- 87', data)
          setSelectedSupplier(data.data)
        }
      })
  }

  const closeSidebarNew = () => {
    setNewData(false)
    setSelectedSupplier(null)
    getVendorList()
  }

  useEffect(() => {
    getVendorList()
  }, [reloadFlag])

  const nameBodyTemplate = (rowData: any) => (
    <span
      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
      onClick={() => {
        console.log('rowData line ----- 110', rowData)
        // setSelectedVendorId(rowData.refVendorId)
        getVendorDetails(rowData.refVendorId)
        setNewData(true)
      }}
    >
      {rowData.refVendorName}
    </span>
  )

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
          <div className="flex justify-content-between">
            <Button
              label="Add New Vendor"
              severity="warning"
              style={{ backgroundColor: '#f8d20f' }}
              onClick={() => {
                setSelectedSupplier(null)
                setNewData(true)
              }}
            />
            <IconField style={{ width: '30%' }} iconPosition="left">
              <InputIcon className="pi pi-search"></InputIcon>
              <InputText
                placeholder="Search Vendor"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                m-1
                px-5
                text-white
                rounded-lg
              />
            </IconField>
          </div>

          <DataTable
            value={vendorList}
            filters={filters}
            className="mt-4"
            showGridlines
            size="small"
            stripedRows
            scrollable
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
          >
            <Column header="S.No" body={(_rowData, options) => options.rowIndex + 1} />
            <Column field="refVendorName" header="Name" body={nameBodyTemplate} />
            <Column field="refVendorMobileNo" header="Mobile No" />
            <Column
              body={(rowData) =>
                rowData.refVenderType === 1
                  ? 'Outside Vendor'
                  : rowData.refVenderType === 2
                    ? 'Bank'
                    : 'Depositor'
              }
              header="Vendor Type"
            />
            <Column field="refDescription" header="Description" />
          </DataTable>

          <Sidebar
            visible={newData}
            style={{ width: '70vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <AddNewSupplier closeSidebarNew={closeSidebarNew} supplierData={selectedSupplier} />
          </Sidebar>
        </div>
      )}
    </div>
  )
}

export default AdminSupplierLoan
