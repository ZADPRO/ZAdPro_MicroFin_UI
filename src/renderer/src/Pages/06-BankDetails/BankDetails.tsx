import Header from "@renderer/components/Header/Header"
import decrypt from "@renderer/components/Helper/Helper"
import axios from "axios"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { InputText } from "primereact/inputtext"
import { Sidebar } from "primereact/sidebar"
import { useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api"
import { Button } from "primereact/button"
import BankInputNew from "@renderer/components/BankInputs/BankInputNew"
import BankInputsUpdate from "@renderer/components/BankInputs/BankInputsUpdate"

const BankDetails = () => {

    const [userLists, setUserLists] = useState([]);

    const [username, setUsername] = useState("");

    const [loadingStatus, setLoadingStatus] = useState(true);

    const [userData, setUserData] = useState({
        refBankId: "",
        refBankName: "",
        refBankAccountNo: "",
        refBankAddress: "",
        refBalance: ""
    });


    const loadData = () => {
        try {

            axios.get(import.meta.env.VITE_API_URL + "/adminRoutes/getBankAccountList", {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
            }).then((response: any) => {

                const data = decrypt(
                    response.data[1],
                    response.data[0],
                    import.meta.env.VITE_ENCRYPTION_KEY
                );


                console.log(data)

                localStorage.setItem("token", "Bearer " + data.token);

                if (data.success) {
                    setLoadingStatus(false);
                    setUsername(data.name[0].refUserFname + " " + data.name[0].refUserLname);
                    setUserLists(data.BankAccount);
                }

            })

        } catch (e: any) {
            console.log(e);

        }
    }

    useEffect(() => {
        loadData();
    }, [])

    const CustomerId = (rowData: any) => {

        return (<><div onClick={() => {
            setUpdateData(true);
            setUserData({
                refBankId: rowData.refBankId,
                refBankName: rowData.refBankName,
                refBankAccountNo: rowData.refBankAccountNo,
                refBankAddress: rowData.refBankAddress,
                refBalance: rowData.refBalance
            })
        }} style={{ color: "#f8d20f", textDecoration: "underline", cursor: "pointer" }}>{rowData.refBankName}</div></>)
    }


    const BankBalance = (rowData: any) => {
        return (<><div>₹ {rowData.refBalance}</div></>)
    }

    const [newData, setNewData] = useState(false);

    const [updateData, setUpdateData] = useState(false);

    const closeSidebarUpdate = () => {
        setUpdateData(false);
        loadData();
    }


    const closeSidebarNew = () => {
        setNewData(false);
        loadData();
    }

    //   Filter Data - Start

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    //Filter Data - End




    return (
        <>
            <ToastContainer />
            <Header userName={username} pageName={"Bank Details"} />
            {
                loadingStatus ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#f8d20f", height: "92vh", width: "100%" }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: "5rem" }}></i>
                    </div>
                ) : (
                    <div className="contentPage">


                        {/* New User Button - Start */}

                        <Button label="Add Bank Details" severity="warning" style={{ backgroundColor: "#f8d20f" }} onClick={() => { setNewData(true) }} />

                        {/* New User Button - End */}

                        {/* Search Input - Start */}
                        <div style={{ width: "100%", marginBottom: "10px", display: "flex", justifyContent: "flex-end" }}>
                            <IconField style={{ width: "30%" }} iconPosition="left">
                                <InputIcon className="pi pi-search"></InputIcon>
                                <InputText
                                    placeholder="Search Bank Deatils"
                                    value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                />
                            </IconField>
                        </div>
                        {/* Search Input - End */}


                        {/* Datatable - Start */}

                        <div>
                            <DataTable filters={filters} paginator rows={5} value={userLists} showGridlines scrollable emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>} tableStyle={{ minWidth: '50rem', overflow: "auto" }}>
                                <Column body={CustomerId} header="Bank Name"></Column>
                                <Column field="refBankAccountNo" header="Account Number"></Column>
                                <Column field="refBankAddress" header="Bank Address"></Column>
                                <Column field="refBalance" body={BankBalance} header="Bank Balance"></Column>
                            </DataTable>
                        </div>

                        {/* Datatable - End */}


                        {/* New User Side Bar - Start */}

                        <Sidebar visible={newData} style={{ width: "80vw" }} position="right" onHide={() => setNewData(false)}>

                            <BankInputNew closeSidebarNew={closeSidebarNew} />

                        </Sidebar>

                        {/* New User Side Bar - End */}


                        {/* Update Side Bar - Start */}

                        <Sidebar visible={updateData} style={{ width: "80vw" }} position="right" onHide={() => setUpdateData(false)}>

                            <BankInputsUpdate data={userData} closeSidebarUpdate={closeSidebarUpdate} />

                        </Sidebar>

                        {/* Update Side Bar - End */}

                    </div>
                )
            }
        </>
    )
}

export default BankDetails