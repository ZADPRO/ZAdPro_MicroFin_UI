import axios from 'axios'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'
import { Slide, toast, ToastContainer } from 'react-toastify'
import decrypt from '../Helper/Helper'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
interface option {
  label: string
  value: string
}
interface allAreaList {
  refAreaId: number
  refAreaName: string
  refAreaPrefix: string
  refAreaPinCodeId: number
  refAreaPinCode: string
  refMainAreaName: string
}

const Area: React.FC = () => {
  const [addArea, setAddArea] = useState<boolean>()
  const [areaName, setAreaName] = useState<string>()
  const [areaPrefix, setAreaPrefix] = useState<string>()
  const [areaPinCode, setAreaPinCode] = useState<string | null>()
  // const [areaId, setAreaId] = useState<number | null>()
  const [areaList, setAreaList] = useState<option[] | null>([])
  const [selectedArea, setSelectedArea] = useState<string | null>()
  const [allAreaList, setAllAreaList] = useState<allAreaList[]>([])

  const getAreaList = (data: string) => {
    if (data.length === 6) {
      axios
        .get(`https://api.postalpincode.in/pincode/${data}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response: any) => {
          const data = response.data[0].PostOffice
          const options: any = data.map((item: any) => ({
            label: item.Name,
            value: item.Name
          }))
          setAreaList(options)
        })
    } else {
      setAreaList(null)
    }
  }

  const onsubmit = () => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/area/addNewArea',
          {
            areaName: areaName,
            areaPrefix: areaPrefix,
            pinCode: areaPinCode,
            mainAreaName: selectedArea
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

          localStorage.setItem('token', 'Bearer ' + data.token)
          console.log('data line ----- 82', data)

          if (data.success) {
            setAddArea(false)
            setAreaName('')
            setAreaPinCode(null)
            setAreaPrefix('')
            setSelectedArea(null)
            toast.success('New Area is Created Successfully', {
              position: 'top-right',
              autoClose: 3599,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Slide
            })
            getAllAteaList()
          } else {
            toast.error('Error In Creating the New Area', {
              position: 'top-right',
              autoClose: 3599,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Slide
            })
          }
        })
    } catch (e: any) {
      console.log(e)
    }
  }

  const getAllAteaList = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/area/allAreaList', {
          headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json'
          }
        })
        .then((response: any) => {
          const data = decrypt(
            response.data[1],
            response.data[0],
            import.meta.env.VITE_ENCRYPTION_KEY
          )
          console.log('data line ------ 133', data)

          localStorage.setItem('token', 'Bearer ' + data.token)
          setAllAreaList(data.data)
        })
    } catch (error) {
      console.log('error line ----- 121', error)
    }
  }

  const headerTemplate = (data: allAreaList) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-bold">{data.refAreaPinCode}</span>
        <span className="font-bold">-</span>
        <span className="font-bold">{data.refMainAreaName}</span>
      </div>
    )
  }

  // const footerTemplate = (data: allAreaList) => {
  //   return (
  //     <React.Fragment>
  //       <td colSpan="5">
  //         <div className="flex justify-content-end font-bold w-full">
  //           Total Customers: {calculateCustomerTotal(data.representative.name)}
  //         </div>
  //       </td>
  //     </React.Fragment>
  //   )
  // }

  useEffect(() => {
    getAllAteaList()
  }, [])

  return (
    <>
      <ToastContainer />
      <div className="w-full">
        <div className="flex w-full">
          <div className="flex-2">
            <b className="text-[1.3rem]">Manage Area's</b>
          </div>
          {!addArea && (
            <div className="flex-1">
              <button
                onClick={() => {
                  setAddArea(true)
                }}
                className="bg-[green] text-white px-10 py-1 rounded-md hover:bg-[#008000e8]"
              >
                Add New Area
              </button>
            </div>
          )}
        </div>

        {addArea && (
          <div className="mt-2">
            <form
              className="shadow-md p-3 rounded-md flex flex-col gap-y-1"
              onSubmit={(e) => {
                e.preventDefault()
                onsubmit()
              }}
            >
              <div className="flex justify-around w-full">
                <div className="flex flex-column gap-1 w-[45%]">
                  <label htmlFor="username">Enter Area Name</label>
                  <InputText
                    className="w-full capitalize"
                    id="username"
                    value={areaName}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAreaName(e.target.value)
                    }}
                    aria-describedby="username-help"
                  />
                </div>
                <div className="flex flex-column gap-1 w-[45%]">
                  <label htmlFor="username">Enter Area Prefix</label>
                  <InputText
                    className="w-full uppercase"
                    value={areaPrefix}
                    id="username"
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAreaPrefix(e.target.value.toUpperCase())
                    }}
                    aria-describedby="username-help"
                  />
                </div>
              </div>
              <div className="flex justify-around w-full">
                <div className="flex flex-column gap-1 w-[45%]">
                  <label htmlFor="username">Enter PinCode</label>
                  <InputText
                    className="w-full"
                    type="number"
                    value={areaPinCode}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      console.log('e.target.value line ----- 96', e.target.value)
                      setAreaPinCode(e.target.value)
                      getAreaList(e.target.value)
                    }}
                    aria-describedby="username-help"
                  />
                </div>
                <div className="flex flex-column gap-1 w-[45%]">
                  <label htmlFor="username">Enter City</label>
                  <Dropdown
                    value={selectedArea}
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedArea(e.value)
                    }}
                    options={areaList ?? []}
                    optionLabel="label"
                    optionValue="value"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="w-full flex justify-center my-3 gap-x-5">
                <button
                  type="submit"
                  className="bg-[green] hover:bg-[#008000e1] text-white px-10 py-1 rounded-md"
                >
                  Add New Area
                </button>
                <button
                  onClick={() => {
                    setAddArea(false)
                    setAreaName('')
                    setAreaPrefix('')
                    setAreaPinCode(null)
                  }}
                  className="bg-[red] text-white hover:bg-[#ff0000e1] px-10 py-1 rounded-md"
                >
                  close
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="py-4">
          <DataTable
            size="small"
            value={allAreaList}
            rowGroupMode="subheader"
            groupRowsBy="refMainAreaName"
            sortMode="single"
            sortField="refMainAreaName"
            sortOrder={1}
            showGridlines
            scrollable
            scrollHeight="80vh"
            rowGroupHeaderTemplate={headerTemplate}
            className=""
            // rowGroupFooterTemplate={footerTemplate}
            // tableStyle={{ minWidth: '50rem' }}
          >
            <Column field="refAreaName" header="Area Name" style={{ minWidth: '200px' }}></Column>
            <Column
              field="refAreaPrefix"
              header="Area Prefix"
              style={{ minWidth: '200px' }}
            ></Column>
          </DataTable>
        </div>
      </div>
    </>
  )
}

export default Area
