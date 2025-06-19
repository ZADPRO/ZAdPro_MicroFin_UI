import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { MdEditLocationAlt } from 'react-icons/md'
import { Slide, toast, ToastContainer } from 'react-toastify'

interface listArea {
  refAreaId: number
  refAreaName: string
  refAreaPrefix: string
  refAreaPinCodeId: number | null
  refAreaPinCode: string | null
  customerCount: number
}
interface updatePicode {
  pinCode: string
  refAreaPinCodeId: number | null
}

interface GroupedArea {
  refAreaId: number
  refAreaName: string
  refAreaPrefix: string
  pinCodes: {
    pinCode: string
    customerCount: number
    refAreaPinCodeId: number | null
  }[]
}

export default function Area() {
  const [areaList, setAreaList] = useState<listArea[]>([])
  const [expandedRows, setExpandedRows] = useState<any>(null)
  const [prefixInputs, setPrefixInputs] = useState<string[]>([''])
  const [areaId, setAreaId] = useState<number | null>()
  const [updatePincode, setUpdatePincode] = useState<updatePicode[]>([])
  const [areaName, setAreaName] = useState<string>()
  const [areaPrefix, setAreaPrefix] = useState<string>()
  const [inputErrors, setInputErrors] = useState<boolean[]>([])
  const [inputErrorMessages, setInputErrorMessages] = useState<string[]>([])
  const [addArea, setAddArea] = useState<boolean>()
  const [updateArea, setUpdateArea] = useState<boolean>()
  const [moveTargets, setMoveTargets] = useState<{ [key: number]: number | null }>({})
  const formRef = useRef<HTMLDivElement>(null) // 1️⃣ create ref for the form

  const handleInputChange = (value: string, index: number) => {
    const updatedInputs = [...prefixInputs]
    updatedInputs[index] = value
    setPrefixInputs(updatedInputs)

    // Initialize errors array if needed
    const newErrors = [...inputErrors]
    const newErrorMessages = [...inputErrorMessages]

    if (value.length === 6) {
      try {
        axios
          .post(
            import.meta.env.VITE_API_URL + '/area/checkPinCode',
            {
              pinCode: value
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

            if (data.success) {
              if (!data.validation) {
                // set error for this index
                newErrors[index] = true
                newErrorMessages[index] = `The Area "${data.data}" already contains this Pincode`
              } else {
                newErrors[index] = false
                newErrorMessages[index] = ''
              }

              setInputErrors(newErrors)
              setInputErrorMessages(newErrorMessages)
            }
          })
      } catch (error) {
        console.log('error', error)
      }
    } else {
      // If input is not complete 6 digits, clear error for this index
      newErrors[index] = false
      newErrorMessages[index] = ''
      setInputErrors(newErrors)
      setInputErrorMessages(newErrorMessages)
    }

    // Add new empty box if last and valid
    if (index === prefixInputs.length - 1 && value.length === 6 && /^[0-9]{6}$/.test(value)) {
      setPrefixInputs([...updatedInputs, ''])
      setInputErrors([...newErrors, false]) // Add empty error slot
      setInputErrorMessages([...newErrorMessages, '']) // Add empty error message slot
    }
  }
  const updateHandleInputChange = (value: string, index: number) => {
    const updatedInputs = [...updatePincode]
    updatedInputs[index] = {
      pinCode: value,
      refAreaPinCodeId: updatedInputs[index].refAreaPinCodeId
    }
    setUpdatePincode(updatedInputs)

    // Initialize errors array if needed
    const newErrors = [...inputErrors]
    const newErrorMessages = [...inputErrorMessages]

    if (value.length === 6) {
      try {
        axios
          .post(
            import.meta.env.VITE_API_URL + '/area/checkPinCode',
            {
              pinCode: value
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

            if (data.success) {
              if (!data.validation) {
                // set error for this index
                if (data.pinCodeId === updatedInputs[index].refAreaPinCodeId) {
                  newErrors[index] = false
                  newErrorMessages[index] = ''
                } else {
                  newErrors[index] = true
                  newErrorMessages[index] = `The Area "${data.data}" already contains this Pincode`
                }
              } else {
                newErrors[index] = false
                newErrorMessages[index] = ''
              }

              setInputErrors(newErrors)
              setInputErrorMessages(newErrorMessages)
            }
          })
      } catch (error) {
        console.log('error', error)
      }
    } else {
      // If input is not complete 6 digits, clear error for this index
      newErrors[index] = false
      newErrorMessages[index] = ''
      setInputErrors(newErrors)
      setInputErrorMessages(newErrorMessages)
    }

    // Add new empty box if last and valid
    if (index === updatePincode.length - 1 && value.length === 6 && /^[0-9]{6}$/.test(value)) {
      setUpdatePincode([...updatedInputs, { pinCode: '', refAreaPinCodeId: null }])
      setInputErrors([...newErrors, false])
      setInputErrorMessages([...newErrorMessages, ''])
    }
  }

  const renderInputRows = () => {
    return prefixInputs.map((val, index) => {
      const showError = val.length > 0 && val.length !== 6

      return (
        <div key={index} className="flex flex-col w-[95%] justify-center items-center mt-2">
          <div className="flex w-full justify-around items-center mb-1">
            <label htmlFor={`area-code-${index}`} className="w-[40%]">
              Enter Area Code {index + 1}
            </label>

            <InputText
              id={`area-code-${index}`}
              className="w-[40%]"
              value={val}
              required={prefixInputs[index].length > 0}
              maxLength={6}
              minLength={6}
              onChange={(e) => {
                handleInputChange(e.target.value, index)
              }}
              placeholder="Enter 6 digit Pincode"
            />
          </div>

          {showError && (
            <div className="w-[40%] text-[red] text-sm text-left">
              Area code must be exactly 6 digits.
            </div>
          )}

          {/* API error */}
          {inputErrors[index] && (
            <div className="w-[60%] flex justify-end text-[red] text-sm text-left mt-1">
              {inputErrorMessages[index]}
            </div>
          )}
        </div>
      )
    })
  }
  const updateRenderInputRows = () => {
    return updatePincode.map((val, index) => {
      console.log('val line ----- 224', val)
      const showError = val.pinCode.length > 0 && val.pinCode.length !== 6

      return (
        <div key={index} className="flex flex-col w-[95%] justify-center items-center mt-2">
          <div className="flex w-full justify-around items-center mb-1">
            <label htmlFor={`area-code-${index}`} className="w-[40%]">
              Enter Area Code {index + 1}
            </label>

            <InputText
              id={`area-code-${index}`}
              className="w-[40%]"
              value={val.pinCode}
              required={updatePincode[index].pinCode.length > 0}
              maxLength={6}
              minLength={6}
              onChange={(e) => {
                updateHandleInputChange(e.target.value, index)
              }}
              placeholder="Enter 6 digit Pincode"
            />
          </div>

          {showError && (
            <div className="w-[40%] text-[red] text-sm text-left">
              Area code must be exactly 6 digits.
            </div>
          )}

          {/* API error */}
          {inputErrors[index] && (
            <div className="w-[60%] flex justify-end text-[red] text-sm text-left mt-1">
              {inputErrorMessages[index]}
            </div>
          )}
        </div>
      )
    })
  }

  const onsubmit = () => {
    const pincode = prefixInputs.filter((data) => data.length === 6)

    console.log('pincode', pincode)
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/area/addArea',
          {
            areaName: areaName,
            areaPrefix: areaPrefix,
            areaPinCode: pincode
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
            getAreaList()
            setPrefixInputs([''])
            setAreaId(null)
            setAreaName('')
            setAreaPrefix('')
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

  const onUpdatesubmit = () => {
    console.log('prefixInputs line ------ > 44', prefixInputs)
    const pincode = updatePincode.filter((data) => data.pinCode.length === 6)

    console.log('pincode', pincode)
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/area/updateArea',
          {
            areaId: areaId,
            areaName: areaName,
            areaPrefix: areaPrefix,
            areaPinCode: pincode
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
          console.log('data line ----- 331', data)

          if (data.success) {
            setAddArea(false)
            setUpdateArea(false)
            getAreaList()
            setUpdatePincode([])
            setAreaId(null)
            setAreaName('')
            setAreaPrefix('')
            toast.success('Area details is Updated Successfully', {
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
          } else {
            toast.error('Error in Updating the Area Details', {
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

  const getAreaList = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/area/listArea', {
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
          localStorage.setItem('token', 'Bearer ' + data.token)
          console.log('data line ------ 177', data)
          if (data.success) {
            setAreaList(data.data)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  const groupedData: GroupedArea[] = useMemo(() => {
    const map = new Map<number, GroupedArea>()

    areaList.forEach((item) => {
      if (!map.has(item.refAreaId)) {
        map.set(item.refAreaId, {
          refAreaId: item.refAreaId,
          refAreaName: item.refAreaName,
          refAreaPrefix: item.refAreaPrefix,
          pinCodes: []
        })
      }

      if (item.refAreaPinCode && item.refAreaPinCode.trim() !== '') {
        map.get(item.refAreaId)?.pinCodes.push({
          pinCode: item.refAreaPinCode,
          customerCount: item.customerCount,
          refAreaPinCodeId: item.refAreaPinCodeId
        })
      }
    })

    return Array.from(map.values())
  }, [areaList])

  const rowExpansionTemplate = (data: GroupedArea) => {
    return (
      <div className="flex justify-center">
        <DataTable size="small" value={data.pinCodes} className="w-full" dataKey="refAreaPinCodeId">
          <Column
            header="S.No"
            body={(_rowData, options) => options.rowIndex + 1}
            style={{ width: '5rem' }}
          />
          <Column field="pinCode" header="Pincode" />
          <Column field="customerCount" header="Customer Count" />
          <Column
            header="Actions"
            body={(pinCodeData) => {
              const isMoveSelected = moveTargets[pinCodeData.refAreaPinCodeId] !== undefined

              return (
                <div className="flex gap-2 items-center">
                  <select
                    onChange={(e) => {
                      const action = e.target.value
                      if (action === 'create') {
                        // Clear moveTargets to hide second select
                        setMoveTargets((prev) => {
                          const updated = { ...prev }
                          delete updated[pinCodeData.refAreaPinCodeId]
                          return updated
                        })

                        // Add to update list and scroll to form
                        setUpdatePincode([
                          ...updatePincode,
                          {
                            refAreaPinCodeId: pinCodeData.refAreaPinCodeId,
                            pinCode: pinCodeData.pinCode
                          }
                        ])
                        setUpdateArea(true)
                        formRef.current?.scrollIntoView({ behavior: 'smooth' })
                      } else if (action === 'move') {
                        setMoveTargets((prev) => ({
                          ...prev,
                          [pinCodeData.refAreaPinCodeId]: null // initialize move target
                        }))
                      } else {
                        // Reset
                        setMoveTargets((prev) => {
                          const updated = { ...prev }
                          delete updated[pinCodeData.refAreaPinCodeId]
                          return updated
                        })
                      }
                    }}
                  >
                    <option value="">Select Action</option>
                    <option value="create">Move to New Area</option>
                    <option value="move">Move to Another Area</option>
                  </select>

                  {isMoveSelected && (
                    <select
                      value={moveTargets[pinCodeData.refAreaPinCodeId] ?? ''}
                      onChange={(e) => {
                        const targetAreaId = parseInt(e.target.value)
                        setMoveTargets((prev) => ({
                          ...prev,
                          [pinCodeData.refAreaPinCodeId]: targetAreaId
                        }))

                        movePincode(targetAreaId, pinCodeData.refAreaPinCodeId)
                      }}
                    >
                      <option value="">Select Area</option>
                      {groupedData
                        .filter((area) => area.refAreaId !== data.refAreaId) // exclude current Area
                        .map((area) => (
                          <option key={area.refAreaId} value={area.refAreaId}>
                            {area.refAreaName}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )
            }}
          />
        </DataTable>
      </div>
    )
  }

  const movePincode = (areaId: number, pinCodeId: number) => {
    console.log('pinCodeId', pinCodeId)
    console.log('areaId', areaId)
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/area/movePinCode',
          {
            areaId: areaId,
            pinCodeId: pinCodeId
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
          if (data.success) {
            getAreaList()
            toast.success('Pincode is to Another Area', {
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
          } else {
            toast.error('Error in Moving the Pincode to another Area', {
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
    } catch (error) {
      console.log('error', error)
    }
  }

  const setAreaDataToEdit = (data: GroupedArea) => {
    setAreaName(data.refAreaName)
    setAreaPrefix(data.refAreaPrefix)
    setUpdatePincode(data.pinCodes)
    setAreaId(data.refAreaId)
    setUpdatePincode([
      ...data.pinCodes,
      {
        pinCode: '',
        refAreaPinCodeId: null
      }
    ])
  }

  useEffect(() => {
    setAddArea(false)
    getAreaList()
  }, [])

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [updateArea])

  return (
    <>
      <ToastContainer />
      <div className="w-full" ref={formRef}>
        <div>
          <b className="text-[1.3rem]">Manage Area's</b>
        </div>
        {!addArea && (
          <div className="w-full flex justify-end">
            <button
              onClick={() => {
                setAddArea(true)
                setUpdateArea(false)
              }}
              className="bg-[green] text-white px-10 py-1 rounded-md hover:bg-[#008000e8]"
            >
              Add New Area
            </button>
          </div>
        )}

        {addArea && !updateArea && (
          <div className="mt-2">
            <form
              className="shadow p-3 rounded-md"
              onSubmit={(e) => {
                e.preventDefault()
                onsubmit()
              }}
            >
              {/* <div className='w-full flex justify-center mb-2'>
                <b className='text-[1.2rem]'>Add New Area</b>
              </div> */}

              <div className="flex justify-around w-full">
                <div className="flex flex-column gap-2 w-[45%]">
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
                <div className="flex flex-column gap-2 w-[45%]">
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
              <div className="flex flex-col justify-around align-items-center w-full mt-2">
                <div className="w-[95%]">
                  <label className="mb-2">
                    <b>Area Pin-Codes: {prefixInputs.length}</b>
                  </label>
                </div>
                <div className="flex w-full justify-center align-items-center flex-col gap-y-2">
                  {renderInputRows()}
                </div>
              </div>

              {inputErrors.filter((data) => data === true).length === 0 && (
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
                      setPrefixInputs([])
                      setAreaId(null)
                      setAreaName('')
                      setAreaPrefix('')
                    }}
                    className="bg-[red] text-white hover:bg-[#ff0000e1] px-10 py-1 rounded-md"
                  >
                    close
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        {updateArea && !addArea && (
          <div className="mt-2">
            <form
              className="shadow p-3 rounded-md"
              onSubmit={(e) => {
                e.preventDefault()
                onUpdatesubmit()
              }}
            >
              <div className="flex justify-around w-full">
                <div className="flex flex-column gap-2 w-[45%]">
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
                <div className="flex flex-column gap-2 w-[45%]">
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
              <div className="flex flex-col justify-around align-items-center w-full mt-2">
                <div className="w-[95%]">
                  <label className="mb-2">
                    <b>Area Pin-Codes</b>
                  </label>
                </div>
                <div className="flex w-full justify-center align-items-center flex-col gap-y-2">
                  {updateRenderInputRows()}
                </div>
              </div>

              {inputErrors.filter((data) => data === true).length === 0 && (
                <div className="w-full flex justify-center my-3 gap-x-5">
                  <button
                    type="submit"
                    className="bg-[#78e6fa] hover:bg-[#78e6faea] text-white px-10 py-1 rounded-md"
                  >
                    Update Area
                  </button>
                  <button
                    onClick={() => {
                      setUpdateArea(false)
                      setUpdatePincode([])
                      setAreaId(null)
                      setAreaName('')
                      setAreaPrefix('')
                    }}
                    className="bg-[red] text-white hover:bg-[#ff0000e1] px-10 py-1 rounded-md"
                  >
                    close
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        <div className="w-full flex justify-center mt-2 ">
          <DataTable
            size="small"
            value={groupedData}
            expandedRows={expandedRows}
            onRowExpand={(e) => {
              setExpandedRows({ [e.data.refAreaId]: true })
            }}
            onRowCollapse={() => {
              setExpandedRows(null)
            }}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="refAreaId"
            className="w-full"
          >
            <Column expander style={{ width: '5rem' }} />
            <Column header="S.No" body={(_rowData, options) => options.rowIndex + 1} />
            <Column field="refAreaName" header="Area Name" />
            <Column field="refAreaPrefix" header="Area Prefix" />
            <Column
              header="Pincode Count"
              body={(rowData: GroupedArea) => rowData.pinCodes.length}
            />
            <Column
              header="Edit"
              body={(rowData: GroupedArea) => {
                return (
                  <div className="hover:text-[Green]">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setUpdateArea(true)
                        setAreaDataToEdit(rowData)
                        setAddArea(false)
                      }}
                      className="p-1"
                    >
                      <MdEditLocationAlt size={'1.3rem'} />
                    </button>
                  </div>
                )
              }}
            />
          </DataTable>
        </div>
      </div>
    </>
  )
}
