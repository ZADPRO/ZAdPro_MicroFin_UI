import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import decrypt from '../Helper/Helper'
import { BsFiletypeCsv } from 'react-icons/bs'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Calendar } from 'primereact/calendar'
import { Nullable } from 'primereact/ts-helpers'
import { formatINRCurrency } from '@renderer/helper/amountFormat'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BsFiletypePdf } from 'react-icons/bs'
interface ExpenseDetails {
  refAccountTypeName: string
  refAmount: string
  refBankId: number
  refBankName: string
  refCategoryId: number
  refExpenseCategory: string
  refExpenseDate: string
  refExpenseId: number
  refSubCategory: string
  refVoucherNo: string
}

export default function ExpenseReport() {
  const dt = useRef<any>(null)

  const [startDate, setStartDate] = useState<Nullable<Date>>(null)

  const [overAllData, setOverAllData] = useState<ExpenseDetails[]>([])

  function formatToYearMonth(dateInput: string | Date): string {
    const date = new Date(dateInput)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${year}-${month}`
  }

  const getData = (month) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/report/expenseReport',
          {
            month: formatToYearMonth(month)
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
    getData(new Date())
  }, [])

  const exportCustomCSV = () => {
    const headers = ['S.No', 'Date', 'Expense', 'Category', 'Amount', 'Amount Source', 'Type']

    const rows = overAllData.map((row, index) => [
      index + 1,
      row.refExpenseDate,
      row.refExpenseCategory,
      row.refSubCategory,
      `INR ${row.refAmount}`,
      row.refBankName,
      row.refAccountTypeName
    ])

    const csvContent = [
      headers.join(','), // header row
      ...rows.map((row) => row.map((value) => `"${value}"`).join(',')) // data rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `Monthly Expense Report for (${formatToYearMonth(startDate || new Date())}).csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // const exportCustomPDF = () => {
  //   const doc = new jsPDF('landscape')

  //   const now = new Date()
  //   const reportDate = now.toLocaleDateString('en-GB')

  //   // ✅ Title
  //   // doc.setFontSize(10)
  //   // doc.text('Sri Murugan Thunai', 140, 10, { align: 'center' })
  //   doc.setFontSize(14)
  //   doc.text('Za Micro-Fi', 140, 16, { align: 'center' })
  //   doc.setFontSize(10)
  //   doc.text(`Expense Report`, 140, 22, { align: 'center' })
  //   doc.text(`Date : ${reportDate}`, 10, 10)
  //   doc.text('Page : 1', 270, 10)

  //   // ✅ Table
  //   autoTable(doc, {
  //     head: [
  //       ['S.No', 'Date', 'Voucher Id', 'Expense', 'Category', 'Amount', 'Amount Source', 'Type']
  //     ],
  //     body: overAllData.map((row, i) => [
  //       i + 1,
  //       row.refExpenseDate,
  //       row.refVoucherNo,
  //       row.refExpenseCategory,
  //       row.refSubCategory,
  //       `INR ${Number(row.refAmount).toLocaleString('en-IN')}`,
  //       row.refBankName,
  //       row.refAccountTypeName
  //     ]),
  //     styles: { fontSize: 8, halign: 'center' },
  //     headStyles: {
  //       fillColor: [248, 248, 248],
  //       textColor: [0, 0, 0],
  //       fontStyle: 'bold'
  //     },
  //     margin: { left: 14, right: 14 },
  //     theme: 'grid',
  //     startY: 30
  //   })

  //   doc.save(`Monthly_Expense_Report_${formatToYearMonth(startDate || new Date())}.pdf`)
  // }

  const exportCustomPDF = () => {
    const doc = new jsPDF('landscape')
    const now = new Date()
    const reportDate = now.toLocaleDateString('en-GB')

    // ✅ Title
    doc.setFontSize(14)
    doc.text('Za Micro-Fi', 140, 16, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Expense Report`, 140, 22, { align: 'center' })
    doc.text(`Date : ${reportDate}`, 10, 10)
    doc.text('Page : 1', 270, 10)

    // ✅ Group by Expense Category
    const grouped = overAllData.reduce(
      (acc, row) => {
        if (!acc[row.refExpenseCategory]) acc[row.refExpenseCategory] = []
        acc[row.refExpenseCategory].push(row)
        return acc
      },
      {} as Record<string, typeof overAllData>
    )

    let y = 30
    let finalTotal = 0

    Object.entries(grouped).forEach(([category, records]) => {
      // ✅ Table for this category
      autoTable(doc, {
        head: [
          ['S.No', 'Date', 'Voucher Id', 'Expense', 'Category', 'Amount', 'Amount Source', 'Type']
        ],
        body: records.map((row, i) => [
          i + 1,
          row.refExpenseDate,
          row.refVoucherNo,
          row.refExpenseCategory,
          row.refSubCategory,
          `INR ${Number(row.refAmount).toLocaleString('en-IN')}`,
          row.refBankName,
          row.refAccountTypeName
        ]),
        styles: { fontSize: 8, halign: 'center' },
        headStyles: {
          fillColor: [248, 248, 248],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        startY: y,
        didDrawPage: (d) => {
          if (d.cursor) y = d.cursor.y
        }
      })

      // ✅ Subtotal for this category
      const subtotal = records.reduce((sum, r) => sum + Number(r.refAmount), 0)
      finalTotal += subtotal

      autoTable(doc, {
        body: [
          [
            {
              content: `Subtotal (${category})`,
              colSpan: 5,
              styles: { halign: 'right', fontStyle: 'bold' }
            },
            {
              content: `INR ${subtotal.toLocaleString('en-IN')}`,
              colSpan: 3,
              styles: { halign: 'center', fontStyle: 'bold' }
            }
          ]
        ],
        startY: y + 2,
        styles: { fontSize: 9, halign: 'center' },
        theme: 'plain',
        margin: { left: 14, right: 14 },
        tableLineWidth: 0,
        didDrawPage: (d) => {
          if (d.cursor) y = d.cursor.y
        }
      })

      y += 10
    })

    // ✅ Final Total
    autoTable(doc, {
      body: [
        [
          { content: 'Grand Total', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          {
            content: `INR ${finalTotal.toLocaleString('en-IN')}`,
            colSpan: 3,
            styles: { halign: 'center', fontStyle: 'bold' }
          }
        ]
      ],
      startY: y + 5,
      styles: { fontSize: 10, halign: 'center', fontStyle: 'bold' },
      theme: 'plain',
      margin: { left: 14, right: 14 },
      tableLineWidth: 0
    })

    doc.save(`Monthly_Expense_Report_${formatToYearMonth(startDate || new Date())}.pdf`)
  }

  return (
    <div>
      <div>
        <p className="text-[1.3rem] font-bold">Expense Report</p>
        
      </div>
      <div className="w-full flex align-items-center justify-center">
        <div className="w-[90%] flex align-items-center justify-start my-2">
          <div className="flex flex-col w-[30%]">
            <Calendar
              value={startDate}
              placeholder="Select Start Range"
              onChange={(e) => {
                setStartDate(e.value)
                getData(e.value)
              }}
              view="month"
              dateFormat="mm/yy"
              maxDate={new Date()}
            />
          </div>
        </div>

        <div className="w-[10%] flex align-items-center justify-center">
          <button
            className=" bg-[green] p-2 hover:bg-[white] border-2 hover:text-[green] text-[white] rounded-md"
            onClick={exportCustomCSV}
          >
            <BsFiletypeCsv className="text-[2rem]  " />
          </button>
          <button
            className=" bg-[red] p-2 hover:bg-[white] border-2 hover:text-[red] text-[white] rounded-md"
            onClick={exportCustomPDF}
          >
            <BsFiletypePdf className="text-[2rem]  " />
          </button>
        </div>
      </div>

      <div>
        <DataTable
          value={overAllData}
          className="mt-4"
          showGridlines
          ref={dt}
          size="small"
          stripedRows
          scrollable
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
          <Column field="refExpenseDate" header="Date" style={{ minWidth: '7rem' }} />
          <Column field="refVoucherNo" header="Voucher Id" style={{ minWidth: '8rem' }} />
          <Column field="refExpenseCategory" header="Expense" style={{ minWidth: '12rem' }} />
          <Column field="refSubCategory" header="Category" style={{ minWidth: '12rem' }} />
          <Column
            header="Amount"
            body={(rowData) => {
              return ` ${formatINRCurrency(Number(rowData.refAmount))}`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Amount Source"
            body={(rowData) => {
              return ` ${rowData.refBankName}`
            }}
            style={{ minWidth: '9rem' }}
          />
          <Column
            header="Type"
            body={(rowData) => {
              return ` ${rowData.refAccountTypeName}`
            }}
            style={{ minWidth: '11rem' }}
          />
        </DataTable>
      </div>
    </div>
  )
}
