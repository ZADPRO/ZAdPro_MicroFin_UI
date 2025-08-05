import { TabPanel, TabView } from 'primereact/tabview'
import React, { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import axios from 'axios'
import { Divider } from 'primereact/divider'
import { BsInfoCircle } from 'react-icons/bs'
import { IoCloseCircleOutline } from 'react-icons/io5'
import AdminLoanAudit from '../adminLoanAudit/AdminLoanAudit'
import AdminCloseLoan from '../AdminCloseLoan/AdminCloseLoan'

interface AddNewSupplierProps {
  closeSidebarNew: () => void
  userId: number
  loanId: number
}

interface LoanDetail {
  refLoanId: number
  refLoanAmount: string
  refLoanStartDate: string
  refLoanDueDate: string
  refLoanStatus: string
  refProductDuration: number
  refProductInterest: number
  refRepaymentStartDate: string
  refRepaymentTypeName: string
  isInterestFirst: boolean
  refInitialInterest: string
  refInterestMonthCount: number
  totalInterest: string
  totalPrincipal: string
  refVendorName: string
  refBalanceAmt: string
}

const AdminLoanDetails: React.FC<AddNewSupplierProps> = ({ closeSidebarNew, loanId, userId }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [loanDetails, setLoanDetails] = useState<LoanDetail>()
  const [rePaymentInfo, setRePaymentInfo] = useState(false)

  const getLoanDatas = async () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminLoan/loanDetails',
        {
          loanId: loanId,
          userId: userId
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
        console.log('data line ------ 278', data)
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log('data.data[0] line ------- 67', data.data[0])
          setLoanDetails(data.data[0])
        }
      })
  }

  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString)

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // months are 0-indexed
    const day = '01'

    return `${year}-${month}-${day}`
  }

  const handleBack = () => {
    closeSidebarNew()
  }

  useEffect(() => {
    getLoanDatas()
  }, [])

  return (
    <div>
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => {
          console.log(e.index)
          setActiveIndex(e.index)
        }}
        style={{ marginTop: '1rem' }}
      >
        <TabPanel header="Loan Audit">
          <div className="w-full my-3 border-2 border-transparent rounded-md shadow-3">
            <div className="m-3 w-full flex ">
              <div className="w-[30%]">
                <p>
                  Vendor Name : <b>{loanDetails?.refVendorName}</b>
                </p>
              </div>
              <div className="w-[30%]">
                <p>
                  Total Amount :<b> &#8377; {loanDetails?.refLoanAmount}</b>{' '}
                </p>
              </div>
              <div className="w-[30%]">
                <p>
                  Balance Amount :<b> &#8377; {loanDetails?.refBalanceAmt}</b>{' '}
                </p>
              </div>
              {!rePaymentInfo ? (
                <div className="w-[10%]">
                  <BsInfoCircle
                    size={'1.5rem'}
                    color="blue"
                    onClick={() => {
                      setRePaymentInfo(true)
                    }}
                  />
                </div>
              ) : (
                <div className="w-[10%]">
                  <IoCloseCircleOutline
                    size={'1.7rem'}
                    color="red"
                    onClick={() => {
                      setRePaymentInfo(false)
                    }}
                  />
                </div>
              )}
            </div>
            {rePaymentInfo && (
              <>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Loan Duration : <b>{loanDetails?.refProductDuration} Month</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Interest : <b>{loanDetails?.refProductInterest} %</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Re-Payment Type : <b>{loanDetails?.refRepaymentTypeName}</b>{' '}
                    </p>
                  </div>
                </div>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Interest Paid Initial :{' '}
                      <b>{loanDetails?.isInterestFirst === true ? 'Yes' : 'No'}</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      No of Month Paid First : <b>{loanDetails?.refInterestMonthCount} Month</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Initial Interest : <b>₹ {loanDetails?.refInitialInterest}</b>{' '}
                    </p>
                  </div>
                </div>
                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Loan Get Date : <b>{loanDetails?.refLoanStartDate}</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Loan Start Month:{' '}
                      <b>
                        {loanDetails?.refRepaymentStartDate
                          ? formatToFirstOfMonth(loanDetails.refRepaymentStartDate)
                          : ' -'}
                      </b>
                    </p>
                  </div>

                  <div className="w-[30%]">
                    <p>
                      Loan End Month : <b>{loanDetails?.refLoanDueDate}</b>
                    </p>
                  </div>
                </div>

                <div className="m-3 w-full flex ">
                  <div className="w-[30%]">
                    <p>
                      Total Interest Paid : <b>&#8377; {loanDetails?.totalInterest}</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Total Principal Paid : <b>&#8377; {loanDetails?.totalPrincipal}</b>
                    </p>
                  </div>
                  <div className="w-[30%]">
                    <p>
                      Loan Status:{' '}
                      <b>
                        {loanDetails?.refLoanStatus
                          ? loanDetails.refLoanStatus.charAt(0).toUpperCase() +
                            loanDetails.refLoanStatus.slice(1)
                          : 'N/A'}
                      </b>
                    </p>
                  </div>
                </div>
                <Divider />
              </>
            )}
          </div>
          <div className="m-2 border-1 shadow-md border-[#c7c7c7ef]">
            <AdminLoanAudit loanId={loanId} />
          </div>
        </TabPanel>
        {loanDetails?.refLoanStatus === 'opened' && (
          <TabPanel header="Loan Closing">
            <AdminCloseLoan id={loanId} goToHistoryTab={handleBack} />
          </TabPanel>
        )}
      </TabView>
    </div>
  )
}

export default AdminLoanDetails
