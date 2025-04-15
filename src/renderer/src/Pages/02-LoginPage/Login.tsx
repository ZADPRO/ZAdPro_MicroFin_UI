import decrypt from "@renderer/components/Helper/Helper";
import axios from "axios";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png"
import bgimg from "../../assets/Microfin.jpg"

export default function Login() {

    const [inputs, setInputs] = useState({ username: "", password: "" });

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState({ status: false, message: "" });

    const handleInput = (e: any) => {

        setError({
            status: false,
            message: ""
        })

        setInputs({
            ...inputs,
            [e.target.name]: e.target.value
        })

    }


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/adminLogin", {
                login: inputs.username,
                password: inputs.password
            }).then((response: any) => {
                const data = decrypt(
                    response.data[1],
                    response.data[0],
                    import.meta.env.VITE_ENCRYPTION_KEY
                );


                console.log("Data", data)


                if (data.success) {

                    localStorage.setItem("token", "Bearer " + data.token);
                    localStorage.setItem("roleId", data.roleId);

                    navigate("/dashboard");


                    setLoading(false);

                } else {
                    setLoading(false)
                    setError({
                        status: true,
                        message: data.message
                    })
                }

                console.log('====================================');
                console.log(data);
                console.log('====================================');
            })


        } catch (e: any) {
            console.log(e);
            setLoading(false)
            setError({
                status: true,
                message: "Something went wrong, Try Again"
            })
        }

    }

    const navigate = useNavigate();

    return (
        <div className="pagebackground flex flex-col justify-center items-center h-screen w-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgimg})` }}>
            <div className="login-background">
                <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "20px 0px" }}>
                    <img src={Logo} alt="Logo" style={{ width: "50%" }} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "10px 0px" }}>
                        <div style={{ width: "80%" }}>
                            <div className="input mt-3">
                                <div className="p-inputgroup flex-1">
                                    {/* <span className="p-inputgroup-addon">
                                        <i className="pi pi-user"></i>
                                    </span> */}
                                    <InputText name="username" onInput={(e) => { handleInput(e) }} value={inputs.username} placeholder="Enter Username" required />
                                </div>
                            </div>
                            <div className="input mt-3" style={{ width: "100%" }}>
                                <div className="p-inputgroup flex-1">
                                    {/* <span className="p-inputgroup-addon">
                                        <i className="pi pi-lock"></i>
                                    </span> */}
                                    <Password name="password" onInput={(e) => { handleInput(e) }} value={inputs.password} placeholder="Enter Password" toggleMask feedback={false} required />
                                </div>
                            </div>
                            {
                                error.status ? (
                                    <div className="mt-1" style={{ color: "red", fontSize: "0.85rem", fontWeight: "700" }}>
                                        {error.message}
                                    </div>
                                ) : null
                            }

                            <div className="input mt-4" style={{ width: "100%", marginBottom: "1rem" }}>
                                <Button style={{ width: "100%", background: "#0478df", border: "none", height: "40px" }} label={loading ? "" : "Submit"} icon={loading ? "pi pi-spin pi-spinner" : ""} />
                            </div>


                            {/* <div className="input mt-4" style={{ width: "100%" }} >
                                        <Button type="submit" style={{ width: "100%", background: "#f95005", border: "none", height: "40px" }} label="Submit" />
                                    </div> */}

                        </div>
                    </div>
                </form>

            </div>
        </div>
    )
}
