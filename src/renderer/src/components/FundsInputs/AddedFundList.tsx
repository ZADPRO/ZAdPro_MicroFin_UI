import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Calendar } from 'primereact/calendar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { FilterMatchMode } from 'primereact/api'
import decrypt from '../Helper/Helper'
import { formatINRCurrency } from '@renderer/helper/amountFormat'

export interface BankFundRecord {
  refBankFId: number
  refBankId: number
  refbfTransactionDate: string
  refbfTransactionAmount: string
  createdAt: string
  refBankName: string
  condation: boolean
  refFundType?: string
}

export default function AddedFundList({}: { closeSidebarNew: () => void }) {
  const [date, setDate] = useState<Date>(new Date())
  const [fundData, setFundData] = useState<BankFundRecord[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Partial<BankFundRecord>>({})
  const [loading, setLoading] = useState<boolean>(false)

  const [filters, setFilters] = useState<any>({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    refbfTransactionAmount: { value: '', matchMode: FilterMatchMode.CONTAINS },
    refBankName: { value: '', matchMode: FilterMatchMode.CONTAINS }
  })

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const formatDateToYMD = (date: Date): string => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getFunds = async (selectedDate: Date) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/fund/viewAddedFunds',
        { date: formatDateToYMD(selectedDate) },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success && data.data) {
        setFundData(data.data)
      }
    } catch (error) {
      console.error('Error fetching fund data:', error)
    }
  }

  const updateFundData = async () => {
    if (!editRow.refBankFId || !editRow.refBankId) return

    setLoading(true)
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + '/fund/updateFunds',
        {
          refBankFId: editRow.refBankFId,
          refBankId: editRow.refBankId,
          refbfTransactionAmount: editRow.refbfTransactionAmount,
          refFundType: editRow.refFundType
        },
        {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        }
      )

      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY)
      localStorage.setItem('token', 'Bearer ' + data.token)

      if (data.success) {
        setFundData((prev) =>
          prev.map((item) =>
            item.refBankFId === editRow.refBankFId
              ? {
                  ...item,
                  refbfTransactionAmount:
                    editRow.refbfTransactionAmount ?? item.refbfTransactionAmount,
                  refFundType: editRow.refFundType ?? item.refFundType
                }
              : item
          )
        )
        setEditingId(null)
        setEditRow({})
      } else {
        console.error('Failed to update fund')
      }
    } catch (error) {
      console.error('Error updating fund data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFunds(date)
  }, [])

  const onEdit = (row: BankFundRecord) => {
    setEditingId(row.refBankFId)
    setEditRow({ ...row })
  }

  const onCancel = () => {
    setEditingId(null)
    setEditRow({})
  }

  const onEditChange = (field: keyof BankFundRecord, value: string) => {
    setEditRow((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex align-align-items-center justify-between">
        <div className="flex gap-x-3 align-items-center">
          <label>
            <b>Select Month:</b>
          </label>
          <Calendar
            placeholder="MM/YYYY"
            value={date}
            onChange={(e) => {
              const newDate = e.value ?? new Date()
              setDate(newDate)
              getFunds(newDate)
            }}
            view="month"
            dateFormat="mm/yy"
            maxDate={new Date()}
          />
        </div>

        <div className="">
          <span className="p-input-icon-left">
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search..."
              className="p-inputtext-sm"
            />
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      )}

      <DataTable
        value={fundData}
        paginator
        rows={10}
        stripedRows
        showGridlines
        size="small"
        responsiveLayout="scroll"
        emptyMessage="No fund records found"
        filters={filters}
        globalFilterFields={['refBankName', 'refbfTransactionAmount']}
      >
        <Column field="refBankName" header="Bank Name" filterPlaceholder="Search Bank" />

        <Column
          field="refbfTransactionAmount"
          header="Amount"
          filterPlaceholder="Search Amount"
          body={(rowData) =>
            rowData.refBankFId === editingId ? (
              <InputText
                value={formatINRCurrency(Number(editRow.refbfTransactionAmount))}
                onChange={(e) => onEditChange('refbfTransactionAmount', e.target.value)}
              />
            ) : (
              formatINRCurrency(Number(rowData.refbfTransactionAmount))
            )
          }
        />

        <Column
          header="Fund Type"
          body={(rowData) =>
            rowData.refBankFId === editingId ? (
              <InputText
                value={editRow.refFundType}
                onChange={(e) => onEditChange('refFundType', e.target.value)}
              />
            ) : (
              rowData.refFundType
            )
          }
        />

        <Column field="refbfTransactionDate" header="Transaction Date" />
        <Column field="createdAt" header="Created At" />

        <Column
          header="Action"
          body={(rowData: BankFundRecord) => {
            if (editingId === rowData.refBankFId) {
              return (
                <div className="flex gap-x-2">
                  <Button
                    icon="pi pi-check"
                    className="p-button-sm p-button-success"
                    onClick={updateFundData}
                    disabled={loading}
                  />
                  <Button
                    icon="pi pi-times"
                    className="p-button-sm p-button-danger"
                    onClick={onCancel}
                    disabled={loading}
                  />
                </div>
              )
            }

            return (
              <Button
                icon="pi pi-pencil"
                className="p-button-sm p-button-text"
                tooltip="Edit"
                disabled={!rowData.condation}
                onClick={() => onEdit(rowData)}
              />
            )
          }}
        />
      </DataTable>
    </div>
  )
}
