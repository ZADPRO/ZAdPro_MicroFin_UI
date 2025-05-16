import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { FilterMatchMode } from 'primereact/api'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Nullable } from 'primereact/ts-helpers'
import { Sidebar } from 'primereact/sidebar'
import { CiEdit } from "react-icons/ci";


import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { AddExpense } from '../../components/AddExpense/AddExpense'
import { UpdateExpense } from '@renderer/components/UpdateExpense/UpdateExpense'

export interface expense {
    refExpenseDate: string,
    refVoucherNo: string,
    refExpenseCategory: string,
    refSubCategory: string,
    refAmount: string,
    refBankName: String,
    refAccountTypeName: string
    refExpenseId: number
    refCategoryId: number
    refBankId: number
}
type Props = {}

export default function Expense({ }: Props) {
    const [username, setUsername] = useState('')
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [date, setDate] = useState<Nullable<Date>>(null)
    const [selectedExpense, setSelectedExpense] = useState<expense>()
    const [expense, setExpense] = useState<expense[]>([])
    const [addExpense, setAddExpense] = useState<boolean>(false)
    const [updateExpense, setUpdateExpense] = useState<boolean>(false)

    const loadData = () => {
        console.log('line --------- 25')
        try {
            axios
                .get(import.meta.env.VITE_API_URL + '/adminRoutes/getBankFundList', {
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
                        setLoadingStatus(false)
                        setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)

                    }
                })
        } catch (e: any) {
            console.log(e)
        }
    }

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })

    const [globalFilterValue, setGlobalFilterValue] = useState('')

    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        let _filters = { ...filters }

        _filters['global'].value = value

        setFilters(_filters)
        setGlobalFilterValue(value)
    }


    const formatDate = (data) => {
        const date = new Date(data)
        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return formatted
    }

    const expenseData = (month) => {
        const date = formatDate(month)
        try {
            axios
                .post(import.meta.env.VITE_API_URL + '/expense/expenseData',
                    {
                        month: date
                    },
                    {
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
                    console.log('data line ------- 72', data)

                    localStorage.setItem('token', 'Bearer ' + data.token)

                    if (data.success) {
                        setLoadingStatus(false)
                        setExpense(data.data)
                    }
                })
        }
        catch (error) {

        }
    }

    useEffect(() => {
        setDate(new Date())
        loadData()
        expenseData(new Date())
    }, [])

    const closeSidebarNew = () => {
        setAddExpense(false)
        expenseData(new Date())
        setUpdateExpense(false)
    }

    const editButton = (rowData: any) => {
        return (
            <div className='flex w-full justify-center' >
                <b onClick={() => { setUpdateExpense(true), setSelectedExpense(rowData) }}><CiEdit size={'2rem'} className=' text-[green] hover:text-[white] hover:bg-[green] rounded-[15%]' /></b>

            </div>

        )
    }

    return (
        <>
            <ToastContainer />
            <Header userName={username} pageName={'Expense'} />
            {loadingStatus ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#f8d20f',
                        height: '92vh',
                        width: '100%'
                    }}
                >
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
                </div>
            ) : (
                <div>
                    <div className='m-3'>
                        <Calendar
                            placeholder="select Month"
                            value={date}
                            onChange={(e) => {
                                setDate(e.value)
                                expenseData(e.value)
                            }}
                            view="month"
                            dateFormat="mm/yy"
                        />
                    </div>
                    <div className='flex justify-between m-3'>
                        <button className='bg-[green] hover:bg-[#008000da] text-white py-2 px-10 rounded-md' onClick={() => { setAddExpense(true) }}>
                            Add Expense
                        </button>
                        <div className='w-[50%] flex justify-end'>
                            <IconField style={{ width: '50%' }} iconPosition="left">
                                <InputIcon className="pi pi-search"></InputIcon>
                                <InputText
                                    placeholder="Search Customers"
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                />
                            </IconField></div>
                    </div>
                    <div className='flex justify-center'>
                        <DataTable paginator rows={5} filters={filters}
                            className='w-[95%]' value={expense} showGridlines>
                            <Column header="S.No" body={(_, options) => options.rowIndex + 1} />
                            <Column sortable field="refExpenseDate" header="Date"></Column>
                            <Column field="refExpenseCategory" header="Expense"></Column>
                            <Column field="refSubCategory" header="Category"></Column>
                            <Column
                                field="refAmount"
                                header="Amount"
                                body={(rowData) => `₹ ${rowData.refAmount}`}
                            />
                            <Column field="refBankName" header="Amount Source"></Column>
                            <Column field="refAccountTypeName" header="Type"></Column>
                            <Column header="Edit" body={editButton}></Column>
                        </DataTable>
                    </div>
                    <Sidebar
                        visible={addExpense}
                        style={{ width: '80vw' }}
                        position="right"
                        onHide={closeSidebarNew}
                    >
                        <AddExpense closeSidebarNew={closeSidebarNew} />
                    </Sidebar>

                    <Sidebar
                        visible={updateExpense}
                        style={{ width: '80vw' }}
                        position="right"
                        onHide={closeSidebarNew}
                    >
                        <UpdateExpense closeSidebarNew={closeSidebarNew} expenseData={selectedExpense} />
                    </Sidebar>

                </div>
            )}
        </>
    )
}