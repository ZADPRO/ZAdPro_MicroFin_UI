import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import axios from 'axios'
import { Slide, toast } from 'react-toastify'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'

// import React from 'react'

export interface productData {
  productName?: string
  interest?: string
  repaymentType?: number | null
  loanDueType?: number
  duration?: string
  InterestCalType?: number
  status?: string
  description?: string
  productId?: number
  ifInitialInterest?: boolean | null
  initialInterestCal?: number | null
}


interface LoanType {
  name: string
  value: number
}
interface ProductInputNewProps {
  closeSidebarNew: () => void // required function
  updateProductData?: productData // optional
}

const ProductInputNew = ({ closeSidebarNew, updateProductData }: ProductInputNewProps) => {
  const [productData, setProductData] = useState<productData | null>({
    ifInitialInterest: false
  })
  const [rePaymentTypeOptions, setRePaymentTypeOptions] = useState<LoanType[] | null>([])
  const [initialInterestCalOption, setInitialInterestCalOption] = useState<LoanType[] | []>([])
  const [update, setUpdate] = useState<boolean>(false)
  const [enableUpdate, setEnableUpdate] = useState<boolean>(false)
  const durationType = [
    { name: 'Monthly', code: 1 },
    { name: 'Weekly', code: 2 },
    { name: 'Daily', code: 3 }
  ]

  const interestCalculationType = [
    { name: 'DayWise Calculation', code: 1 },
    { name: 'Overall Calculation', code: 2 }
  ]

  const status = [
    { name: 'Active', code: 'active' },
    { name: 'Inactive', code: 'inactive' }
  ]

  const valueChange = (e) => {
    const { name, value } = e
    if (name === 'ifInitialInterest') {
      setProductData((prev) => ({
        ...(prev ?? {}),
        initialInterestCal: null
      }))
    }

    setProductData((prev) => ({
      ...(prev ?? {}),
      [name]: value
    }))
  }

  const goBack = () => {
    setUpdate(false)
    setEnableUpdate(false)
    closeSidebarNew()
  }

  const getOptions = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/product/productOptions', {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          console.log('response', response)
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          localStorage.setItem('token', 'Bearer ' + data.token)
          console.log('data line ------ 350 ', data)
          if (data.success) {
            const rePaymentOption = data.rePaymentType.map((data) => {
              return {
                name: data.refRepaymentTypeName,
                value: data.refRepaymentTypeId
              }
            })
            setRePaymentTypeOptions(rePaymentOption)
            const initialInterestData = data.initialInterestCalOption.map((data) => {
              return {
                name: data.refInterestCalName,
                value: data.refInterestCalId
              }
            })
            setInitialInterestCalOption(initialInterestData)
            setProductData({ ...productData, status: 'active' })
            if (updateProductData) {
              console.log('updateProductData line ------- 117', updateProductData)
              setUpdate(true)
              setEnableUpdate(true)
              setProductData(updateProductData)
            }
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const handelSubmit = () => {
    const route = update
      ? import.meta.env.VITE_API_URL + '/product/upDateProduct'
      : import.meta.env.VITE_API_URL + '/product/addNewProduct'
    console.log('productData line ------ 133', productData)
    try {
      axios
        .post(
          route,
          {
            productData
          },
          {
            headers: {
              Authorization: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          }
        )
        .then((response) => {
          console.log('response', response)
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          localStorage.setItem('token', 'Bearer ' + data.token)
          console.log('data line ------ 350 ', data)
          if (data.success) {
            const message = update
              ? 'Loan Product is Update Successfully'
              : 'New Product Added Successfully'
            toast.success(message, {
              position: 'top-right',
              autoClose: 2999,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Slide
            })
            goBack()
          }
        })
    } catch (error) {
      console.log('error', error)
      const message = update ? 'Error in updating the product data' : 'Error In Adding New Product'
      toast.error(message, {
        position: 'top-right',
        autoClose: 2999,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Slide
      })
    }
  }

  useEffect(() => {
    getOptions()
  }, [])
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handelSubmit()
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex w-full gap-x-5 align-items-end">
            <div className=" flex-1 flex flex-column gap-2">
              <label htmlFor="username">Enter Product Name</label>
              <InputText
                disabled={enableUpdate}
                value={productData?.productName}
                name="productName"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => valueChange(e.target)}
              />{' '}
            </div>
            <Divider layout="vertical" className="m-0" />

            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label> Select Repayment Type</label>
                <Dropdown
                  value={productData?.repaymentType}
                  required
                  disabled={enableUpdate}
                  name="repaymentType"
                  className="w-full"
                  onChange={(e: DropdownChangeEvent) => {
                    valueChange(e.target)
                    console.log('e.target', e.target.value)
                    if (e.target.value === 3) {
                      console.log(' -> Line Number ----------------------------------- 210')
                      setProductData((prev) => ({
                        ...(prev ?? {}),
                        duration: '1'
                      }))
                    }
                  }}
                  options={rePaymentTypeOptions ?? []}
                  optionLabel="name"
                />
              </div>
              <div className="flex-1">
                <label> Select Loan Due Type</label>
                <Dropdown
                  className="w-full md:h-[2.5rem] text-sm align-items-center"
                  inputId="durationType"
                  value={productData?.loanDueType}
                  required
                  disabled={enableUpdate}
                  name="loanDueType"
                  onChange={(e: DropdownChangeEvent) => {
                    valueChange(e.target)
                  }}
                  options={durationType}
                  optionLabel="name"
                  optionValue="code"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-x-5 align-items-end">
            <div className="flex-1 flex gap-3">
              <div className="flex-1 flex flex-row gap-2">
                <div className="flex-1 flex flex-col">
                  <label>Initial Interest</label>

                  <InputSwitch
                    checked={productData?.ifInitialInterest ?? false}
                    name="ifInitialInterest"
                    onChange={(e: InputSwitchChangeEvent) => {
                      valueChange(e.target)
                    }}
                  />
                </div>
                <div className="flex-3 flex flex-col">
                  <label>Select Initial Interest Collection Type</label>

                  <Dropdown
                    className="w-full md:h-[2.5rem] text-sm align-items-center"
                    inputId="durationType"
                    value={productData?.initialInterestCal}
                    required={productData?.ifInitialInterest ?? false}
                    disabled={enableUpdate || !productData?.ifInitialInterest}
                    name="initialInterestCal"
                    onChange={(e: DropdownChangeEvent) => {
                      valueChange(e.target)
                    }}
                    options={initialInterestCalOption}
                    optionLabel="name"
                    optionValue="value"
                  />
                </div>
              </div>
            </div>
            <Divider layout="vertical" className="m-0" />
            <div className="flex-1 flex gap-x-3 align-items-end">
              <div className=" flex-1 flex flex-column gap-2">
                <label htmlFor="username">Interest %</label>
                <InputText
                  required
                  type="number"
                  disabled={enableUpdate}
                  value={productData?.interest}
                  name="interest"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => valueChange(e.target)}
                />
              </div>
              {productData?.repaymentType !== 3 && (
                <>
                  <div className="flex-1  flex flex-column gap-2">
                    <label htmlFor="username">
                      {productData?.repaymentType === 3 ? 'Minimum Duration' : 'Loan Duration'}
                    </label>
                    <InputText
                      value={productData?.duration}
                      name="duration"
                      type="number"
                      required
                      disabled={enableUpdate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => valueChange(e.target)}
                    />{' '}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex w-full gap-x-5 align-items-center">
            <div className="flex-1 flex gap-x-3">
              <div className="flex-2 flex flex-col">
                <label>Select Interest Calculation Type</label>
                <Dropdown
                  value={productData?.InterestCalType}
                  options={interestCalculationType}
                  optionLabel="name"
                  optionValue="code"
                  disabled={enableUpdate}
                  name="InterestCalType"
                  onChange={(e: DropdownChangeEvent) => {
                    valueChange(e.target)
                  }}
                  required
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label>Status</label>
                <Dropdown
                  name="status"
                  value={productData?.status}
                  options={status}
                  optionLabel="name"
                  disabled={enableUpdate}
                  optionValue="code"
                  onChange={(e: DropdownChangeEvent) => {
                    valueChange(e.target)
                  }}
                  required
                />
              </div>
            </div>
            <Divider layout="vertical" className="m-0" />
            <div className="flex-1">
              <label htmlFor="description">Description</label>

              <InputTextarea
                id="description"
                value={productData?.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => valueChange(e.target)}
                name="description"
                required
                disabled={enableUpdate}
                rows={5}
                cols={30}
              />
            </div>
          </div>
          {update && enableUpdate && (
            <>
              <div className="w-full flex justify-around my-2">
                <Button
                  className="w-[50%] flex justify-center align-items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    setEnableUpdate(false)
                  }}
                >
                  Edit Product Details
                </Button>
              </div>
            </>
          )}
          {!enableUpdate && (
            <>
              <div className="w-full flex justify-around my-2">
                <Button className="w-[50%] flex justify-center align-items-center" type="submit">
                  {update ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProductInputNew
