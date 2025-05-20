import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import decrypt from '../Helper/Helper'
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { LiaFileDownloadSolid } from 'react-icons/lia'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'

interface option {
  label: string
  value: number | string
}

interface LoanDetails {
  refCustLoanId: number
  refLoanAmount: string
  refInitialInterest: string
  refInterest: string
  refInterestStatus: string
  refPrincipal: string
  refPrincipalStatus: string
  refLoanStartDate: string // "YYYY-MM-DD"
  refPaymentDate: string // "YYYY-MM"
  refRepaymentTypeName: string
  refUserFname: string
  refUserLname: string
  refUserMobileNo: string
}

export default function MonthlyReport() {
  const dt = useRef<any>(null)
  const [selectedInterestStatusOption, setSelectedInterestStatusOption] = useState<string[]>([
    'Pending',
    'paid'
  ])
  const [selectedPrincipalStatusOption, setSelectedPrincipalStatusOption] = useState<string[]>([
    'Pending',
    'paid'
  ])
  const [startDate, setStartDate] = useState<Nullable<Date>>(null)
  const [endDate, setEndDate] = useState<Nullable<Date>>(null)

  const [repaymentError, setRepaymentError] = useState(false)
  const [statusError, setStatusError] = useState(false)
  const [overAllData, setOverAllData] = useState<LoanDetails[]>([])
  const [selectedLoanOption, setSelectedLoanOption] = useState<number>(1)
  const LoanOption: option[] = [
    { label: 'Customer Loan', value: 1 },
    { label: 'Admin Loan', value: 2 }
  ]
  const loanStatus: option[] = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Paid', value: 'paid' }
  ]

  function formatToYearMonth(dateInput: string | Date): string {
    const date = new Date(dateInput)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Month is 0-indexed
    return `${year}-${month}`
  }

  const getData = (
    loanOp: number,
    interest: string[] | [],
    principal: string[] | [],
    startDate: string | Date,
    endDate: string | Date
  ) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/report/monthlyReport',
          {
            interest: interest,
            principal: principal,
            loanOption: loanOp,
            startDate: formatToYearMonth(startDate),
            endDate: formatToYearMonth(endDate)
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
    setStartDate(new Date())
    setEndDate(new Date())
    getData(
      selectedLoanOption,
      selectedInterestStatusOption,
      selectedPrincipalStatusOption,
      new Date(),
      new Date()
    )
  }, [])

  const exportCustomCSV = () => {
    const headers = [
      'S.No',
      'Loan Id',
      'Date',
      'Re-Payment Month',
      'Name',
      'Mobile',
      'Repayment',
      'Loan Amount',
      'Initial Interest',
      'Monthly Interest',
      'Monthly Principal',
      'Principal Status',
      'Interest Status'
    ]

    const rows = overAllData.map((row, index) => [
      index + 1,
      row.refCustLoanId,
      row.refLoanStartDate,
      row.refPaymentDate,
      `${row.refUserFname} ${row.refUserLname}`,
      row.refUserMobileNo,
      row.refRepaymentTypeName,
      `INR ${row.refLoanAmount}`,
      `INR ${row.refInitialInterest}`,
      `INR ${row.refInterest}`,
      `INR ${row.refPrincipal}`,
      `${row.refPrincipalStatus}`,
      `${row.refInterestStatus}`
    ])

    const csvContent = [
      headers.join(','), // header row
      ...rows.map((row) => row.map((value) => `"${value}"`).join(',')) // data rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Monthly Report (${new Date()}).csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div>
        <p className="text-[1.3rem] font-bold">Overall Report</p>
      </div>
      <div className="w-full flex align-items-center justify-center">
        <div className="w-[90%] flex align-items-center justify-around my-2">
          <div className="flex flex-col w-[18%]">
            <Dropdown
              value={selectedLoanOption}
              onChange={(e: DropdownChangeEvent) => {
                setSelectedLoanOption(e.value)
                getData(
                  e.value,
                  selectedInterestStatusOption,
                  selectedPrincipalStatusOption,
                  startDate || new Date(),
                  endDate || new Date()
                )
              }}
              options={LoanOption}
              optionLabel="label"
              placeholder="Select a Loan"
              className=" w-full"
            />
          </div>
          <div className="flex flex-col w-[18%]">
            <MultiSelect
              filter
              value={selectedInterestStatusOption}
              onChange={(e: MultiSelectChangeEvent) => {
                setSelectedInterestStatusOption(e.value)
                setRepaymentError(e.value.length === 0)
                if (e.value.length !== 0 && selectedPrincipalStatusOption?.length !== 0) {
                  getData(
                    selectedLoanOption,
                    e.value,
                    selectedPrincipalStatusOption,
                    startDate || new Date(),
                    endDate || new Date()
                  )
                } else {
                  setOverAllData([])
                }
              }}
              options={loanStatus}
              optionLabel="label"
              placeholder="Select a Repayment Type"
              className="w-[100%]"
              required
            />
            {repaymentError && (
              <small className="text-[red]">Please select at least one repayment type.</small>
            )}
          </div>
          <div className="flex flex-col w-[18%]">
            <MultiSelect
              filter
              value={selectedPrincipalStatusOption}
              onChange={(e: MultiSelectChangeEvent) => {
                setSelectedPrincipalStatusOption(e.value)
                setStatusError(e.value.length === 0) // true if nothing selected
                if (e.value.length !== 0 && selectedInterestStatusOption?.length !== 0) {
                  getData(
                    selectedLoanOption,
                    selectedInterestStatusOption,
                    e.value,
                    startDate || new Date(),
                    endDate || new Date()
                  )
                } else {
                  setOverAllData([])
                }
              }}
              options={loanStatus}
              optionLabel="label"
              placeholder="Select a Loan Status"
              className="w-[100%]"
              required
            />
            {statusError && (
              <small className="text-[red]">Please select at least one loan status.</small>
            )}
          </div>
          <div className="flex flex-col w-[18%]">
            <Calendar
              value={startDate}
              placeholder="Select Start Range"
              onChange={(e) => {
                setStartDate(e.value)
                if (endDate && e.value && endDate < e.value) {
                  setEndDate(e.value)
                  getData(
                    selectedLoanOption,
                    selectedInterestStatusOption,
                    selectedPrincipalStatusOption,
                    e.value,
                    e.value
                  )
                } else {
                  getData(
                    selectedLoanOption,
                    selectedInterestStatusOption,
                    selectedPrincipalStatusOption,
                    e.value || new Date(),
                    endDate || new Date()
                  )
                }
              }}
              view="month"
              dateFormat="mm/yy"
              maxDate={new Date()}
            />
          </div>
          <div className="flex flex-col w-[18%]">
            <Calendar
              value={endDate}
              placeholder="Select End Range"
              onChange={(e) => {
                setEndDate(e.value)
                getData(
                  selectedLoanOption,
                  selectedInterestStatusOption,
                  selectedPrincipalStatusOption,
                  startDate || new Date(),
                  e.value || new Date()
                )
              }}
              view="month"
              dateFormat="mm/yy"
              minDate={startDate || undefined}
              disabled={!startDate}
              maxDate={new Date()}
            />
          </div>
        </div>

        <div className="w-[10%] flex align-items-center justify-center">
          {!repaymentError && !statusError && (
            <button
              className=" bg-[green] p-2 hover:bg-[white] border-2 hover:text-[green] text-[white] rounded-md"
              onClick={exportCustomCSV}
            >
              <LiaFileDownloadSolid className="text-[2rem]  " />
            </button>
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
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
          <Column field="refCustLoanId" header="Loan Id" style={{ minWidth: '7rem' }} />
          <Column field="refLoanStartDate" header="Date" style={{ minWidth: '8rem' }} />
          <Column field="refPaymentDate" header="Re-Payment Month" style={{ minWidth: '12rem' }} />
          <Column
            body={(rowData) => {
              return `${rowData.refUserFname} ${rowData.refUserLname}`
            }}
            header="Name"
            style={{ minWidth: '13rem' }}
          />
          <Column field="refUserMobileNo" header="Mobile" style={{ minWidth: '8rem' }} />
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
            header="Monthly Interest"
            body={(rowData) => {
              return `₹ ${rowData.refInterest}`
            }}
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Monthly Principal"
            body={(rowData) => {
              return `₹ ${rowData.refPrincipal}`
            }}
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Principal Status"
            field="refPrincipalStatus"
            style={{ minWidth: '11rem' }}
          />
          <Column
            header="Interest Status"
            field="refInterestStatus"
            style={{ minWidth: '11rem' }}
          />
        </DataTable>
      </div>
    </div>
  )
}
