import axios from 'axios'
import { TabPanel, TabView } from 'primereact/tabview'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import LoanAudit from '../LoanAudit/LoanAudit'
import { BsInfoCircle } from 'react-icons/bs'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { Divider } from 'primereact/divider'
import CloseLoan from '../CloseLoan/CloseLoan'
import { formatINRCurrency } from '@renderer/helper/amountFormat'

const Addnewloan = ({ custId, id, closeSidebarUpdate, loanNo }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleBack = () => {
    if (0 == 0) {
    } else {
      closeSidebarUpdate()
    }
  }

  const [loading, setLoading] = useState(true)

  const [loanStatus, setLoanStatus] = useState<string>()

  useEffect(() => {
    getLoanDatas(id)
  }, [activeIndex])

  const [rePaymentInfo, setRePaymentInfo] = useState({})
  const toggleRepaymentInfo = (index) => {
    setRePaymentInfo((prev) => ({
      ...prev,
      [index]: !prev[index] // toggle only this index
    }))
  }

  const [loanDetails, setLoanDetails] = useState<any>([])

  const getLoanDatas = async (loanId: any) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/rePayment/loanDetails',
          {
            loanId: loanId, //this is Customer Id
            loanNo: loanNo //this is Loan Id
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
          console.log('data line ------ 289', data)
          localStorage.setItem('token', 'Bearer ' + data.token)

          if (data.success) {
            console.log(' -> Line Number ----------------------------------- 64')
            data.data.map((audit) => {
              if (audit.refLoanId === loanNo) {
                setLoanDetails([audit])
                setLoanStatus(audit.refLoanStatus)
                setLoading(false)
              }
            })
          }
        })
    } catch (error) {
      console.log('error', error)
      handleBack
    }
  }
  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString)

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // months are 0-indexed
    const day = '01'

    return `${year}-${month}-${day}`
  }

  return (
    <>
      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>{custId}</div>
      {loading ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#0478df',
              height: '76vh',
              width: '100%'
            }}
          >
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
          </div>
        </>
      ) : (
        <>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => {
              console.log(e.index)
              setActiveIndex(e.index)
            }}
            style={{ marginTop: '1rem' }}
          >
            <TabPanel header="Loan Audit">
              <>
                {loanDetails.map((item, index) => (
                  <>
                    <Divider align="left">
                      <div className="inline-flex align-items-center">
                        <i className="pi pi-wallet mr-2 text-[#007bff]"></i>
                        <b className="text-[#007bff]">Loan {loanDetails[index].refCustLoanId}</b>
                      </div>
                    </Divider>
                    <div className="w-full my-3 border-2 border-transparent rounded-md shadow-3">
                      <div className="m-3 w-full flex ">
                        <div className="w-[30%]">
                          <p>
                            Product Name : <b>{loanDetails[index]?.refProductName}</b>
                          </p>
                        </div>
                        <div className="w-[30%]">
                          <p>
                            Total Amount :<b> {formatINRCurrency(Number(loanDetails[index]?.refLoanAmount))}</b>{' '}
                          </p>
                        </div>
                        <div className="w-[30%]">
                          <p>
                            Balance Amount :<b> {formatINRCurrency(Number(loanDetails[index]?.refBalanceAmt))}</b>{' '}
                          </p>
                        </div>
                        {!rePaymentInfo[index] ? (
                          <div className="w-[10%]">
                            <BsInfoCircle
                              size={'1.5rem'}
                              color="blue"
                              onClick={() => toggleRepaymentInfo(index)}
                            />
                          </div>
                        ) : (
                          <div className="w-[10%]">
                            <IoCloseCircleOutline
                              size={'1.7rem'}
                              color="red"
                              onClick={() => toggleRepaymentInfo(index)}
                            />
                          </div>
                        )}
                      </div>
                      {rePaymentInfo[index] && (
                        <>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>
                                Loan Duration :{' '}
                                <b>
                                  {loanDetails[index]?.refProductDuration}{' '}
                                  {loanDetails[index]?.refProductDurationType === 1
                                    ? 'Months'
                                    : loanDetails[index]?.refProductDurationType === 2
                                      ? 'Weeks'
                                      : 'Days'}
                                </b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Interest : <b>{loanDetails[index]?.refProductInterest} %</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Re-Payment Type :{' '}
                                <b>{loanDetails[index]?.refRepaymentTypeName}</b>{' '}
                              </p>
                            </div>
                          </div>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>
                                Interest Paid Initial :{' '}
                                <b>{loanDetails[index]?.isInterestFirst === true ? 'Yes' : 'No'}</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                No of{' '}
                                {loanDetails[index]?.refProductDurationType === 1
                                  ? 'Months'
                                  : loanDetails[index]?.refProductDurationType === 2
                                    ? 'Weeks'
                                    : 'Days'}{' '}
                                Paid First :{' '}
                                <b>
                                  {loanDetails[index]?.refInterestMonthCount}{' '}
                                  {loanDetails[index]?.refProductDurationType === 1
                                    ? 'Months'
                                    : loanDetails[index]?.refProductDurationType === 2
                                      ? 'Weeks'
                                      : 'Days'}
                                </b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Initial Interest :{' '}
                                <b> {formatINRCurrency(Number(loanDetails[index]?.refInitialInterest))}</b>{' '}
                              </p>
                            </div>
                          </div>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>
                                Loan Get Date : <b>{loanDetails[index]?.refLoanStartDate}</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Loan Start{' '}
                                {loanDetails[index]?.refProductDurationType === 1
                                  ? 'Months'
                                  : loanDetails[index]?.refProductDurationType === 2
                                    ? 'Weeks'
                                    : 'Days'}{' '}
                                :{' '}
                                <b>
                                  {loanDetails[index].refRepaymentStartDate
                                    ? formatToFirstOfMonth(loanDetails[index].refRepaymentStartDate)
                                    : ' -'}
                                </b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Loan End{' '}
                                {loanDetails[index]?.refProductDurationType === 1
                                  ? 'Months'
                                  : loanDetails[index]?.refProductDurationType === 2
                                    ? 'Weeks'
                                    : 'Days'}{' '}
                                : <b>{loanDetails[index]?.refLoanDueDate}</b>
                              </p>
                            </div>
                          </div>

                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>
                                Total Interest Paid :{' '}
                                <b>{formatINRCurrency(Number(loanDetails[index]?.totalInterest))}</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Total Principal Paid :{' '}
                                <b>{formatINRCurrency(Number(loanDetails[index]?.totalPrincipal))}</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Loan Status :{' '}
                                <b>
                                  {loanDetails[index]?.refLoanStatus?.charAt(0).toUpperCase() +
                                    loanDetails[index]?.refLoanStatus?.slice(1)}
                                </b>
                              </p>
                            </div>
                          </div>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>
                                Documentation Fees :{' '}
                                <b>
                                 
                                  {formatINRCurrency(Number(loanDetails[index]?.refDocFee === null
                                    ? 0.0
                                    : loanDetails[index]?.refDocFee))}
                                </b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Security :{' '}
                                <b>
                                  {' '}
                                  {loanDetails[index]?.refSecurity === null
                                    ? 'No Security Provide'
                                    : loanDetails[index]?.refSecurity}
                                </b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Loan Closing Balance :{' '}
                                <b>
                                  
                                  {formatINRCurrency(Number(loanDetails[index]?.loanClosingBalance === null
                                    ? 0.0
                                    : loanDetails[index]?.loanClosingBalance))}
                                </b>
                              </p>
                            </div>
                          </div>
                          <Divider />
                        </>
                      )}
                    </div>
                    <div className="m-2 border-1 shadow-md border-[#c7c7c7ef]">
                      <LoanAudit loanId={item.refLoanId} />
                    </div>
                  </>
                ))}
              </>
            </TabPanel>
            {loanStatus === 'opened' && (
              <TabPanel header="Loan Closing">
                <CloseLoan id={id} LoanId={loanNo} goToHistoryTab={() => setActiveIndex(0)} />
              </TabPanel>
            )}
          </TabView>
        </>
      )}
    </>
  )
}

export default Addnewloan
