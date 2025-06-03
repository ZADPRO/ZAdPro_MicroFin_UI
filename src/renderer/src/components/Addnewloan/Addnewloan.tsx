import axios from 'axios'
import { TabPanel, TabView } from 'primereact/tabview'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
// import { InputText } from "primereact/inputtext";
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { Slide, toast, ToastContainer } from 'react-toastify'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import LoanAudit from '../LoanAudit/LoanAudit'
import { BsInfoCircle } from 'react-icons/bs'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { Divider } from 'primereact/divider'
import CreateNewLoan from '../CreateNewLoan/CreateNewLoan'
import CloseLoan from '../CloseLoan/CloseLoan'

interface loanType {
  name: string
  code: number
}

const Addnewloan = ({ custId, id, closeSidebarUpdate, loanNo }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleBack = () => {
    closeSidebarUpdate()
  }

  const [selectedLoanType, setLoanType] = useState<loanType | null>({ name: 'New Loan', code: 1 })
  const loanType: loanType[] = [
    { name: 'New Loan', code: 1 },
    { name: 'Top Up', code: 2 },
    { name: 'Extension', code: 3 }
  ]

  const [addLoanOption, setAddLoanOption] = useState([])
  const [selectLoanOption, setSelectLoanOption] = useState([])

  const [loading, setLoading] = useState(true)
  const [newLoading, setNewLoading] = useState(false)

  const [allBankAccountList, setAllBankAccountList] = useState([])
  const [productList, setProductList]: any = useState([])

  const [loanData, setLoadData] = useState<any>([])
  const [loanStatus, setLoanStatus] = useState<string>()

  const [addInputs, setAddInputs] = useState({
    productId: '',
    productInterest: '',
    productDuration: '',
    refLoanAmount: null,
    refrepaymentStartDate: null,
    refPaymentType: '',
    refLoanStatus: 'opened',
    refBankId: '',
    refisInterest: false,
    refLoanBalance: 0,
    refInterestMonth: 0
  })

  const paymentType = [
    {
      label: 'Bank',
      id: 'bank'
    },
    {
      label: 'Cash',
      id: 'cash'
    }
  ]

  const getLoanData = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminRoutes/getLoan',
        {
          userId: id
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
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log(data)
          setLoading(false)

          setLoadData(data.loanData)

          setAllBankAccountList(data.allBankAccountList)
          const productList = data.productList
          data.productList.map((data, index) => {
            const name = `Name : ${data.refProductName} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`
            productList[index] = { ...productList[index], refProductName: name }
          })
          setProductList(productList)
        }
      })
  }

  useEffect(() => {
    // getLoanData()
    getLoanDatas(id)
  }, [activeIndex])

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setError({
      status: false,
      message: ''
    })

    if (name === 'productId') {
      setAddInputs({
        ...addInputs,
        [name]: value,
        ['productInterest']: productList.find((product: any) => product.refProductId === value)
          ?.refProductInterest,
        ['productDuration']: productList.find((product: any) => product.refProductId === value)
          ?.refProductDuration,
        ['refLoanAmount']: null,
        ['refisInterest']: false,
        ['refLoanBalance']: 0
      })
    } else {
      setAddInputs({
        ...addInputs,
        [name]: value
      })
    }
  }

  const submitAddLoan = () => {
    setNewLoading(true)

    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminRoutes/addLoan',
        {
          refProductId: addInputs.productId,
          refLoanAmount: addInputs.refLoanAmount,
          refPayementType: addInputs.refPaymentType,
          refRepaymentStartDate: addInputs.refrepaymentStartDate,
          refLoanStatus: 1,
          refBankId: addInputs.refBankId,
          refLoanBalance: addInputs.refLoanBalance,
          isInterestFirst: addInputs.refisInterest,
          interest:
            (parseFloat(addInputs.productInterest) / 100) *
            (addInputs.refLoanAmount ? addInputs.refLoanAmount : 0),
          userId: id,
          refLoanExt: selectedLoanType?.code,
          refExLoanId: selectedLoanType?.code === 1 ? null : selectLoanOption
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
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          console.log(data)

          setNewLoading(false)

          toast.success('Successfully Loan Added', {
            position: 'top-right',
            autoClose: 2999,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Slide
          })

          setAddInputs({
            productId: '',
            productInterest: '',
            productDuration: '',
            refLoanAmount: null,
            refrepaymentStartDate: null,
            refPaymentType: '',
            refLoanStatus: 'opened',
            refBankId: '',
            refisInterest: false,
            refLoanBalance: 0,
            refInterestMonth: 0
          })

          setActiveIndex(0)

          getLoanData()
        } else {
          console.log(data)

          setNewLoading(false)
          setError({
            status: true,
            message: data.error
          })
        }
      })
  }

  const [error, setError] = useState({ status: false, message: '' })
  const [rePaymentInfo, setRePaymentInfo] = useState({})
  const toggleRepaymentInfo = (index) => {
    setRePaymentInfo((prev) => ({
      ...prev,
      [index]: !prev[index] // toggle only this index
    }))
  }

  const isInterestAmount = (rowData: any) => {
    return <>{rowData.isInterestFirst ? 'Yes' : 'No'}</>
  }

  const Status = (rowData: any) => {
    return (
      <>
        {rowData.refLoanStatus.charAt(0).toUpperCase() +
          rowData.refLoanStatus.slice(1).toLowerCase()}
      </>
    )
  }

  const [filter, setFilter] = useState('all')

  const filterOption = [
    { label: 'All Loan', value: 'all' },
    { label: 'Loan Opened', value: 'opened' },
    { label: 'Loan Closed', value: 'closed' },
    { label: 'Loan Extended', value: 'extended' },
    { label: 'Loan Top Up', value: 'topup' }
  ]

  const filteredLoanData =
    filter === 'all' ? loanData : loanData.filter((loan: any) => loan.refLoanStatus === filter)

  const [loanDetails, setLoanDetails] = useState<any>([])

  const getLoanDatas = async (loanId: any) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/rePayment/loanDetails',
          {
            loanId: loanId
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
    }
  }
  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString)

    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0') // months are 0-indexed
    const day = '01'

    return `${year}-${month}-${day}`
  }

  const loanOptions = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/adminRoutes/addLoanOption',
        {
          userId: id
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
        localStorage.setItem('token', 'Bearer ' + data.token)

        if (data.success) {
          const options = data.data.map((data: any) => ({
            label: `Loan Amt : ${data.refLoanAmount} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`,
            value: data.refLoanId
          }))
          setAddLoanOption(options)
        }
      })
  }

  return (
    <>
      <ToastContainer />
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
                            Total Amount :<b> &#8377; {loanDetails[index]?.refLoanAmount}</b>{' '}
                          </p>
                        </div>
                        <div className="w-[30%]">
                          <p>
                            Balance Amount :<b> &#8377; {loanDetails[index]?.refBalanceAmt}</b>{' '}
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
                                <b>₹ {loanDetails[index]?.refInitialInterest}</b>{' '}
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
                                <b>&#8377; {loanDetails[index]?.totalInterest}</b>
                              </p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Total Principal Paid :{' '}
                                <b>&#8377; {loanDetails[index]?.totalPrincipal}</b>
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
                                  &#8377;{' '}
                                  {loanDetails[index]?.refDocFee === null
                                    ? 0.0
                                    : loanDetails[index]?.refDocFee}
                                </b>
                              </p>
                            </div>
                            <div className="w-[60%]">
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
