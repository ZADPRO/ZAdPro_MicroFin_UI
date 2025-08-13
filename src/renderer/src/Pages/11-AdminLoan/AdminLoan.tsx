import AdminNewLoan from '@renderer/components/AdminNewLoan/AdminNewLoan'
import AdminSupplierLoan from '@renderer/components/AdminSupplierLoan/AdminSupplierLoan'
import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { TabPanel, TabView } from 'primereact/tabview'
import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import AdminRepayments from '../12-AdminRepayments/AdminRepayments'

const AdminLoan: React.FC = () => {
  const [username, setUsername] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [reloadFlag, setReloadFlag] = useState(false)

  const loadData = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/adminRoutes/getLoanAndUser', {
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
          import.meta.env.VITE_API_URL + '/AdminRePayment/interestBaseLoanNewEntry',

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
    reCalChart()
  }, [])

  const reLoadPage = () => {
    setReloadFlag((prev) => !prev)
    loadData()
  }

  return (
    <div>
      <ToastContainer />
      <Header userName={username} pageName={'Admin Loan'} reLoad={reLoadPage} />
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
          <TabView>
            <TabPanel header="Repayment">
              <AdminRepayments reloadFlag={reloadFlag} />
            </TabPanel>
            <TabPanel header="Loan">
              <AdminNewLoan reloadFlag={reloadFlag} />
            </TabPanel>
            <TabPanel header="Vendor">
              <AdminSupplierLoan />
            </TabPanel>
          </TabView>
        </div>
      )}
    </div>
  )
}

export default AdminLoan
