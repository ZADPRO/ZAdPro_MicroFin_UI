import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import data from '../../assets/testData.json'

interface ReportData {
  area: string
  loanId: string
  userId: string
  dueDate: string
  userName: string
  jointName: string
  loanAmt: string
  interest: string
  duration: string
  paidDue: string
  unPaidDue: string
  paidAmt: string
  balanceAmt: string
  dueAmt: string
  cashAmt: string
  bankAmt: string
  bankId: string
  collectedDate: string
}

const RePaymentReport: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([])

  useEffect(() => {
    const sorted = [...data].sort((a, b) => a.area.localeCompare(b.area))
    setReportData(sorted)
  }, [])

  const formatINR = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    })
  }

  const areaHeaderTemplate = (data: ReportData) => (
    <div className="flex items-center p-0 bg-blue-100 font-semibold text-blue-800 rounded">
      {data.area}
    </div>
  )

  const areaFooterTemplate = (data: ReportData) => {
    const entries = reportData.filter((entry) => entry.area === data.area)

    const sumField = (field: keyof ReportData) =>
      entries.reduce((sum, entry) => sum + parseFloat(entry[field] || '0'), 0)

    return (
      <>
        <td></td>
        <td colSpan={2} className="text-right font-semibold">
          Total for {data.area}:
        </td>
        <td className="text-right font-semibold">{formatINR(sumField('loanAmt'))}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td className="text-right font-semibold">{formatINR(sumField('paidAmt'))}</td>
        <td className="text-right font-semibold">{formatINR(sumField('balanceAmt'))}</td>
        <td className="text-right font-semibold">{formatINR(sumField('dueAmt'))}</td>
        <td colSpan={5}></td>
      </>
    )
  }

  const exportPDF = () => {
    const doc = new jsPDF('landscape')
    const grouped = reportData.reduce(
      (acc, item) => {
        if (!acc[item.area]) acc[item.area] = []
        acc[item.area].push(item)
        return acc
      },
      {} as Record<string, ReportData[]>
    )

    const now = new Date()
    const reportDate = now.toLocaleDateString('en-GB')
    const reportTitleDate = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString(
      'en-GB'
    )

    // Title
    doc.setFontSize(10)
    doc.text('Sri Murugan Thunai', 140, 10, { align: 'center' })
    doc.setFontSize(14)
    doc.text('OM MURUGA FINANCE', 140, 16, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Monthly installment O/S Collection list as of ${reportTitleDate}`, 140, 22, {
      align: 'center'
    })
    doc.text(`Date : ${reportDate}`, 10, 10)
    doc.text('Page : 1', 270, 10)

    let y = 30
    Object.entries(grouped).forEach(([area, records]) => {
      doc.setFontSize(11)
      doc.text(`${area} - Monthly Installment`, 14, y)
      y += 4

      // 1️⃣ DATA TABLE WITH GRID STYLE
      autoTable(doc, {
        head: [
          [
            'S.No',
            'Loan No',
            'Loan Dt',
            'Loan Amount',
            'Borrower Name',
            'Joint Name',
            'Due',
            'Rcd',
            'Bal',
            'Due Amt',
            'Rcd Amt',
            'Balance',
            'Amt Rcd Now'
          ]
        ],
        body: records.map((row, i) => [
          `${i + 1}`,
          row.loanId,
          row.dueDate,
          parseFloat(row.loanAmt).toLocaleString('en-IN'),
          row.userName,
          row.jointName,
          row.paidDue,
          row.unPaidDue,
          (parseInt(row.paidDue || '0') + parseInt(row.unPaidDue || '0')).toString(),
          parseFloat(row.dueAmt).toLocaleString('en-IN'),
          parseFloat(row.paidAmt).toLocaleString('en-IN'),
          parseFloat(row.balanceAmt).toLocaleString('en-IN'),
          parseFloat(row.cashAmt).toLocaleString('en-IN')
        ]),
        startY: y,
        styles: {
          fontSize: 8,
          halign: 'center'
        },
        headStyles: {
          fillColor: [248, 248, 248], // ✅ white background
          textColor: [0, 0, 0], // ✅ black text
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        theme: 'grid', // ✅ show border/grid lines
        didDrawPage: (d) => {
          if (d.cursor) y = d.cursor.y // ✅ NO EXTRA GAP
        }
      })

      // 2️⃣ TOTAL ROW RIGHT BELOW THE GRID
      const sumField = (field: keyof ReportData) =>
        records.reduce((sum, r) => sum + parseFloat(r[field] || '0'), 0)

      autoTable(doc, {
        body: [
          [
            'Total',
            '',
            '',
            sumField('loanAmt').toLocaleString('en-IN'),
            '',
            '',
            '',
            '',
            '',
            sumField('dueAmt').toLocaleString('en-IN'),
            sumField('paidAmt').toLocaleString('en-IN'),
            sumField('balanceAmt').toLocaleString('en-IN'),
            sumField('cashAmt').toLocaleString('en-IN')
          ]
        ],
        startY: y, // ✅ right after previous table
        styles: {
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 2,
          fillColor: [248, 248, 248]
        },
        margin: { left: 14, right: 14 },

        theme: 'plain', // ✅ clean total row without new borders
        tableLineWidth: 0
      })

      y += 10
    })

    doc.save('Repayment_Report.pdf')
  }

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Repayment Report (Grouped by Area)</h2>
        <Button label="Export PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportPDF} />
      </div>

      <DataTable
        value={reportData}
        rowGroupMode="subheader"
        groupRowsBy="area"
        sortMode="single"
        sortField="area"
        sortOrder={1}
        scrollable
        scrollHeight="500px"
        showGridlines
        size="small"
        rowGroupHeaderTemplate={areaHeaderTemplate}
        rowGroupFooterTemplate={areaFooterTemplate}
      >
        <Column field="loanId" header="Loan_ID" />
        <Column field="userName" header="User_Name" />
        <Column field="jointName" header="Joint_Name" />
        <Column field="loanAmt" header="Loan_Amount" body={(row) => formatINR(row.loanAmt)} />
        <Column field="interest" header="Interest" body={(row) => formatINR(row.interest)} />
        <Column field="duration" header="Duration" />
        <Column field="paidDue" header="Paid_Due" />
        <Column field="unPaidDue" header="Unpaid_Due" />
        <Column field="paidAmt" header="Paid_Amount" body={(row) => formatINR(row.paidAmt)} />
        <Column
          field="balanceAmt"
          header="Balance_Amount"
          body={(row) => formatINR(row.balanceAmt)}
        />
        <Column field="dueAmt" header="Due_Amount" body={(row) => formatINR(row.dueAmt)} />
        <Column field="cashAmt" header="Cash_Amount" />
        <Column field="bankAmt" header="Bank_Amount" />
        <Column field="bankId" header="Bank_ID" />
        <Column field="dueDate" header="Due_Date" />
        <Column field="collectedDate" header="Collected_Date" />
      </DataTable>
    </div>
  )
}

export default RePaymentReport
