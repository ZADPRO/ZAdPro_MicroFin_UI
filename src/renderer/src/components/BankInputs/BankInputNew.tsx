import axios from 'axios'
import { Button } from 'primereact/button'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'

const BankInputNew = ({ closeSidebarNew }) => {

    const [submitLoading, setSubmitLoading] = useState(false);

    const [inputs, setInputs]: any = useState({
        refBankName: "",
        refBankAccountNo: "",
        refBankAddress: "",
        refBalance: 0
    });

    const handleInput = (e: any) => {
        const { name, value } = e.target;


        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleNewUser = async () => {

        setSubmitLoading(true);

        try {

            axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/addBankAccount", {
                refBankName: inputs.refBankName,
                refBankAccountNo: inputs.refBankAccountNo,
                refBankAddress: inputs.refBankAddress,
                refBalance: inputs.refBalance
            },
                {
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

                    setSubmitLoading(false);

                    localStorage.setItem("token", "Bearer " + data.token);


                    if (data.success) {

                        toast.success('Successfully Added', {
                            position: "top-right",
                            autoClose: 2999,
                            hideProgressBar: false,
                            closeOnClick: false,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                            transition: Slide,
                        });

                        closeSidebarNew()

                    }

                })

        } catch (e: any) {
            console.log(e);
        }

    }



    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid grey", paddingBottom: "10px" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#000" }}>Add New Bank Details</div>
            </div>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleNewUser();
            }}>
                <div style={{ margin: "5px 0px", height: "78vh", overflow: "auto", padding: "10px" }}>

                    <div style={{ width: "100%", display: "flex", gap: "20px", marginTop: "35px" }}>
                        <FloatLabel style={{ width: "100%" }}>
                            <InputText id="refBankName" name="refBankName" value={inputs.refBankName} onChange={(e: any) => { handleInput(e) }} required />
                            <label htmlFor="refBankName">Enter Bank Name</label>
                        </FloatLabel>
                        <FloatLabel style={{ width: "100%" }}>
                            <InputText type='number' id="refBankAccountNo" name="refBankAccountNo" value={inputs.refBankAccountNo} onChange={(e: any) => { handleInput(e) }} required />
                            <label htmlFor="refBankAccountNo">Enter Account Number</label>
                        </FloatLabel>
                    </div>

                    <div style={{ width: "100%", display: "flex", gap: "20px", marginTop: "35px" }}>
                        <FloatLabel style={{ width: "100%" }}>
                            <InputText id="refBankAddress" name="refBankAddress" value={inputs.refBankAddress} onChange={(e: any) => { handleInput(e) }} required />
                            <label htmlFor="refBankAddress">Enter Bank Address</label>
                        </FloatLabel>
                        <FloatLabel style={{ width: "100%" }}>
                            {/* <InputText id="refBankAccountNo" name="refBankAccountNo" value={inputs.refBankAccountNo} onChange={(e: any) => { handleInput(e) }} required />
                            <label htmlFor="refBankAccountNo">Enter Last Name</label> */}
                        </FloatLabel>
                    </div>

                    {
                        submitLoading ? (
                            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "35px" }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem", color: "#0478df" }}></i>
                            </div>
                        ) : (
                            <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "35px" }}>
                                <Button style={{ width: "20%" }} type='submit' label="Submit" />
                            </div>
                        )
                    }

                </div>
            </form>
        </>
    )
}

export default BankInputNew