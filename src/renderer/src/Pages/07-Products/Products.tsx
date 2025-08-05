import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
// import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
// import ProductInputsUpdate from '@renderer/components/ProductsInputs/ProductInputsUpdate'
import ProductInputNew, { productData } from '@renderer/components/ProductsInputs/ProductInputNew'
import { Dialog } from 'primereact/dialog'

const Products = () => {
  const [loanProduct, setLoanProduct] = useState([])

  const [username, setUsername] = useState('')

  const [loadingStatus, setLoadingStatus] = useState(true)

  const [selectedProductData, setSelectedProductData] = useState<productData | null>()

  const loadData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/product/list', {
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
            setLoanProduct(data.product)
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
            setSelectedProductData({
              productName: rowData.refProductName,
              interest: rowData.refProductInterest,
              repaymentType: Number(rowData.refRePaymentType),
              loanDueType: Number(rowData.refLoanDueType),
              duration: rowData.refProductDuration,
              InterestCalType: Number(rowData.refInterestCalType),
              status: rowData.refStatus,
              description: rowData.refProductDescurption,
              productId: Number(rowData.refProductId),
              ifInitialInterest: rowData.refInitialInterest,
              initialInterestCal: Number(rowData.refIntislInterestCalId),
              dueCollectionType: Number(rowData.refDueRePaymentType)
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
        <div>
          {rowData.refProductInterest} % - [{' '}
          {rowData.refInterestCalType === 1
            ? 'Day wise Calculation'
            : rowData.refInterestCalType === 2
              ? 'Overall Calculation'
              : rowData.refInterestCalType === 2
                ? 'Month To Day Calculation'
                : ''}
          ]
        </div>
      </>
    )
  }

  const ProductDuration = (rowData: any) => {
    return (
      <>
        <div>
          {rowData.refProductDuration}{' '}
          {rowData.refLoanDueType === 3 ? 'Days' : rowData.refLoanDueType === 2 ? 'Week' : 'Month'}
        </div>
      </>
    )
  }

  const [newData, setNewData] = useState(false)

  const [updateData, setUpdateData] = useState(false)

  // const closeSidebarUpdate = () => {
  //   setUpdateData(false)
  //   loadData()
  // }

  const closeSidebarNew = () => {
    setNewData(false)
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

  const StatusBody = (rowData: any) => {
    return (
      <>
        {rowData.refStatus === 'active' ? (
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
              size="small"
              value={loanProduct}
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column body={CustomerId} field="refProductName" header="Product Name"></Column>
              <Column
                body={ProductDuration}
                field="refProductDuration"
                header="Product Duration"
              ></Column>
              <Column body={InterestPercentage} field="refFinalInterest" header="Interest"></Column>
              <Column field="refRepaymentTypeName" header="Re-Payment Type"></Column>
              <Column field="refProductDescurption" header="Description"></Column>
              <Column body={StatusBody} header="Status"></Column>
            </DataTable>
          </div>

          {/* Datatable - End */}

          {/* New User Side Bar - Start */}

          {/* <Sidebar
            visible={newData}
            style={{ width: '60vw' }}
            position="right"
            onHide={() => setNewData(false)}
          >
            <ProductInputNew closeSidebarNew={closeSidebarNew} />
          </Sidebar> */}

          <Dialog
            header="Add New Product"
            visible={newData}
            style={{ width: '75vw' }}
            onHide={closeSidebarNew}
          >
            <ProductInputNew closeSidebarNew={closeSidebarNew} />
          </Dialog>

          <Dialog
            header="Update Product"
            visible={updateData}
            style={{ width: '75vw' }}
            onHide={closeSidebarNew}
          >
            <ProductInputNew
              closeSidebarNew={closeSidebarNew}
              updateProductData={selectedProductData ?? undefined}
            />
          </Dialog>

          {/* New User Side Bar - End */}

          {/* Update Side Bar - Start */}

          {/* <Sidebar
            visible={updateData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setUpdateData(false)}
          >
            <ProductInputsUpdate data={userData} closeSidebarUpdate={closeSidebarUpdate} />
          </Sidebar> */}

          {/* Update Side Bar - End */}
        </div>
      )}
    </>
  )
}

export default Products
