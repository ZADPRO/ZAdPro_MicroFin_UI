import axios from "axios";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react"
import decrypt from "../Helper/Helper";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
// import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Slide, toast, ToastContainer } from "react-toastify";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import LoanAudit from "../LoanAudit/LoanAudit";
import { BsInfoCircle } from "react-icons/bs";
import { IoCloseCircleOutline } from "react-icons/io5";
import { Divider } from 'primereact/divider';

interface loanType {
  name: string;
  code: number;
}

const Addnewloan = ({ custId, id, closeSidebarUpdate }) => {

  console.log(closeSidebarUpdate)
  const [selectedLoanType, setLoanType] = useState<loanType | null>({ name: 'New Loan', code: 1 });
  const loanType: loanType[] = [
    { name: 'New Loan', code: 1 },
    { name: 'Top Up', code: 2 },
    { name: 'Extension', code: 3 },

  ];
  const [addLoanOption, setAddLoanOption] = useState([]);
  const [selectLoanOption, setSelectLoanOption] = useState([]);

  const [loading, setLoading] = useState(true);
  const [newLoading, setNewLoading] = useState(false);

  const [allBankAccountList, setAllBankAccountList] = useState([]);
  const [productList, setProductList]: any = useState([]);

  const [loanData, setLoadData] = useState<any>([]);


  const [addInputs, setAddInputs] = useState({
    productId: "",
    productInterest: "",
    productDuration: "",
    refLoanAmount: null,
    refrepaymentStartDate: null,
    refPaymentType: "",
    refLoanStatus: "opened",
    refBankId: "",
    refisInterest: false,
    refLoanBalance: 0,
    refInterestMonth: 0
  });


  const paymentType = [{
    label: "Bank",
    id: 'bank'
  }, {
    label: "Cash",
    id: "cash"
  }];


  const getLoanData = () => {

    axios.post(
      import.meta.env.VITE_API_URL + '/adminRoutes/getLoan',
      {
        userId: id
      },
      {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }
    ).then((response) => {
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
      localStorage.setItem("token", "Bearer " + data.token);

      if (data.success) {
        console.log(data)
        setLoading(false)

        setLoadData(data.loanData);

        setAllBankAccountList(data.allBankAccountList);
        let productList = data.productList
        data.productList.map((data, index) => {
          let name = `Name : ${data.refProductName} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`
          productList[index] = { ...productList[index], refProductName: name }
        })
        setProductList(productList);

      }

    })

  }

  useEffect(() => {

    getLoanData();
    getLoanDatas(id);

  }, []);


  const handleInput = (e: any) => {
    const { name, value } = e.target;

    setError({
      status: false,
      message: ""
    })

    if (name === "productId") {
      setAddInputs({
        ...addInputs,
        [name]: value,
        ["productInterest"]: productList.find((product: any) => product.refProductId === value)?.refProductInterest,
        ["productDuration"]: productList.find((product: any) => product.refProductId === value)?.refProductDuration,
        ["refLoanAmount"]: null,
        ["refisInterest"]: false,
        ["refLoanBalance"]: 0,
      })
    } else {
      setAddInputs({
        ...addInputs,
        [name]: value
      })
    }

  }

  const submitAddLoan = () => {
    setNewLoading(true);


    axios.post(
      import.meta.env.VITE_API_URL + '/adminRoutes/addLoan',
      {
        refProductId: addInputs.productId,
        refLoanAmount: addInputs.refLoanAmount,
        refPayementType: addInputs.refPaymentType,
        refRepaymentStartDate: addInputs.refrepaymentStartDate,
        refLoanStatus: 1,
        refBankId: addInputs.refBankId,
        refLoanBalance: addInputs.refLoanBalance,
        isInterestFirst: addInputs.refisInterest,
        interest: (parseFloat(addInputs.productInterest) / 100) * (addInputs.refLoanAmount ? addInputs.refLoanAmount : 0),
        userId: id,
        refLoanExt: selectedLoanType?.code,
        refExLoanId: selectedLoanType?.code === 1 ? null : selectLoanOption
      },
      {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }
    ).then((response) => {
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
      localStorage.setItem("token", "Bearer " + data.token);

      if (data.success) {
        console.log(data)

        setNewLoading(false);

        toast.success('Successfully Loan Added', {
          position: 'top-right',
          autoClose: 2999,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Slide
        });

        setAddInputs({
          productId: "",
          productInterest: "",
          productDuration: "",
          refLoanAmount: null,
          refrepaymentStartDate: null,
          refPaymentType: "",
          refLoanStatus: "opened",
          refBankId: "",
          refisInterest: false,
          refLoanBalance: 0,
          refInterestMonth: 0
        })

        setActiveIndex(0);

        getLoanData();

      } else {


        console.log(data)

        setNewLoading(false);
        setError({
          status: true,
          message: data.error
        })

      }

    })
  }

  const [activeIndex, setActiveIndex] = useState(0); // 0 = Loan History, 1 = Create New Loan

  const [error, setError] = useState({ status: false, message: "" })
  const [rePaymentInfo, setRePaymentInfo] = useState({});
  const toggleRepaymentInfo = (index) => {
    setRePaymentInfo((prev) => ({
      ...prev,
      [index]: !prev[index], // toggle only this index
    }));
  };


  const isInterestAmount = (rowData: any) => {
    return (
      <>
        {
          rowData.isInterestFirst ? "Yes" : "No"
        }
      </>
    )

  }

  const Status = (rowData: any) => {
    return (
      <>
        {
          rowData.refLoanStatus.charAt(0).toUpperCase() + rowData.refLoanStatus.slice(1).toLowerCase()
        }
      </>
    )
  }


  const [filter, setFilter] = useState("all");

  const filterOption = [
    { label: "All Loan", value: "all" },
    { label: "Loan Opened", value: "opened" },
    { label: "Loan Closed", value: "closed" },
    { label: "Loan Extended", value: "extended" },
    { label: "Loan Top Up", value: "topup" },
  ]

  const filteredLoanData = filter === "all"
    ? loanData
    : loanData.filter((loan: any) => loan.refLoanStatus === filter);

  const [loanDetails, setLoanDetails] = useState<any>([])


  const getLoanDatas = async (loanId: any) => {
    axios.post(
      import.meta.env.VITE_API_URL + '/rePayment/loanDetails',
      {

        loanId: loanId

      },
      {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }
    ).then((response) => {
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
      console.log('data line ------ 278', data)
      localStorage.setItem("token", "Bearer " + data.token);

      if (data.success) {
        setLoanDetails(data.data);
      }

    })
  }
  function formatToFirstOfMonth(dateString: string): string {
    const date = new Date(dateString);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = '01';

    return `${year}-${month}-${day}`;
  }

  const loanOptions = () => {
    axios.post(
      import.meta.env.VITE_API_URL + '/adminRoutes/addLoanOption',
      {
        userId: id
      },
      {
        headers: {
          Authorization: localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      }
    ).then((response) => {
      const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
      localStorage.setItem("token", "Bearer " + data.token);

      if (data.success) {
        const options = data.data.map((data: any) => ({
          label: `Loan Amt : ${data.refLoanAmount} - Interest : ${data.refProductInterest} - Duration : ${data.refProductDuration}`,
          value: data.refLoanId,
        }));
        setAddLoanOption(options)
      }
    })
  }

  return (
    <>
      <ToastContainer />
      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>{custId}</div>
      {loading ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#0478df',
              height: '76vh',
              width: '100%'
            }}
          >
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
          </div>
        </>
      ) : (
        <>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => { console.log(e.index); setActiveIndex(e.index) }}
            style={{ marginTop: "1rem" }}>
            <TabPanel header="Loan History">

              <div style={{ padding: "20px 0px" }}>
                <Dropdown
                  id="statusChoose"
                  value={filter}
                  options={filterOption}
                  optionLabel="label"
                  optionValue="value"
                  onChange={(e) => { setFilter(e.value) }}
                  required
                />
              </div>

              <DataTable
                paginator
                rows={5}
                value={filteredLoanData} // Use the filtered data here
                showGridlines
                scrollable
                emptyMessage={<div style={{ textAlign: 'center' }}>No Records Found</div>}
                tableStyle={{ minWidth: '50rem', overflow: 'auto' }}
              >
                <Column style={{ minWidth: '8rem' }} field="refLoanStartDate" header="Loan Start Date"></Column>
                <Column style={{ minWidth: '8rem' }} field="refLoanDueDate" header="Loan Closed Date"></Column>
                <Column style={{ minWidth: '8rem' }} field="principal" header="Principal Amount"></Column>
                <Column
                  style={{ minWidth: '8rem' }}
                  header="Interest %"
                  body={(rowData) => rowData.refProductInterest != null ? `${rowData.refProductInterest} %` : '--'}
                />
                <Column style={{ minWidth: '8rem' }} body={(rowData) => rowData.refProductDuration != null ? `${rowData.refProductDuration} Months` : '--'} header="Loan Duration"></Column>
                <Column style={{ minWidth: '8rem' }} body={isInterestAmount} header="Interest First"></Column>
                <Column style={{ minWidth: '8rem' }} body={Status} header="Status"></Column>
              </DataTable>

            </TabPanel>
            <TabPanel header="Create New Loan">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submitAddLoan()
                }}
              >

                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      name="productId"
                      style={{ width: '100%', minWidth: '100%', padding: '0' }}
                      value={addInputs.productId}
                      options={productList}
                      optionLabel="refProductName"
                      optionValue="refProductId"
                      onChange={(e) => { handleInput(e) }}
                      filter
                      placeholder="Select Product"
                      required
                    />
                    <label>Select Product</label>
                  </FloatLabel>




                  <FloatLabel style={{ width: '100%' }}>
                    <InputNumber
                      style={{ width: "100%" }}
                      inputId="currency-india"
                      id="refLoanAmount"
                      name="refLoanAmount"
                      useGrouping={true}
                      mode="currency" currency="INR" currencyDisplay="symbol" locale="en-IN"
                      value={addInputs.refLoanAmount}
                      onChange={(e: any) => {
                        if (addInputs.refisInterest) {
                          const val = parseFloat(e.value) - (parseFloat(e.value) * (parseFloat(addInputs.productInterest) / 100)) * (parseFloat(addInputs.productDuration))
                          setAddInputs({ ...addInputs, ["refLoanAmount"]: e.value, ["refLoanBalance"]: val })
                        } else {
                          setAddInputs({ ...addInputs, ["refLoanAmount"]: e.value, ["refLoanBalance"]: e.value })
                        }
                      }}
                      required />
                    <label htmlFor="refLoanAmount">Enter Loan Amount</label>
                  </FloatLabel>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Calendar
                      dateFormat="dd/mm/yy"
                      name="refrepaymentStartDate"
                      style={{ width: '100%' }}
                      value={addInputs.refrepaymentStartDate}
                      id="refrepaymentStartDate"
                      onChange={(e: any) => {
                        handleInput(e)
                      }}
                      required
                    />
                    <label htmlFor="refrepaymentStartDate">Repayement Start Date</label>
                  </FloatLabel>

                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      id="refPaymentType"
                      name="refPaymentType"
                      style={{ width: '100%', minWidth: '100%', padding: '0' }}
                      value={addInputs.refPaymentType}
                      options={paymentType}
                      optionLabel="label"
                      optionValue="id"
                      placeholder="Select Payment Type"
                      onChange={(e) => { handleInput(e) }}
                      required
                    />
                    <label htmlFor="refPaymentType">Choose Payment type</label>
                  </FloatLabel>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      name="refBankId"
                      style={{ width: '100%', minWidth: '100%' }}
                      value={addInputs.refBankId}
                      options={allBankAccountList}
                      optionLabel="refBankName"
                      optionValue="refBankId"
                      onChange={(e: any) => handleInput(e)}
                      required
                      id="refBankId"
                    />
                    <label htmlFor="refBankId"> Choose Bank</label>
                  </FloatLabel>

                  <div className="flex flex-row justify-start align-items-center w-[100%]" style={{ display: 'flex', width: '100%', alignItems: 'start', flexDirection: "column" }}>
                    <label className="w-[30%]">Is Interest First:</label>
                    <div style={{ display: "flex", width: "30%", alignItems: "center", justifyContent: "start", gap: "20px" }}>
                      <div>
                        <input
                          type="radio"
                          id="interestFirstYes"
                          name="isInterestFirst"
                          checked={addInputs.refisInterest === true}
                          onChange={() => {
                            if (addInputs.refLoanAmount && addInputs.productId) {
                              const val = parseFloat(addInputs.refLoanAmount) - (parseFloat(addInputs.refLoanAmount) * ((parseFloat(addInputs.productInterest) / 100))) * (parseFloat(addInputs.productDuration))
                              setAddInputs({ ...addInputs, ["refisInterest"]: true, ["refInterestMonth"]: 1, ["refLoanBalance"]: val })
                            } else {
                              setAddInputs({ ...addInputs, ["refisInterest"]: true })
                            }
                          }}
                          required
                        />
                        <label htmlFor="interestFirstYes">Yes</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          id="interestFirstNo"
                          name="isInterestFirst"
                          checked={addInputs.refisInterest === false}
                          onChange={() => {

                            if (addInputs.refLoanAmount && addInputs.productId) {
                              const val = parseFloat(addInputs.refLoanAmount)
                              setAddInputs({ ...addInputs, ["refisInterest"]: false, ["refInterestMonth"]: 0, ["refLoanBalance"]: val })
                            } else {
                              setAddInputs({ ...addInputs, ["refisInterest"]: false })
                            }
                          }}
                          required
                        />
                        <label htmlFor="interestFirstNo">No</label>
                      </div>
                    </div>
                    {/* {
                      addInputs.refisInterest && <div className="w-[50%]">
                        <div className="w-full">
                          <FloatLabel >
                            <InputNumber
                              style={{ width: "100%" }}
                              id="refInterestMonth"
                              name="refInterestMonth"
                              useGrouping={true}
                              value={addInputs.refInterestMonth}
                              onChange={(e) => {
                                const loanAmount = addInputs.refLoanAmount || 0;
                                const interest = parseFloat(addInputs.productInterest) || 0;
                                const duration = e.value || 0;

                                if (loanAmount && addInputs.productId) {
                                  const totalInterest = loanAmount * (interest / 100) * duration;
                                  const loanBalance = loanAmount - totalInterest;

                                  setAddInputs({
                                    ...addInputs,
                                    refInterestMonth: duration,
                                    refLoanBalance: loanBalance
                                  });
                                }
                              }}

                              required />
                            <label htmlFor="refLoanBalance">Month</label>
                          </FloatLabel>
                        </div>
                      </div>
                    } */}

                  </div>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '30%' }}>
                    <InputNumber
                      style={{ width: "100%" }}
                      id="refLoanBalance"
                      name="refLoanBalance"
                      useGrouping={true}
                      value={addInputs.refLoanBalance}
                      mode="currency" currency="INR" currencyDisplay="symbol" locale="en-IN"
                      disabled
                      required />
                    <label htmlFor="refLoanBalance">Loan Balance</label>
                  </FloatLabel>
                  <Dropdown value={selectedLoanType} required onChange={(e: DropdownChangeEvent) => {
                    setLoanType(e.value)
                    loanOptions()
                  }} options={loanType} optionLabel="name"
                    placeholder="Select a Loan Type" className="w-[30%]" />
                  {
                    selectedLoanType?.code !== 1 && (
                      <Dropdown
                        required
                        value={selectLoanOption}
                        onChange={(e: DropdownChangeEvent) => setSelectLoanOption(e.value)}
                        options={addLoanOption}
                        optionLabel="label"
                        placeholder="Select a Loan"
                        className="w-[30%]"
                      />
                    )
                  }






                </div>


                {
                  error.status ? (
                    <div style={{ marginTop: "20px", color: "red" }}>{error.message}</div>
                  ) : null
                }

                <div>
                  {newLoading ? (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '35px'
                      }}
                    >
                      <Button
                        style={{ width: '20%' }}
                        type="submit"
                        icon="pi pi-spin pi-spinner"
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '35px'
                      }}
                    >
                      <Button
                        style={{ width: '20%' }}
                        type="submit"
                        label="Submit"
                      />
                    </div>
                  )}{' '}
                </div>
              </form>
            </TabPanel>
            <TabPanel header="Loan Audit">
              <>

                {loanDetails.map((item, index) => (
                  <>
                    <Divider align="left">
                      <div className="inline-flex align-items-center">
                        <i className="pi pi-wallet mr-2 text-[#007bff]"></i>
                        <b className="text-[#007bff]">Loan {index + 1}</b>
                      </div>
                    </Divider>
                    <div className="w-full my-3 border-2 border-transparent rounded-md shadow-3">
                      <div className="m-3 w-full flex ">

                        <div className="w-[30%]">
                          <p>Loan Name :{loanDetails[index]?.refProductName}</p>
                        </div>
                        <div className="w-[30%]">
                          <p>Total Amount : &#8377; {loanDetails[index]?.refLoanAmount}</p>
                        </div>
                        <div className="w-[30%]">
                          <p>Balance Amount : &#8377; {loanDetails[index]?.refBalanceAmt}</p>
                        </div>
                        {
                          !rePaymentInfo[index] ?
                            <div className="w-[10%]">
                              <BsInfoCircle size={"1.5rem"} color="blue" onClick={() => toggleRepaymentInfo(index)} />
                            </div>
                            :
                            <div className="w-[10%]">
                              <IoCloseCircleOutline size={"1.7rem"} color="red" onClick={() => toggleRepaymentInfo(index)} />
                            </div>
                        }
                      </div>
                      {
                        rePaymentInfo[index] &&
                        <>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>Loan Duration : {loanDetails[index]?.refProductDuration}</p>
                            </div>
                            <div className="w-[30%]">
                              <p>Interest : {loanDetails[index]?.refProductInterest}%</p>
                            </div>
                            <div className="w-[30%]">
                              <p>Interest Paid Initial : {loanDetails[index]?.isInterestFirst === true ? "Yes" : "No"}</p>
                            </div>

                          </div>
                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>Loan Get Date : {loanDetails[index]?.refLoanStartDate}</p>
                            </div>
                            <div className="w-[30%]">
                              <p>Loan Start Month : {loanDetails[index].refRepaymentStartDate ? formatToFirstOfMonth(loanDetails[index].refRepaymentStartDate) : " -"}</p>
                            </div>
                            <div className="w-[30%]">
                              <p>Loan End Month : {loanDetails[index]?.refLoanDueDate}</p>
                            </div>

                          </div>

                          <div className="m-3 w-full flex ">
                            <div className="w-[30%]">
                              <p>Total Interest Paid : &#8377; {loanDetails[index]?.totalInterest}</p>
                            </div>
                            <div className="w-[30%]">
                              <p>Total Principal Paid : &#8377; {loanDetails[index]?.totalPrincipal}</p>
                            </div>
                            <div className="w-[30%]">
                              <p>
                                Loan Status : {loanDetails[index]?.refLoanStatus?.charAt(0).toUpperCase() + loanDetails[index]?.refLoanStatus?.slice(1)}
                              </p>

                            </div>


                          </div>
                          <Divider />
                          <div className="m-2 border-1 shadow-md border-[#c7c7c7ef]">
                            <LoanAudit loanId={item.refLoanId} />

                          </div>

                        </>

                      }
                    </div>


                  </>
                ))}
              </>
            </TabPanel>
          </TabView></>)}
    </>
  )
}

export default Addnewloan