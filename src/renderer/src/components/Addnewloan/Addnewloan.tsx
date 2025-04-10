import axios from "axios";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react"
import decrypt from "../Helper/Helper";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Slide, toast, ToastContainer } from "react-toastify";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const Addnewloan = ({ custId, id, closeSidebarUpdate }) => {

  console.log(closeSidebarUpdate)

  const [loading, setLoading] = useState(true);
  const [newLoading, setNewLoading] = useState(false);

  const [allBankAccountList, setAllBankAccountList] = useState([]);
  const [productList, setProductList]: any = useState([]);

  const [loanData, setLoadData] = useState([]);


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
        setProductList(data.productList);
      }

    })

  }

  useEffect(() => {

    getLoanData();

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
        refLoanStatus: "opened",
        refBankId: addInputs.refBankId,
        refLoanBalance: addInputs.refLoanBalance,
        isInterestFirst: addInputs.refisInterest,
        interest: (parseFloat(addInputs.productInterest) / 100) * (addInputs.refLoanAmount ? addInputs.refLoanAmount : 0),
        userId: id,
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
          rowData.refLoanStatus === "opened" ? "Opened" : rowData.refLoanStatus === "closed" ? "Closed" : ""
        }
      </>
    )
  }


  const [filter, setFilter] = useState("all");

  const filterOption = [
    { label: "All Loan", value: "all" },
    { label: "Loan Opened", value: "opened" },
    { label: "Loan Closed", value: "closed" }
  ]

  const filteredLoanData = filter === "all"
    ? loanData
    : loanData.filter((loan: any) => loan.refLoanStatus === filter);

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
                  // style={{ width: '100%', minWidth: '100%', padding: '0' }}
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
                <Column style={{ minWidth: '8rem' }} field="interestAmount" header="Interest Amount"></Column>
                <Column style={{ minWidth: '8rem' }} field="refPayableAmount" header="Total Payable Amount"></Column>
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
                      required
                    />
                    <label>Select Product</label>
                  </FloatLabel>

                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      type="text"
                      id="interest"
                      name="interest"
                      value={addInputs.productInterest}
                      disabled
                      required
                    />
                    <label htmlFor="interest">Interest %</label>
                  </FloatLabel>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputText
                      type="text"
                      id="duration"
                      name="duration"
                      value={addInputs.productDuration}
                      disabled
                      required
                    />
                    <label htmlFor="duration">Duration (Months)</label>
                  </FloatLabel>

                  <FloatLabel style={{ width: '100%' }}>
                    <InputNumber
                      style={{ width: "100%" }}
                      id="refLoanAmount"
                      name="refLoanAmount"
                      useGrouping={true}
                      value={addInputs.refLoanAmount}
                      onChange={(e: any) => {
                        if (addInputs.refisInterest) {
                          const val = parseFloat(e.value) - (parseFloat(e.value) * (parseFloat(addInputs.productInterest) / 100))
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

                  <div style={{ display: 'flex', width: '100%', alignItems: 'start', flexDirection: "column" }}>
                    <label>Is Interest First:</label>
                    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                      <div>
                        <input
                          type="radio"
                          id="interestFirstYes"
                          name="isInterestFirst"
                          checked={addInputs.refisInterest === true}
                          onChange={() => {
                            if (addInputs.refLoanAmount && addInputs.productId) {
                              const val = parseFloat(addInputs.refLoanAmount) - (parseFloat(addInputs.refLoanAmount) * (parseFloat(addInputs.productInterest) / 100))
                              setAddInputs({ ...addInputs, ["refisInterest"]: true, ["refLoanBalance"]: val })
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
                              setAddInputs({ ...addInputs, ["refisInterest"]: false, ["refLoanBalance"]: val })
                            } else {
                              setAddInputs({ ...addInputs, ["refisInterest"]: false })
                            }
                          }}
                          required
                        />
                        <label htmlFor="interestFirstNo">No</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <InputNumber
                      style={{ width: "100%" }}
                      id="refLoanBalance"
                      name="refLoanBalance"
                      useGrouping={true}
                      value={addInputs.refLoanBalance}
                      disabled
                      required />
                    <label htmlFor="refLoanBalance">Loan Balance</label>
                  </FloatLabel>


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
          </TabView></>)}
    </>
  )
}

export default Addnewloan