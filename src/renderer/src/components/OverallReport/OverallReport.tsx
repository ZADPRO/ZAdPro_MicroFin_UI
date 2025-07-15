import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import decrypt from '../Helper/Helper'
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { LiaFileDownloadSolid } from 'react-icons/lia'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'
// import * as XLSX from 'xlsx'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable' // ✅ named import
interface option {
  label: string
  value: number
}

interface LoanDetails {
  BalancePrincipalAmount: string
  InterestPaidCount: string
  PrincipalPaidCount: string
  TotalInterestPaid: string
  TotalMonthPaidCount: string
  TotalPrincipalPaid: string
  UnPaidMonthCount: string
  refCustLoanId: number
  refDocFee: string | null
  refInitialInterest: string
  refInterestMonthCount: number
  refLoanAmount: string
  refLoanStartDate: string
  refLoanStatus: string
  refProductDuration: string
  refProductInterest: string
  refRepaymentTypeName: string
  refSecurity: string | null
  refUserEmail: string
  refUserFname: string
  refUserId: number
  refUserLname: string
  refUserMobileNo: string
  refAreaName: string
  refAreaPrefix: string
}

export default function OverallReport() {
  const dt = useRef<any>(null)
  const [repaymentOption, setRepaymentOption] = useState<option[]>([])
  const [areaList, setAreaList] = useState<option[]>([])
  const [selectedArea, setSelectedArea] = useState<number[]>([])
  const [statusOption, setStatusOption] = useState<option[]>([])
  const [selectedRePaymentOption, setSelectedRePaymentOption] = useState<number[]>([])
  const [selectedStatusOption, setSelectedStatusOption] = useState<number[]>([])
  const [repaymentError, setRepaymentError] = useState(false)
  const [AreaError, setAreaError] = useState<boolean>(false)
  const [statusError, setStatusError] = useState(false)
  const [overAllData, setOverAllData] = useState<LoanDetails[]>([])
  const [selectedLoanOption, setSelectedLoanOption] = useState<number>(1)
  const [showOptions, setShowOptions] = useState(false)
  // const headers = [
  //   'S.No',
  //   'Loan Id',
  //   'Date',
  //   'Name',
  //   'Mobile',
  //   'Area',
  //   'Repayment',
  //   'Loan Amount',
  //   'Initial Interest',
  //   'Interest First',
  //   'Loan Interest',
  //   'Loan Duration',
  //   'Total Principal Paid',
  //   'Total Interest Paid',
  //   'Balance Amount',
  //   'Interest Paid',
  //   'Principal Paid',
  //   'Total Month Paid',
  //   'Un-Paid Month',
  //   'Loan Status',
  //   'Document Fee',
  //   'Security'
  // ]
  // const generateRows = () =>
  //   overAllData.map((row, index) => [
  //     index + 1,
  //     row.refCustLoanId,
  //     row.refLoanStartDate,
  //     `${row.refUserFname} ${row.refUserLname}`,
  //     row.refUserMobileNo,
  //     `${row.refAreaName} - [${row.refAreaPrefix}]`,
  //     row.refRepaymentTypeName,
  //     `INR ${row.refLoanAmount}`,
  //     `INR ${row.refInitialInterest}`,
  //     `${row.refInterestMonthCount} Month`,
  //     `${row.refProductInterest} %`,
  //     `${row.refProductDuration} Month`,
  //     `INR ${row.TotalPrincipalPaid}`,
  //     `INR ${row.TotalInterestPaid}`,
  //     `INR ${row.BalancePrincipalAmount}`,
  //     `${row.InterestPaidCount} Month`,
  //     `${row.PrincipalPaidCount} Month`,
  //     `${row.TotalMonthPaidCount} Month`,
  //     `${row.UnPaidMonthCount} Month`,
  //     `${row.refLoanStatus}`,
  //     `INR ${row.refDocFee === null ? 0 : row.refDocFee}`,
  //     `${row.refSecurity === null ? 'No Document' : row.refSecurity}`
  //   ])
  // const generateRows = () =>
  //   overAllData.map((row, index) => [
  //     index + 1,
  //     row.refCustLoanId,
  //     row.refLoanStartDate,
  //     `${row.refUserFname} ${row.refUserLname}`,
  //     row.refUserMobileNo,
  //     `${row.refAreaPrefix}`,
  //     row.refRepaymentTypeName,
  //     `${row.refLoanAmount}`,
  //     `${row.refInitialInterest}`,
  //     `${row.refInterestMonthCount}`,
  //     `${row.refProductInterest} %`,
  //     `${row.refProductDuration}`,
  //     `${row.TotalPrincipalPaid}`,
  //     `${row.TotalInterestPaid}`,
  //     `${row.BalancePrincipalAmount}`,
  //     `${row.InterestPaidCount}`,
  //     `${row.PrincipalPaidCount}`,
  //     `${row.TotalMonthPaidCount}`,
  //     `${row.UnPaidMonthCount}`,
  //     `${row.refLoanStatus}`,
  //     `${row.refDocFee === null ? 0 : row.refDocFee}`,
  //     `${row.refSecurity === null ? 'No Document' : row.refSecurity}`
  //   ])
  const LoanOption: option[] = [
    { label: 'Customer Loan', value: 1 },
    { label: 'Admin Loan', value: 2 }
  ]
  const getOptions = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/report/overAllReportOption', {
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
            const options1: option[] = data.rePayment.map((item: any) => ({
              label: item.refRepaymentTypeName,
              value: item.refRepaymentTypeId
            }))
            setRepaymentOption(options1)
            setSelectedRePaymentOption(options1.map((opt) => opt.value))

            const options2: option[] = data.status.map((item: any) => ({
              label: item.refLoanStatus,
              value: item.refLoanStatusId
            }))
            setStatusOption(options2)
            setSelectedStatusOption(options2.map((opt) => opt.value))
            const options3: option[] = data.areaList.map((item: any) => ({
              label: `${item.refAreaName} - [${item.refAreaPrefix}]`,
              value: item.refAreaId
            }))
            setAreaList(options3)
            setSelectedArea(options3.map((opt) => opt.value))
            getData(
              selectedLoanOption,
              options1.map((opt) => opt.value),
              options2.map((opt) => opt.value),
              options3.map((opt) => opt.value)
            )
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const getData = (
    loanOp: number,
    rePayment: number[] | [],
    status: number[] | [],
    area: number[] | []
  ) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/report/overAllReport',
          {
            rePaymentType: rePayment,
            loanStatus: status,
            loanOption: loanOp,
            area: area
          },
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
            console.log('data line ------- 90', data)
            setOverAllData(data.data)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }
  useEffect(() => {
    getOptions()
  }, [])

  const exportCustomCSV = () => {
    const headers = [
      'S.No',
      'Loan Id',
      'Date',
      'Name',
      'Mobile',
      'Area',
      'Repayment',
      'Loan Amount',
      'Initial Interest',
      'Interest First',
      'Loan Interest',
      'Loan Duration',
      'Total Principal Paid',
      'Total Interest Paid',
      'Balance Amount',
      'Interest Paid',
      'Principal Paid',
      'Total Month Paid',
      'Un-Paid Month',
      'Loan Status',
      'Document Fee',
      'Security'
    ]

    const rows = overAllData.map((row, index) => [
      index + 1,
      row.refCustLoanId,
      row.refLoanStartDate,
      `${row.refUserFname} ${row.refUserLname}`,
      row.refUserMobileNo,
      `${row.refAreaName} - [${row.refAreaPrefix}]`,
      row.refRepaymentTypeName,
      `INR ${row.refLoanAmount}`,
      `INR ${row.refInitialInterest}`,
      `${row.refInterestMonthCount} Month`,
      `${row.refProductInterest} %`,
      `${row.refProductDuration} Month`,
      `INR ${row.TotalPrincipalPaid}`,
      `INR ${row.TotalInterestPaid}`,
      `INR ${row.BalancePrincipalAmount}`,
      `${row.InterestPaidCount} Month`,
      `${row.PrincipalPaidCount} Month`,
      `${row.TotalMonthPaidCount} Month`,
      `${row.UnPaidMonthCount} Month`,
      `${row.refLoanStatus}`,
      `INR ${row.refDocFee === null ? 0 : row.refDocFee}`,
      `${row.refSecurity === null ? 'No Document' : row.refSecurity}`
    ])

    const csvContent = [
      headers.join(','), // header row
      ...rows.map((row) => row.map((value) => `"${value}"`).join(',')) // data rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Over All Report (${new Date()}).csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // const exportAsCSV = () => {
  //   const csvContent = [
  //     headers.join(','),
  //     ...generateRows().map((row) => row.map((val) => `"${val}"`).join(','))
  //   ].join('\n')

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  //   const url = URL.createObjectURL(blob)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = `OverAllReport_${new Date().toISOString()}.csv`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }

  // const exportAsExcel = () => {
  //   const ws = XLSX.utils.aoa_to_sheet([headers, ...generateRows()])
  //   const wb = XLSX.utils.book_new()
  //   XLSX.utils.book_append_sheet(wb, ws, 'Report')
  //   XLSX.writeFile(wb, `OverAllReport_${new Date().toISOString()}.xlsx`)
  // }

  // const exportAsPDF = () => {
  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'mm',
  //     format: 'a4'
  //   })

  //   doc.text('Over All Report', 14, 10)

  //   autoTable(doc, {
  //     startY: 20,
  //     head: [headers],
  //     body: generateRows(),
  //     styles: { fontSize: 6 }
  //   })

  //   doc.save(`OverAllReport_${new Date().toISOString()}.pdf`)
  // }

  return (
    <div>
      <div>
        <p className="text-[1.3rem] font-bold">Overall Report</p>
      </div>
      <div className="w-full flex align-items-center justify-center">
        <div className="w-[90%] flex justify-around my-0">
          <div className="flex flex-col w-[20%] gap-y-1">
            <label htmlFor="username" className="text-[0.9rem]">
              Select Loan Data of
            </label>
            <Dropdown
              value={selectedLoanOption}
              onChange={(e: DropdownChangeEvent) => {
                setSelectedLoanOption(e.value)
                getData(e.value, selectedRePaymentOption, selectedStatusOption, selectedArea)
              }}
              options={LoanOption}
              optionLabel="label"
              placeholder="Select a Loan"
              className="w-full md:h-2rem text-sm align-items-center" // smaller text, padding
              panelClassName="text-sm"
            />
          </div>
          <div className="flex flex-col w-[20%] gap-y-1">
            <label htmlFor="username" className="text-[0.9rem]">
              Select Area
            </label>
            <MultiSelect
              filter
              value={selectedArea}
              onChange={(e: MultiSelectChangeEvent) => {
                setSelectedArea(e.value)
                setAreaError(e.value.length === 0)
                if (
                  e.value.length !== 0 &&
                  selectedStatusOption?.length !== 0 &&
                  selectedRePaymentOption?.length !== 0
                ) {
                  getData(
                    selectedLoanOption,
                    selectedRePaymentOption,
                    selectedStatusOption,
                    e.value
                  )
                } else {
                  setOverAllData([])
                }
              }}
              options={areaList}
              optionLabel="label"
              placeholder="Select a Repayment Type"
              className="w-full md:h-2rem text-sm align-items-center" // smaller text, padding
              panelClassName="text-sm"
              required
            />
            {AreaError && <small className="text-[red]">Please select at least one Area.</small>}
          </div>
          <div className="flex flex-col w-[28%] gap-y-1">
            <label htmlFor="username" className="text-[0.9rem]">
              Select Loan Type
            </label>
            <MultiSelect
              filter
              value={selectedRePaymentOption}
              onChange={(e: MultiSelectChangeEvent) => {
                setSelectedRePaymentOption(e.value)
                setRepaymentError(e.value.length === 0)
                if (
                  e.value.length !== 0 &&
                  selectedStatusOption?.length !== 0 &&
                  selectedArea?.length !== 0
                ) {
                  getData(selectedLoanOption, e.value, selectedStatusOption, selectedArea)
                } else {
                  setOverAllData([])
                }
              }}
              options={repaymentOption}
              optionLabel="label"
              placeholder="Select a Repayment Type"
              className="w-full md:h-2rem text-sm align-items-center" // smaller text, padding
              panelClassName="text-sm"
              required
            />
            {repaymentError && (
              <small className="text-[red]">Please select at least one repayment type.</small>
            )}
          </div>

          <div className="flex flex-col w-[28%] gap-y-1">
            <label htmlFor="username" className="text-[0.9rem]">
              Select Loan Status
            </label>
            <MultiSelect
              filter
              value={selectedStatusOption}
              onChange={(e: MultiSelectChangeEvent) => {
                setSelectedStatusOption(e.value)
                setStatusError(e.value.length === 0) // true if nothing selected
                if (
                  e.value.length !== 0 &&
                  selectedRePaymentOption?.length !== 0 &&
                  selectedArea?.length !== 0
                ) {
                  getData(selectedLoanOption, selectedRePaymentOption, e.value, selectedArea)
                } else {
                  setOverAllData([])
                }
              }}
              options={statusOption}
              optionLabel="label"
              placeholder="Select a Loan Status"
              className="w-full md:h-2rem text-sm align-items-center" // smaller text, padding
              panelClassName="text-sm"
              required
            />
            {statusError && (
              <small className="text-[red]">Please select at least one loan status.</small>
            )}
          </div>
        </div>

        <div className="w-[10%] flex align-items-end justify-center">
          {!repaymentError && !statusError && (
            <div className="relative inline-block">
              <button
                className=" bg-[green] p-2 hover:bg-[white] border-2 hover:text-[green] text-[white] rounded-md"
                onClick={() => {
                  setShowOptions(!showOptions)
                  exportCustomCSV()
                }}
              >
                <LiaFileDownloadSolid className="text-[2rem]" />
              </button>

              {/* {showOptions && (
                <div className=" w-[15vw] absolute right-0 z-10 bg-white border rounded shadow-md mt-1">
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      exportAsCSV()
                      setShowOptions(false)
                    }}
                  >
                    Download as CSV
                  </button>
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      exportAsExcel()
                      setShowOptions(false)
                    }}
                  >
                    Download as Excel
                  </button>
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      exportAsPDF()
                      setShowOptions(false)
                    }}
                  >
                    Download as PDF
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>

      <div>
        <DataTable
          value={overAllData}
          className="mt-4"
          showGridlines
          ref={dt}
          stripedRows
          scrollable
          size="small"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
          <Column field="refCustLoanId" header="Loan Id" style={{ minWidth: '7rem' }} />
          <Column field="refLoanStartDate" header="Date" style={{ minWidth: '8rem' }} />
          <Column
            body={(rowData) => {
              return `${rowData.refUserFname} ${rowData.refUserLname}`
            }}
            header="Name"
            style={{ minWidth: '13rem' }}
          />
          <Column field="refRName" header="Joint Name" style={{ minWidth: '8rem' }} />
          <Column field="refUserMobileNo" header="Mobile" style={{ minWidth: '8rem' }} />
          <Column
            field="refAreaPrefix"
            body={(rowData) => {
              return (
                <>
                  {rowData.refAreaName} - {rowData.refAreaPrefix}
                </>
              )
            }}
            header="Area Name"
            style={{ minWidth: '8rem' }}
          />
          <Column field="refRepaymentTypeName" header="Repayment" style={{ minWidth: '10rem' }} />
          <Column
            header="Loan Amount"
            body={(rowData) => {
              return `₹ ${rowData.refLoanAmount}`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Initial Interest"
            body={(rowData) => {
              return `₹ ${rowData.refInitialInterest}`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Interest First"
            body={(rowData) => {
              return `${rowData.refInterestMonthCount} Month`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Loan Interest"
            body={(rowData) => {
              return `${rowData.refProductInterest} %`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Loan Duration"
            body={(rowData) => {
              return `${rowData.refProductDuration} Month`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Total Principal Paid"
            body={(rowData) => {
              return `₹ ${rowData.TotalPrincipalPaid}`
            }}
            style={{ minWidth: '12rem' }}
          />
          <Column
            header="Total Interest Paid"
            body={(rowData) => {
              return `₹ ${rowData.TotalInterestPaid}`
            }}
            style={{ minWidth: '12rem' }}
          />
          <Column
            header="Balance Amount"
            body={(rowData) => {
              return `₹ ${rowData.BalancePrincipalAmount}`
            }}
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Interest Paid"
            body={(rowData) => {
              return `${rowData.InterestPaidCount} Month`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Principal Paid"
            body={(rowData) => {
              return `${rowData.PrincipalPaidCount} Month`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Total Month Paid"
            body={(rowData) => {
              return `${rowData.TotalMonthPaidCount} Month`
            }}
            style={{ minWidth: '12rem' }}
          />
          <Column
            header="Un-Paid Month"
            body={(rowData) => {
              return `${rowData.UnPaidMonthCount} Month`
            }}
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Loan Status"
            body={(rowData) => {
              return `${rowData.refLoanStatus}`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Document Fee"
            body={(rowData) => {
              return `₹ ${rowData.refDocFee === null ? 0 : rowData.refDocFee}`
            }}
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Security"
            body={(rowData) => {
              return `${rowData.refSecurity === null ? 'No Document' : rowData.refSecurity}`
            }}
            style={{ minWidth: '9rem' }}
          />
        </DataTable>
      </div>
    </div>
  )
}
