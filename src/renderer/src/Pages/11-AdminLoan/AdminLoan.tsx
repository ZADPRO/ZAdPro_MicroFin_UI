import Header from '@renderer/components/Header/Header'
import axios from 'axios'
import { FilterMatchMode } from 'primereact/api'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { TabPanel, TabView } from 'primereact/tabview'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'

interface addSupplier {
    supplierFNAme?: string;
    supplierLName?: string;
    supplierAccNo?: string;
    supplierIFSC?: string;
    supplierMobile?: number;
    supplierEmail?: string;
    supplierBankName?: string;
}


export default function AdminLoan() {
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0);
    const [userListType, setUserListType] = useState({ name: 'Over All', code: 0 })
    const [startDate, setStartDate] = useState<Nullable<Date>>(null);
    const [endDate, setEndDate] = useState<Nullable<Date>>(null);
    const userType = [
        { name: 'Over All', code: 0 },
        { name: 'Month', code: 1 },

    ];

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


    const [SupplierDetails, setSupplierDetails] = useState<addSupplier>()
    return (
        <>
            <ToastContainer />
            <Header userName={"vijay"} pageName={'Admin Loan'} />
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
                <>
                    <div

                        className='my-2 px-2 flex flex-row align-items-center justify-end w-full'
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
                                    placeholder="Search Supplier Name"
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                />
                            </IconField></div>

                    </div>
                    <TabView activeIndex={activeIndex}
                        className='mx-1'
                        onTabChange={(e) => { console.log(e.index); setActiveIndex(e.index) }}
                        style={{ marginTop: "1rem" }}>

                        <TabPanel header="Re-Payment">
                        </TabPanel>
                        <TabPanel header="Loan">
                        </TabPanel>
                        <TabPanel header="Supplier Details">
                            <div>
                                <form>
                                    <div>
                                        <div>
                                            <InputText
                                                value={SupplierDetails?.supplierFNAme}
                                                onChange={(e) => {
                                                    setSupplierDetails({
                                                        ...SupplierDetails,
                                                        supplierFNAme: e.target.value ?? ""
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </TabPanel>
                    </TabView>

                </>
            )
            }
        </>
    )
}