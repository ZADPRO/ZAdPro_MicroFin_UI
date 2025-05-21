// import Header from "@renderer/components/Header/Header";
// import { useNavigate } from "react-router-dom"
import { Fieldset } from 'primereact/fieldset'
import { Divider } from 'primereact/divider'
import { ToastContainer } from 'react-toastify'
import Header from '@renderer/components/Header/Header'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
import axios from 'axios'
import { useEffect, useState } from 'react'
import decrypt from '../../components/Helper/Helper'
import { Link } from 'react-router-dom'

interface dashboardCount {
  total_loans?: string
  total_loan_amount?: string
  paid_count?: string
  total_paid_principal?: string
  total_paid_interest?: string
  not_paid_count?: string
  total_not_paid_principal?: string
  total_not_paid_interest?: string
  Total_initial_interest?: string
  admin_total_loans?: string
  admin_total_loan_amount?: string
  admin_paid_count?: string
  admin_total_paid_principal?: string
  admin_total_paid_interest?: string
  admin_not_paid_count?: string
  admin_total_not_paid_principal?: string
  admin_total_not_paid_interest?: string
  admin_Total_initial_interest?: string
}

const Dashboard = () => {
  const formatDate = (data) => {
    const date = new Date(data)
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return formatted
  }
  const [date, setDate] = useState<Nullable<Date>>(null)
  const [dashboardCount, setDashboardCount] = useState<dashboardCount>()

  const DashBoardData = () => {
    date === null ? setDate(new Date()) : date
    axios
      .post(
        import.meta.env.VITE_API_URL + '/refDashboard/Count',
        {
          month: formatDate(date)
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
        console.log('data line ----- 205', data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        if (data.success) {
          setDashboardCount({
            ...dashboardCount,
            total_loans: data.loanCount[0].total_loans,
            total_loan_amount: data.loanCount[0].total_loan_amount,
            paid_count: data.paidLoan[0].paid_count,
            total_paid_principal: data.paidLoan[0].total_paid_principal,
            total_paid_interest: data.paidLoan[0].total_paid_interest,
            not_paid_count: data.loanNotPaid[0].not_paid_count,
            total_not_paid_principal: data.loanNotPaid[0].total_not_paid_principal,
            total_not_paid_interest: data.loanNotPaid[0].total_not_paid_interest,
            Total_initial_interest: data.loanCount[0].Total_initial_interest,

            admin_total_loans: data.adminLoanCountData[0].total_loans,
            admin_total_loan_amount: data.adminLoanCountData[0].total_loan_amount,
            admin_paid_count: data.adminPaidLoanData[0].paid_count,
            admin_total_paid_principal: data.adminPaidLoanData[0].total_paid_principal,
            admin_total_paid_interest: data.adminPaidLoanData[0].total_paid_interest,
            admin_not_paid_count: data.adminLoanNotPaidData[0].not_paid_count,
            admin_total_not_paid_principal: data.adminLoanNotPaidData[0].total_not_paid_principal,
            admin_total_not_paid_interest: data.adminLoanNotPaidData[0].total_not_paid_interest,
            admin_Total_initial_interest: data.adminLoanCountData[0].Total_initial_interest
          })
        }
      })
  }

  useEffect(() => {
    DashBoardData()
  }, [date])

  const reLoadPage = () => {
    DashBoardData()
  }

  return (
    <>
      <ToastContainer />
      <Header userName={'ZAdPro Admin'} pageName={'DashBoard'} reLoad={reLoadPage} />
      <div className="card flex justify-content-start mx-5 mt-3 gap-x-3 align-items-center">
        <Calendar
          placeholder="select Month"
          value={date}
          onChange={(e) => {
            console.log('line ----- 25', e.value)
            setDate(e.value)
          }}
          view="month"
          dateFormat="mm/yy"
        />
      </div>
      <div className="w-[full] flex flex-row">
        <div className=" mx-5 mt-2 w-[30%]">
          <div className="card w-full">
            <Link to="/loans" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Total Loan Count">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.total_loans}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.total_loan_amount}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Total Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.Total_initial_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Initial Interest</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>

        <div className=" mx-5 mt-2 w-[30%]">
          <div className="card w-full">
            <Link to="/loans" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Loan Paid">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.paid_count}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.total_paid_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Interest Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.total_paid_principal}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Principal Amount</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>
        <div className=" mx-5 mt-2 w-[30%]">
          <div className="card w-full">
            <Link to="/repayment" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Loan not Paid">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.not_paid_count}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.total_not_paid_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Interest Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.total_not_paid_principal}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Principal Amount</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>
      </div>
      <Divider align="left">
        <div className="">
          <b className="text-[1.2rem] text-[#0478df]">Admin Loan</b>
        </div>
      </Divider>
      <div className="w-[full] flex flex-row">
        <div className=" mx-5 mt-0 w-[30%]">
          <div className="card w-full">
            <Link to="/adminloan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Total Loan Count">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.admin_total_loans}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_total_loan_amount}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Total Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_Total_initial_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Initial Interest</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>

        <div className=" mx-5 mt-0 w-[30%]">
          <div className="card w-full">
            <Link to="/adminloan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Loan Paid">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.admin_paid_count}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_total_paid_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Interest Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_total_paid_principal}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Principal Amount</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>
        <div className=" mx-5 mt-0 w-[30%]">
          <div className="card w-full">
            <Link to="/adminloan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Fieldset legend="Loan not Paid">
                <div className="flex flex-row w-full justify-center align-items-center p-0">
                  <div className="flex flex-col w-auto align-items-center">
                    <p>
                      <b className="text-[1.5rem]">{dashboardCount?.admin_not_paid_count}</b>
                    </p>
                    <p className="text-[1rem] text-[#0478df] my-2">Count</p>
                  </div>
                  <Divider layout="vertical" />
                  <div className="flex flex-col w-auto align-items-center">
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_total_not_paid_interest}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Interest Amount</p>
                    </div>
                    <div>
                      <p className="text-[1.2rem]">
                        <b>&#8377; {dashboardCount?.admin_total_not_paid_principal}</b>
                      </p>
                      <p className="text-[1rem] text-[#0478df] my-2">Principal Amount</p>
                    </div>
                  </div>
                </div>
              </Fieldset>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
