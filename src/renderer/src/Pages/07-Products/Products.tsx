import Header from '@renderer/components/Header/Header'
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
import { Button } from 'primereact/button'
import ProductInputsUpdate from '@renderer/components/ProductsInputs/ProductInputsUpdate'
import ProductInputNew from '@renderer/components/ProductsInputs/ProductInputNew'

const Products = () => {
  const [userLists, setUserLists] = useState([])

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)

  const [userData, setUserData] = useState({
    refProductId: '',
    refProductName: '',
    refProductDuration: '',
    refProductInterest: '',
    refProductDescription: '',
    refProductStatus: '',
    refProductDurationType: 0,
    refProductMonthlyCal: 0
  })

  const loadData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/adminRoutes/productList', {
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
            setUserLists(data.products)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const CustomerId = (rowData: any) => {
    return (
      <>
        <div
          onClick={() => {
            setUpdateData(true)
            setUserData({
              refProductId: rowData.refProductId,
              refProductName: rowData.refProductName,
              refProductDuration: rowData.refProductDuration,
              refProductInterest: rowData.refProductInterest,
              refProductDescription: rowData.refProductDescription,
              refProductStatus: rowData.refProductStatus,
              refProductMonthlyCal: rowData.refProductMonthlyCal,
              refProductDurationType: rowData.refProductDurationType
            })
          }}
          style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {rowData.refProductName}
        </div>
      </>
    )
  }

  const InterestPercentage = (rowData: any) => {
    return (
      <>
        <div>{rowData.refProductInterest} %</div>
        {rowData.refProductDurationType === 1 && (
          <div>
           ( {rowData.refProductMonthlyCal === 1 ? 'Day wise Calculation' : 'Month wise Calculation'} )
          </div>
        )}
      </>
    )
  }

  const ProductDuration = (rowData: any) => {
    return (
      <>
        <div>
          {rowData.refProductDuration}{' '}
          {rowData.refProductDurationType === 3
            ? 'Days'
            : rowData.refProductDurationType === 2
              ? 'Week'
              : 'Month'}
        </div>
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

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  //Filter Data - End

  const StatusBody = (rowData: any) => {
    return (
      <>
        {rowData.refProductStatus === 'active' ? (
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

  const reLoadPage = () => {
    loadData()
  }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Products'} reLoad={reLoadPage} />
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
            label="Add Products"
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
                placeholder="Search Products"
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
              value={userLists}
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column body={CustomerId} header="Product Name"></Column>
              <Column body={ProductDuration} header="Product Duration"></Column>
              <Column body={InterestPercentage} header="Interest"></Column>
              <Column field="refProductDescription" header="Description"></Column>
              <Column body={StatusBody} header="Status"></Column>
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
            <ProductInputNew closeSidebarNew={closeSidebarNew} />
          </Sidebar>

          {/* New User Side Bar - End */}

          {/* Update Side Bar - Start */}

          <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <ProductInputsUpdate data={userData} closeSidebarUpdate={closeSidebarUpdate} />
          </Sidebar>

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default Products
