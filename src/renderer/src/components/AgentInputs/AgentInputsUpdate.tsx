import axios from "axios"
import { City, State } from "country-state-city"
import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { FloatLabel } from "primereact/floatlabel"
import { InputText } from "primereact/inputtext"
import { useEffect, useState } from "react"
import decrypt from "../Helper/Helper"
import { Slide, toast } from "react-toastify"

const AgentInputsUpdate = ({ custId, id, closeSidebarUpdate }) => {

    const status = [
        { name: 'Active', code: 'active' },
        { name: 'Inactive', code: 'inactive' }
    ];

    const [loading, setLoading] = useState(true);
    const [saveloading, setSaveloading] = useState(false);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);


    const [edit, setEdit] = useState(true);


    const [inputs, setInputs]: any = useState({
        fname: "",
        lname: "",
        dob: "",
        status: "",
        mobileno: "",
        email: "",
        aadharno: "",
        panno: "",
        aadharImg: "",
        panImg: "",
        address: "",
        state: "",
        district: "",
        pincode: "",
        profileImg: "",
        ProfileImgBase64: "",
        PanImgBase64: "",
        AadharImgBase64: "",
        updateprofileImg: "",
        updatepanImg: "",
        updatedaadharImg: ""
    });


    const submitUpdate = async () => {

        setSaveloading(true);

        try {

            const formData = new FormData();
            formData.append("profile", inputs.updateprofileImg?.data || "");
            formData.append("pan", inputs.updatepanImg?.data || "");
            formData.append("aadhar", inputs.updatedaadharImg?.data || "");

            const response = await axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/profileUpload", formData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                    "Content-Type": "multipart/form-data",
                },
            });

            const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
            console.log(data);
            localStorage.setItem("token", "Bearer " + data.token);

            if (data.success) {

                axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/updatePerson", {
                    userId: id,
                    BasicInfo: {
                        user: {
                            refPerFName: inputs.fname,
                            refPerLName: inputs.lname,
                            refDOB: inputs.dob,
                            refAadharNo: inputs.aadharno,
                            refPanNo: inputs.panno,
                            refRollId: 2,
                            activeStatus: inputs.status,
                            ProfileImgPath: data.filePaths.images.profile.length > 0 ? data.filePaths.images.profile : inputs.profileImg,
                            refPanPath: data.filePaths.images.pan.length > 0 ? data.filePaths.images.pan : inputs.panImg,
                            refAadharPath: data.filePaths.images.aadhar.length > 0 ? data.filePaths.images.aadhar : inputs.aadharImg,
                        },
                        Communtication: {
                            refPerMob: inputs.mobileno,
                            refPerEmail: inputs.email,
                            refPerAddress: inputs.address,
                            refPerDistrict: inputs.district,
                            refPerState: inputs.state,
                            refPerPincode: inputs.pincode
                        }
                    }
                }, {
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

                    localStorage.setItem("token", "Bearer " + data.token);

                    console.log(data)

                    setSaveloading(false);


                    if (data.success) {
                        closeSidebarUpdate();
                        toast.success('Successfully Updated', {
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

                    }

                })

            }

        } catch (e: any) {
            console.log(e);
        }

    }


    useEffect(() => {

        try {

            axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/getPerson", {
                roleId: 2,
                refUserId: id
            }, {
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

                localStorage.setItem("token", "Bearer " + data.token);

                console.log(data)

                if (data.success) {

                    const userData = data.data[0];

                    setInputs({
                        fname: userData.refUserFname,
                        lname: userData.refUserLname,
                        dob: userData.refUserDOB,
                        status: userData.refActiveStatus,
                        mobileno: userData.refUserMobileNo,
                        email: userData.refUserEmail,
                        aadharno: userData.refAadharNo,
                        panno: userData.refPanNo,
                        aadharImg: userData.refAadharPath,
                        panImg: userData.refPanPath,
                        address: userData.refUserAddress,
                        state: userData.refUserState,
                        district: userData.refUserDistrict,
                        pincode: userData.refUserPincode,
                        profileImg: userData.refUserProfile,
                        ProfileImgBase64: userData.ProfileImgBase64,
                        PanImgBase64: userData.PanImgBase64,
                        AadharImgBase64: userData.AadharImgBase64
                    })


                    const countryStates: any = State.getStatesOfCountry("IN");
                    setStates(countryStates);

                    if (userData.refUserState) {
                        const districts: any = City.getCitiesOfState("IN", userData.refUserState);
                        setDistricts(districts);
                    }

                    setLoading(false)

                }

            })

        } catch (e: any) {
            console.log(e);

        }



    }, []);


    const handleInput = (e: any) => {
        const { name, value } = e.target;

        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));

        if (name === "state") {
            const districts: any = City.getCitiesOfState("IN", value); // Use 'value' instead of 'inputs.state'
            setDistricts(districts);
        }
    };


    const handleFile = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
                setInputs((prevInputs: any) => ({
                    ...prevInputs,
                    [field]: { name: file.name, data: file }, // Store both name and base64 data
                }));
            };
        }
    };


    return (
        <>

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid grey", paddingBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0478df" }}>
                        {custId}
                    </div>
                    <div>
                        {
                            !edit ? (
                                <>
                                    {
                                        saveloading ? (
                                            <div style={{ backgroundColor: "#0478df", width: "4rem", textAlign: "center", padding: "10px 0px", borderRadius: "5px", cursor: "pointer", color: "#fff", fontSize: "1rem", fontWeight: "700" }}><i className="pi pi-spin pi-spinner" style={{ fontSize: "1rem" }}></i></div>
                                        ) : (
                                            <div style={{ backgroundColor: "#0478df", width: "4rem", textAlign: "center", padding: "10px 0px", borderRadius: "5px", cursor: "pointer", color: "#fff", fontSize: "1rem", fontWeight: "700" }} onClick={submitUpdate}>Save</div>
                                        )
                                    }
                                </>
                            ) : (
                                <>
                                    <div style={{ backgroundColor: "#0478df", width: "4rem", textAlign: "center", padding: "10px 0px", borderRadius: "5px", cursor: "pointer", color: "#fff", fontSize: "1rem", fontWeight: "700" }} onClick={() => { setEdit(false) }} >Edit</div>
                                </>
                            )
                        }
                    </div>
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#000" }}>Profile Data</div>
            </div>

            {
                loading ? (
                    <><div style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#0478df", height: "76vh", width: "100%" }}>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: "5rem" }}></i>
                    </div></>
                ) : (
                    <div style={{ margin: '5px 0px', height: '75vh', overflow: 'auto', padding: '10px' }}>
                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            {!edit ? (
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <label>Profile Image</label>
                                    <div className="mt-2">
                                        <label htmlFor="profile-upload" className="custom-file-upload">
                                            {inputs.updateprofileImg ? inputs.updateprofileImg.name : 'Choose Image'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            id="profile-upload"
                                            onChange={(e) => handleFile(e, 'updateprofileImg')}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>

                                    {
                                        inputs.ProfileImgBase64 ? (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <img
                                                    src={`data:image/jpeg;base64,${inputs.ProfileImgBase64}`}
                                                    alt="Aadhar"
                                                    style={{
                                                        width: '200px',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '100%'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <label>Profile Image</label>
                                                <h4>No Image Upload</h4>
                                            </>
                                        )
                                    }
                                </>
                            )}
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="fname"
                                    name="fname"
                                    value={inputs.fname}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    disabled={edit}
                                />
                                <label htmlFor="fname">Enter First Name</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="lname"
                                    name="lname"
                                    value={inputs.lname}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    disabled={edit}
                                />
                                <label htmlFor="lname">Enter Last Name</label>
                            </FloatLabel>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <Calendar
                                    dateFormat="dd/mm/yy"
                                    name="dob"
                                    style={{ width: '100%' }}
                                    value={new Date(inputs.dob)}
                                    id="dob"
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    disabled={edit}
                                />
                                <label htmlFor="dob">Enter Date of Birth</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <Dropdown
                                    name="status"
                                    style={{ width: '100%', minWidth: '100%' }}
                                    value={inputs.status}
                                    options={status}
                                    optionLabel="name"
                                    optionValue="code"
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    disabled={edit}
                                />
                                <label htmlFor="lname">Active Status</label>
                            </FloatLabel>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="mobileno"
                                    name="mobileno"
                                    disabled={edit}
                                    value={inputs.mobileno}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                />
                                <label htmlFor="mobileno">Mobile Number</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="email"
                                    disabled={edit}
                                    name="email"
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    value={inputs.email}
                                />
                                <label htmlFor="email">E-Mail</label>
                            </FloatLabel>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="aadharno"
                                    name="aadharno"
                                    disabled={edit}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                    value={inputs.aadharno}
                                />
                                <label htmlFor="aadharno">Aadhar Number</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="panno"
                                    name="panno"
                                    disabled={edit}
                                    value={inputs.panno}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                />
                                <label htmlFor="panno">Pan Number</label>
                            </FloatLabel>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <div style={{ width: '100%' }}>
                                <label>Aadhar Image</label>
                                {!edit ? (
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div className="mt-2">
                                            <label htmlFor="aadhar-upload" className="custom-file-upload">
                                                {inputs.updatedaadharImg ? inputs.updatedaadharImg.name : 'Choose Image'}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                id="aadhar-upload"
                                                onChange={(e) => handleFile(e, 'updatedaadharImg')}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {
                                            inputs.AadharImgBase64 ? (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <img
                                                        src={`data:image/jpeg;base64,${inputs.AadharImgBase64}`}
                                                        alt="Aadhar"
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            borderRadius: '10px'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h4>No Image Upload</h4>
                                                </>
                                            )
                                        }
                                    </>
                                )}
                            </div>
                            <div style={{ width: '100%' }}>
                                <label>Pan Image</label>
                                {!edit ? (
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div className="mt-2">
                                            <label htmlFor="pan-upload" className="custom-file-upload">
                                                {inputs.updatepanImg ? inputs.updatepanImg.name : 'Choose Image'}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                id="pan-upload"
                                                onChange={(e) => handleFile(e, 'updatepanImg')}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {
                                            inputs.PanImgBase64 ? (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <img
                                                        src={`data:image/jpeg;base64,${inputs.PanImgBase64}`}
                                                        alt="Aadhar"
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            borderRadius: '10px'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h4>No Image Upload</h4>
                                                </>
                                            )
                                        }
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    id="address"
                                    name="address"
                                    disabled={edit}
                                    value={inputs.address}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                />
                                <label htmlFor="address">Address</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <Dropdown
                                    name="state"
                                    style={{ width: '100%', minWidth: '100%', padding: '0' }}
                                    value={inputs.state}
                                    filter
                                    options={states}
                                    disabled={edit}
                                    optionLabel="name"
                                    optionValue="isoCode"
                                    onChange={(e) => handleInput(e)}
                                />
                                <label>Select State</label>
                            </FloatLabel>
                        </div>

                        <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                            <FloatLabel style={{ width: '100%' }}>
                                <Dropdown
                                    className="dropDown"
                                    name="district"
                                    style={{ width: '100%', minWidth: '100%' }}
                                    value={inputs.district}
                                    filter
                                    options={districts}
                                    disabled={edit}
                                    optionLabel="name"
                                    optionValue="name"
                                    onChange={(e) => handleInput(e)}
                                />
                                <label>Select District</label>
                            </FloatLabel>
                            <FloatLabel style={{ width: '100%' }}>
                                <InputText
                                    type="number"
                                    name="pincode"
                                    style={{ width: '100%' }}
                                    id="panno"
                                    value={inputs.pincode}
                                    disabled={edit}
                                    onChange={(e: any) => {
                                        handleInput(e)
                                    }}
                                />
                                <label htmlFor="panno">Enter Pincode</label>
                            </FloatLabel>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default AgentInputsUpdate