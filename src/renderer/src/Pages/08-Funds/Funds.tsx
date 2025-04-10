import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { Button } from 'primereact/button'
import AddnewFund from '@renderer/components/FundsInputs/AddnewFund'
import { Calendar } from 'primereact/calendar'

const Funds = () => {
  const [userLists, setUserLists] = useState([])
  const [originalUserLists, setOriginalUserLists] = useState([])
  const [startdates, setStartDates] = useState<Date | null>(null)
  const [enddates, setEndDates] = useState<Date | null>(null)
  const [username, setUsername] = useState('')
  const [submitLoading, _setSubmitLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [isFiltered, setIsFiltered] = useState(false)

  const loadData = () => {
    console.log("line --------- 25")
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/adminRoutes/getBankFundList', {
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

          localStorage.setItem("token", "Bearer " + data.token);

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
            setUserLists(data.BankFund)
            setOriginalUserLists(data.BankFund)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFilter = () => {
    if (!startdates || !enddates) {
      setUserLists(originalUserLists)
      setIsFiltered(false)
      return
    }

    const startTimestamp = new Date(startdates).setHours(0, 0, 0, 0)
    const endTimestamp = new Date(enddates).setHours(23, 59, 59, 999)

    const filteredData = originalUserLists.filter((item: any) => {
      const transactionDate = new Date(item.refbfTransactionDate).setHours(0, 0, 0, 0)
      return transactionDate >= startTimestamp && transactionDate <= endTimestamp
    })

    setUserLists(filteredData)
    setIsFiltered(true)
  }

  const handleClearFilter = () => {
    setUserLists(originalUserLists)
    setStartDates(null)
    setEndDates(null)
    setIsFiltered(false)
  }

  const TransactionAmount = (rowData: any) => {
    return <div>{rowData.refbfTransactionAmount} ₹</div>
  }

  const [newData, setNewData] = useState(false)

  const closeSidebarNew = () => {
    setNewData(false)
    loadData()
  }

  const Status = (rowData: any) => {
    return (
      <>
        {rowData.refbfTrasactionType === 'credit' ? (
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
            Credit
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
            Debit
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Funds'} />
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
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'start' }}>
              <Button
                severity='warning'
                label="Add Funds"
                style={{ padding: '10px 20px', fontSize: '1rem', backgroundColor: "#f8d20f" }}
                onClick={() => setNewData(true)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div className="card flex justify-content-center" style={{ flex: 1 }}>
                <Calendar
                  value={startdates}
                  onChange={(e) => {
                    setStartDates(e.value ? e.value : null)
                    setIsFiltered(false)
                    loadData();
                  }}
                  placeholder='From Date'
                  readOnlyInput
                  dateFormat="dd/mm/yy"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="card flex justify-content-center" style={{ flex: 1 }}>
                <Calendar
                  value={enddates}
                  onChange={(e) => {
                    setEndDates(e.value ? e.value : null)
                    setIsFiltered(false)
                    loadData()
                  }}
                  placeholder='To Date'
                  readOnlyInput
                  dateFormat="dd/mm/yy"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {submitLoading ? (
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: '2rem', color: '#0478df' }}
                  ></i>
                ) : (
                  <Button
                    style={{ padding: '10px 20px', fontSize: '1rem', width: '200px', backgroundColor: isFiltered ? "#dc2626" : "#0478df" }}
                    type="button"
                    severity={isFiltered ? 'danger' : 'info'}
                    label={isFiltered ? 'Clear' : 'Search'}
                    onClick={isFiltered ? handleClearFilter : handleFilter}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <DataTable
              paginator
              rows={5}
              value={userLists}
              showGridlines
              scrollable
              emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
              tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
            >
              <Column field="refbfTransactionDate" header="Transaction Date"></Column>
              <Column body={TransactionAmount} header="Transaction Amount"></Column>
              <Column field="refBankName" header="Bank Name"></Column>
              <Column field="refFundType" header="Fund Type"></Column>
              <Column body={Status} field="refbfTrasactionType" header="Action"></Column>
            </DataTable>
          </div>

          <Sidebar
            visible={newData}
            style={{ width: '80vw' }}
            position="right"
            onHide={() => setNewData(false)}
          >
            <AddnewFund closeSidebarNew={closeSidebarNew} />
          </Sidebar>
        </div>
      )}
    </>
  )
}

export default Funds
