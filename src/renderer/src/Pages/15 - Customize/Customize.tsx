import Area from '@renderer/components/Area/Area'
import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { FaMapLocationDot } from 'react-icons/fa6'
import { TbUserEdit } from 'react-icons/tb'
import { FaListOl } from 'react-icons/fa6'
import { ToastContainer } from 'react-toastify'
import CustomerIdCust from '@renderer/components/CustomerIdCust/CustomerIdCust'
import { Dialog } from 'primereact/dialog'
import LoanIdCust from '@renderer/components/LoanIdCust/LoanIdCust'

type Props = {}

export default function Customize({}: Props) {
  const [username, setUsername] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [area, setArea] = useState<boolean>()
    const [loanIdEdit, setLoanIdEdit] = useState<boolean>()
    const [customerIdEdit, setCustomerIdEdit] = useState<boolean>()
  const loadData = () => {
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

          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            setLoadingStatus(false)
            setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  const reLoadPage = () => {
    loadData()
  }
  const closeSidebarNew = () => {
    setArea(false)
    setLoanIdEdit(false)
    setCustomerIdEdit(false)
  }
  useEffect(() => {
    setLoadingStatus(false)
    loadData()
    setLoadingStatus(false)
  }, [])
  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Customize'} reLoad={reLoadPage} />
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
        <div className="w-full h-[90%] p-5">
          <div className="w-full flex justify-start align-items-start gap-x-15 mx-5">
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setArea(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <FaMapLocationDot />
              </div>
              <div>
                <p>
                  <b>Area</b>
                </p>
              </div>
            </div>
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setCustomerIdEdit(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <TbUserEdit />
              </div>
              <div>
                <p className="text-center">
                  <b>Customer ID Format</b>
                </p>
              </div>
            </div>
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setLoanIdEdit(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <FaListOl />
              </div>
              <div>
                <p className="text-center">
                  <b>Loan ID Format</b>
                </p>
              </div>
            </div>
          </div>
          <Sidebar
            visible={area}
            style={{ width: '60vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <Area />
          </Sidebar>
          {/* <Sidebar
            visible={customerIdEdit}
            style={{ width: '40vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <CustomerIdCust />
          </Sidebar> */}
          <Dialog
            header="Header"
            visible={customerIdEdit}
            style={{ width: '50vw' }}
            onHide={closeSidebarNew}
          >
            <CustomerIdCust />
          </Dialog>
          <Dialog
            header="Header"
            visible={loanIdEdit}
            style={{ width: '50vw' }}
            onHide={closeSidebarNew}
          >
            <LoanIdCust />
          </Dialog>
          {/* <Sidebar
            visible={loanIdEdit}
            style={{ width: '40vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <Area />
          </Sidebar> */}
        </div>
      )}
    </>
  )
}
