import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { FaFileInvoice } from 'react-icons/fa'
import { BsCalendar2DateFill } from 'react-icons/bs'
import { LiaChartBar } from 'react-icons/lia'
import './ReportStyle.css'
import { Sidebar } from 'primereact/sidebar'
import OverallReport from '@renderer/components/OverallReport/OverallReport'
import MonthlyReport from '@renderer/components/MonthlyReport/MonthlyReport'
import ExpenseReport from '@renderer/components/ExpenseReport/ExpenseReport'
// import { Dialog } from 'primereact/dialog'
import RePaymentReport from '@renderer/components/Reports/RePaymentReport'
import { TbFileReport } from 'react-icons/tb'

type Props = {}

export default function Report({}: Props) {
  const [username, setUsername] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(true)
  const monthName = new Date().toLocaleString('default', { month: 'short' })
  const [overallReport, setOverallReport] = useState<boolean>(false)
  const [monthlyReport, setMonthlyReport] = useState<boolean>(false)
  const [expenseReport, setExpenseReport] = useState<boolean>(false)
  const [rePaymentReport, setRePaymentReport] = useState<boolean>(false)

  const loadData = () => {
    console.log('line --------- 25')
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
  useEffect(() => {
    setLoadingStatus(false)
    loadData()
    setLoadingStatus(true)
  }, [])

  const closeSidebarNew = () => {
    setOverallReport(false)
    setMonthlyReport(false)
    setExpenseReport(false)
    setRePaymentReport(false)
  }
  const reLoadPage = () => {
    loadData()
  }

  return (
    <>
      <ToastContainer />
      <Header userName={username} pageName={'Report'} reLoad={reLoadPage} />
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
          <div className="w-full flex justify-start align-items-center gap-x-15 mx-5">
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setOverallReport(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <FaFileInvoice />
              </div>
              <div>
                <p>
                  <b>Over all Report</b>
                </p>
              </div>
            </div>
            {/* <div
              className="w-[10%] h-[10%] flex flex-col align-items-center"
              onClick={() => {
                setMonthlyReport(true)
              }}
            >
              <div className="m-3 monthCard py-4 w-[100%] flex justify-center flex-col align-items-center ">
                <BsCalendar2DateFill />
                <span style={{ fontSize: '1.5rem' }}>{monthName}</span>
              </div>
              <div>
                <p>
                  <b>Monthly Report</b>
                </p>
              </div>
            </div> */}
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setRePaymentReport(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <TbFileReport />
              </div>
              <div>
                <p>
                  <b>Due Report</b>
                </p>
              </div>
            </div>
            <div
              className="w-[10%] flex flex-col align-items-center"
              onClick={() => {
                setExpenseReport(true)
              }}
            >
              <div className="m-3 invoice-icon p-5 w-[100%] flex justify-center flex-col align-items-center ">
                <LiaChartBar />
              </div>
              <div>
                <p>
                  <b>Expense Report</b>
                </p>
              </div>
            </div>
          </div>
          <Sidebar
            visible={overallReport}
            style={{ width: '90vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <OverallReport />
          </Sidebar>
          {/* <Sidebar
            visible={monthlyReport}
            style={{ width: '90vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <MonthlyReport />
          </Sidebar> */}
          <Sidebar
            visible={expenseReport}
            style={{ width: '90vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <ExpenseReport />
          </Sidebar>
          <Sidebar
            visible={rePaymentReport}
            style={{ width: '95vw' }}
            position="right"
            onHide={closeSidebarNew}
          >
            <RePaymentReport />
          </Sidebar>
          {/* <Dialog
            header="Payment Configuration"
            visible={rePaymentReport}
            style={{ width: '95vw' }}
            onHide={closeSidebarNew}
          >
            <RePaymentReport />
          </Dialog> */}
        </div>
      )}
    </>
  )
}
