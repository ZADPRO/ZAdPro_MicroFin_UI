import Area from '@renderer/components/Area/Area'
import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
// import { FaMapLocationDot } from 'react-icons/fa6'

import { ToastContainer } from 'react-toastify'
import CustomerIdCust from '@renderer/components/CustomerIdCust/CustomerIdCust'
import { Dialog } from 'primereact/dialog'
import LoanIdCust from '@renderer/components/LoanIdCust/LoanIdCust'
import LoanSettings from '../../assets/loneSeetings2.png'
import PaymentSettings from '../../assets/paymentSettings3.png'
import CustomerSettings from '../../assets/CustomerSettings1.png'
import LoanSettingsWhite from '../../assets/loneSeetingsWhite.png'
import PaymentSettingsWhite from '../../assets/paymentSettings3White.png'
import CustomerSettingsWhite from '../../assets/CustomerSettings1White.png'
import AreaSettingsWhite from '../../assets/AreaSettingsWhite.png'
import AreaSettings from '../../assets/AreaSettings.png'
import { useLocation } from 'react-router-dom'

import './Customize.css'
import PaymentConfiguration from '@renderer/components/PaymentConfiguration/PaymentConfiguration'
type Props = {}

export default function Customize({}: Props) {
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [area, setArea] = useState<boolean>()
  const [loanIdEdit, setLoanIdEdit] = useState<boolean>()
  const [paymentConf, setPaymentConf] = useState<boolean>()
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
    setPaymentConf(false)
  }
  useEffect(() => {
    const data = location.state?.enable
    console.log('data', data)
    if (data) {
      if (data === 'Area') {
        setArea(true)
      }
    }
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
          <div className="w-full h-[37%] flex justify-start align-items-center gap-x-15 mx-5">
            <div
              className="w-[10%] h-[100%] flex flex-col align-items-center"
              onClick={() => {
                setArea(true)
              }}
            >
              <div className="m-3 invoice-icon payment-icon-wrapper  ">
                <img className="default-img w-[20px]" src={AreaSettings} alt="Default" />
                <img className="hover-img" src={AreaSettingsWhite} alt="On Hover" />
              </div>
              <div>
                <p className="text-center">
                  <b>Area Configuration</b>
                </p>
              </div>
            </div>

            <div
              className="w-[10%] h-[100%] flex flex-col align-items-center"
              onClick={() => {
                setCustomerIdEdit(true)
              }}
            >
              <div className="m-3 invoice-icon payment-icon-wrapper ">
                <img className="default-img" src={CustomerSettings} alt="Default" />
                <img className="hover-img" src={CustomerSettingsWhite} alt="On Hover" />
              </div>

              <div>
                <p className="text-center">
                  <b>Customer ID Format</b>
                </p>
              </div>
            </div>
            <div
              className="w-[10%] h-[100%] flex flex-col align-items-center"
              onClick={() => {
                setLoanIdEdit(true)
              }}
            >
              <div className="m-3 invoice-icon payment-icon-wrapper ">
                <img className="default-img" src={LoanSettings} alt="Default" />
                <img className="hover-img" src={LoanSettingsWhite} alt="On Hover" />
              </div>
              <div>
                <p className="text-center">
                  <b>Loan Configuration</b>
                </p>
              </div>
            </div>
            <div
              className="w-[10%] h-[100%] flex flex-col items-center "
              onClick={() => {
                setPaymentConf(true)
              }}
            >
              <div className="m-3 payment-icon-wrapper  p-3 w-full flex justify-center flex-col items-center relative">
                <img className="default-img" src={PaymentSettings} alt="Default" />
                <img className="hover-img" src={PaymentSettingsWhite} alt="On Hover" />
              </div>
              <div>
                <p className="text-center font-bold">Payment Configuration</p>
              </div>
            </div>
          </div>
          <Sidebar
            visible={area}
            style={{ width: '50vw' }}
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
            header="Loan Configuration"
            visible={loanIdEdit}
            style={{ width: '80vw' }}
            onHide={closeSidebarNew}
          >
            <LoanIdCust />
          </Dialog>
          <Dialog
            header="Payment Configuration"
            visible={paymentConf}
            style={{ width: '50vw' }}
            onHide={closeSidebarNew}
          >
            <PaymentConfiguration />
          </Dialog>
        </div>
      )}
    </>
  )
}
