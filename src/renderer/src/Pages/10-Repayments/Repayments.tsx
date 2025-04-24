

import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Sidebar } from 'primereact/sidebar'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
// import Addnewloan from '@renderer/components/Addnewloan/Addnewloan'
import RepaymentSideTab from '@renderer/components/Repayment/RepaymentSideTab'
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Nullable } from "primereact/ts-helpers";


const Repayments = () => {
    const [userLists, setUserLists] = useState([])

    const [username, setUsername] = useState('')

    const [loadingStatus, setLoadingStatus] = useState(true)
    const [userListType, setUserListType] = useState({ name: 'Over All', code: 0 })
    const [startDate, setStartDate] = useState<Nullable<Date>>(null);
    const [endDate, setEndDate] = useState<Nullable<Date>>(null);
    const userType = [
        { name: 'Over All', code: 0 },
        { name: 'Month', code: 1 },

    ];

    function formatToYearMonth(dateInput: string | Date): string {
        const date = new Date(dateInput);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        return `${year}-${month}`;
    }

    const loadData = () => {
        try {
            axios
                .post(
                    import.meta.env.VITE_API_URL + '/rePayment/userList',
                    {
                        ifMonth: userListType.code === 0 ? false : true,
                        startDate: startDate ? formatToYearMonth(startDate) : "",
                        endDate: endDate ? formatToYearMonth(endDate) : ""
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

                    localStorage.setItem("token", "Bearer " + data.token);

                    console.log("data line ---- 70", data)
                    const list = data.data
                    console.log('list line ------ 72', list)

                    if (data.success) {
                        setLoadingStatus(false)
                        setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)
                        setUserLists(list)
                    }
                })
        } catch (e: any) {
            console.log(e)
        }
    }

    useEffect(() => {
        loadData()
    }, [startDate, endDate])

    const AddressBody = (rowData: any) => {
        return (
            <>
                {rowData.refUserAddress}, {rowData.refUserDistrict}, {rowData.refUserState} -{' '}
                {rowData.refUserPincode}
            </>
        )
    }

    const ProductBody = (rowData: any) => {
        return (
            <>
                <p><b>{rowData.refProductName}</b></p>
                <p>( {rowData.refProductDuration} Month - {rowData.refProductInterest}% )</p>

            </>
        )
    }


    const CustomerId = (rowData: any) => {
        return (
            <>
                <div
                    onClick={() => {
                        setUpdateData(true)
                        setUpdateUserId({ id: rowData.refUserId, custId: rowData.refCustId, loanId: rowData.refLoanId, rePayId: rowData.refRpayId })
                    }}
                    style={{ color: '#f8d20f', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    {rowData.refCustId}
                </div>
            </>
        )
    }


    const [updateData, setUpdateData] = useState(false)
    const [updateUserId, setUpdateUserId] = useState({
        id: '',
        custId: '',
        rePayId: '',
        loanId: ''
    })

    const closeSidebarUpdate = () => {
        setUpdateData(false)
        loadData()
    }


    //   Filter Data - Start

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

    //Filter Data - End

    return (
        <>
            <ToastContainer />
            <Header userName={username} pageName={'Re-Payment'} />
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
                <div className="contentPage w-[100%]">

                    <div

                        className='my-2 flex flex-row align-items-center justify-end w-full'
                    >
                        <div className='w-[50%] flex flex-row gap-x-10'>
                            <Dropdown value={userListType} onChange={(e) => {
                                if (e.value.code === 1) {
                                    setStartDate(new Date())
                                    setEndDate(new Date())
                                }
                                else {
                                    setEndDate(null)
                                    setStartDate(null)
                                }
                                setUserListType(e.value)
                            }}
                                options={userType} optionLabel="name"
                                placeholder="Select Filter" className="w-full md:w-14rem" />
                            {userListType.code === 1 && <>
                                <Calendar
                                    value={startDate}
                                    placeholder="Select Start Range"
                                    onChange={(e) => {
                                        setStartDate(e.value);
                                        if (endDate && e.value && endDate < e.value) {
                                            setEndDate(e.value);
                                        }
                                    }}
                                    view="month"
                                    dateFormat="mm/yy"
                                />
                                <Calendar
                                    value={endDate}
                                    placeholder="Select End Range"
                                    onChange={(e) => setEndDate(e.value)}
                                    view="month"
                                    dateFormat="mm/yy"
                                    minDate={startDate || undefined}
                                    disabled={!startDate}
                                />    </>}

                        </div>
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
                    {/* Search Input - End */}

                    {/* Datatable - Start */}

                    <div>
                        <DataTable
                            filters={filters}
                            paginator
                            rows={5}
                            value={userLists}
                            showGridlines
                            scrollable
                            emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
                            tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
                        >
                            <Column style={{ minWidth: '3rem' }} body={CustomerId} header="User ID"></Column>
                            <Column
                                style={{ minWidth: '8rem' }}
                                field="refUserFname"
                                body={(rowData) => `${rowData.refUserFname} ${rowData.refUserLname}`}
                                header="Name"
                            ></Column>
                            <Column
                                style={{ minWidth: '8rem' }}
                                field="refUserMobileNo"
                                header="Phone Number"
                            ></Column>
                            <Column style={{ minWidth: '10rem' }} body={AddressBody} header="Address"></Column>
                            <Column style={{ minWidth: '8rem' }} field="refPaymentDate" header="Month"></Column>

                            <Column style={{ minWidth: '10rem' }} body={ProductBody} header="Product"></Column>
                            <Column style={{ minWidth: '8rem' }} field="refLoanAmount" header="Principal Amount"></Column>
                        </DataTable>
                    </div>

                    <Sidebar
                        visible={updateData}
                        style={{ width: '80vw' }}
                        position="right"
                        onHide={() => setUpdateData(false)}
                    >
                        <RepaymentSideTab
                            custId={updateUserId.custId}
                            id={updateUserId.id}
                            closeSidebarUpdate={closeSidebarUpdate}
                            loanId={updateUserId.loanId}
                            rePayId={updateUserId.rePayId}
                        />
                    </Sidebar>

                    {/* Update Side Bar - End */}
                </div>
            )}
        </>
    )
}

export default Repayments
