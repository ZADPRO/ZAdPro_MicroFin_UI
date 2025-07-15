import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import axios from 'axios'
import decrypt from '../Helper/Helper'
import { useEffect, useState } from 'react'
import { Panel } from 'primereact/panel'

interface followupData {
  FollowId: number
  Message: string
  date: any
  UpdateAt: any
}
interface AuditData {
  RpayId: number
  LoanId: number
  Month: string
  Interest: number
  Principal: number
  arearsAmt: string
  verifiedPaidAmount: number
  UnVerifiedPaidAmount: number
  followup: followupData[]
  paidInterest: number
  paidPrincipal: number
  dueStatus: boolean | null
}

const LoanAudit = ({ loanId }: { loanId: number }) => {
  const [auditData, setAuditData] = useState<AuditData[]>([])

  const renderFollowup = (rowData: AuditData) => {
    if (
      !rowData.followup ||
      rowData.followup.length === 0 ||
      rowData.followup[0].UpdateAt === null
    ) {
      return <span>No follow-ups</span>
    }

    return (
      <>
        {rowData.followup.map((item, index) => (
          <Panel
            key={index}
            header={item.UpdateAt}
            toggleable
            collapsed={true}
            expandIcon="pi pi-chevron-down"
            collapseIcon="pi pi-times"
          >
            <p>
              <b>Message</b>
            </p>
            <p>{item.Message}</p>
            <p>
              <b>Date & Time given By User</b>
            </p>
            <p>{item.date}</p>
          </Panel>
        ))}
      </>
    )
  }

  const auditColumns = [
    { field: 'Month', header: 'Due Date' },
    { field: 'Interest', header: 'Interest' },
    { field: 'Principal', header: 'Principal Amount' },
    {
      field: 'verifiedPaidAmount',
      body: (rowData) => Number(rowData.paidInterest) + Number(rowData.paidPrincipal),
      header: 'Paid Amount'
    },
    { field: 'arearsAmt', header: 'Arrears Amount' },
    {
      field: 'Due Status',
      body: (rowData) => {
        const status = rowData.dueStatus === true ? 'Due Paid' : 'Unpaid'
        const color = rowData.dueStatus === true ? 'green' : 'red'

        return <span style={{ color }}>{status}</span>
      },
      header: 'Status'
    },

    {
      field: 'followup',
      body: renderFollowup,
      header: 'Follow Up'
    }
  ]

  const getAuditData = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + '/rePayment/loanAudit',
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
        console.log('data line ----- 205', data)
        localStorage.setItem('token', 'Bearer ' + data.token)
        if (data.success) {
          setAuditData(data.data)
        }
      })
  }

  useEffect(() => {
    getAuditData()
  }, [])

  return (
    <div className="card w-full bg-black">
      <DataTable
        value={auditData}
        scrollable
        size="small"
        scrollHeight="55vh"
        tableStyle={{ minWidth: '50rem' }}
      >
        {auditColumns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            body={col.body ?? ((rowData) => rowData[col.field] ?? 0)}
          />
        ))}
      </DataTable>
    </div>
  )
}

export default LoanAudit
