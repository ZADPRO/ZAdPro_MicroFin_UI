import axios from 'axios'
import { useEffect } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import { useState } from 'react'
import decrypt from '../Helper/Helper'
import { Slide, toast } from 'react-toastify'

const AddnewFund = ({ closeSidebarNew }) => {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [bankOptions, setBankOptions] = useState([])

  const [inputs, setInputs]: any = useState({
    refBankId: '',
    refbfTransactionDate: '',
    refbfTransactionType: 'credit',
    refbfTransactionAmount: '',
    refBankName: '',
    refTxnId: "",
    refFundType: 'fund'
  })

  const handleInput = (e: any) => {
    const { name, value } = e.target

    setInputs((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }


  const Addnewback = async () => {

    setSubmitLoading(true);

    try {

      axios.post(import.meta.env.VITE_API_URL + "/adminRoutes/addBankFund", {
        refBankId: inputs.refBankId,
        refbfTransactionDate: inputs.refbfTransactionDate,
        refbfTransactionType: inputs.refbfTransactionType,
        refbfTransactionAmount: parseInt(inputs.refbfTransactionAmount),
        refTxnId: null,
        refFundType: inputs.refFundType,
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

          localStorage.setItem("token", "Bearer " + data.token);

          console.log(data)
          setSubmitLoading(false);

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


  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setInputs((prevState) => ({
      ...prevState,
      refbfTransactionDate: today
    }))

    const fetchBankDetails = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL + '/adminRoutes/getBankList',
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )

        const data = decrypt(
          response.data[1],
          response.data[0],
          import.meta.env.VITE_ENCRYPTION_KEY
        )

        localStorage.setItem("token", "Bearer " + data.token);

        if (data.success) {
          const bankData = data.BankFund.map((item: any) => ({
            bankname: item.refBankName,
            id: item.refBankId
          }))
          setBankOptions(bankData)
        }
      } catch (error) {
        console.log('Error fetching bank details:', error)
      }
    }

    fetchBankDetails()
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setInputs(prevState => ({
      ...prevState,
      refbfTransactionDate: today
    }));
  }, []);


  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid grey',
          paddingBottom: '10px'
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000' }}>Add New Fund</div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          Addnewback()
        }}
      >
        <div style={{ margin: '5px 0px', height: '78vh', overflow: 'auto', padding: '10px' }}>
          <div style={{ width: "100%", display: "flex", gap: "20px", marginTop: "35px" }}>

            <FloatLabel style={{ width: '100%' }}>
              <Dropdown
                name="refBankId"
                style={{ width: '100%', minWidth: '100%' }}
                value={inputs.refBankId}
                options={bankOptions}
                optionLabel="bankname"
                optionValue="id"
                onChange={(e: any) => handleInput(e)}
                required
              />
              <label htmlFor="refBankId">Choose Bank ID</label>
            </FloatLabel>


            <FloatLabel style={{ width: '100%', marginTop: '' }}>
              <InputText
                id="refbfTransactionAmount"
                name="refbfTransactionAmount"
                value={inputs.refbfTransactionAmount}
                onChange={(e: any) => handleInput(e)}
                required
              />
              <label htmlFor="refbfTransactionAmount">Transaction Amount</label>
            </FloatLabel>
          </div>


          <input type="hidden" name="refbfTransactionDate" value={inputs.refbfTransactionDate} />
          <input type="hidden" name="refbfTransactionType" value={inputs.refbfTransactionType} />
          <input type="hidden" name="refTxnId" value={inputs.refTxnId} />
          <input type="hidden" name="refFundType" value={inputs.refFundType} />


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

export default AddnewFund
