import axios from 'axios'
import { Calendar } from 'primereact/calendar'
import { useEffect, useState } from 'react'
import decrypt from '../Helper/Helper'
import { Divider } from 'primereact/divider'

type Props = {}

export interface FundDetail {
  Balance: string
  refFundTypeId: number
  refFundTypeName: string
}

export interface BalanceSummary {
  openingBalance: number
  clossingBalance: number 
  FundDetails: FundDetail[]
}

export default function OpenCloseBalanceMain({}: Props) {
  const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [balanceData,setBalanceData] = useState<BalanceSummary>()

  const getData = async (startDate: Date, endDate: Date) => {
    console.log('endDate', endDate)
    console.log('startDate', startDate)
    try {
      await axios
        .post(
          import.meta.env.VITE_API_URL + '/openClosingBalance/getData',
          {
            startDate: startDate,
            endDate: endDate
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
            console.log('data line ------ 39', data)
            if (data.success) {
              setBalanceData(data.data)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
    }
    
    useEffect(() => { 
        const callData = async () => {
            await getData(startDate, endDate)
        }
        callData()
    },[])

  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex gap-x-5 align-items-center justify-between">
        <div className="flex gap-4">
          <div className="flex-col align-items-center">
            <label className="font-bold block mb-2">Select Start Date : </label>
            <Calendar
              placeholder="DD/MM/YYYY"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.value ?? new Date())
                if (e.value && endDate < e.value) {
                  setEndDate(e.value ?? new Date())
                  getData(e.value, e.value)
                } else {
                  if (e.value) {
                    getData(e.value, endDate)
                  }
                }
              }}
              dateFormat="dd/mm/yy"
              maxDate={new Date()}
            />
          </div>
          <div className="flex-col align-items-center">
            <label className="font-bold block mb-2">Select End Date : </label>
            <Calendar
              placeholder="DD/MM/YYYY"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.value ?? new Date())
                if (e.value) {
                  getData(startDate, e.value)
                }
              }}
              dateFormat="dd/mm/yy"
              maxDate={new Date()}
              minDate={startDate}
            />
          </div>
        </div>
        <div>
          <b className="flex gap-2 text-lg">
            Opening Balance :{' '}
            <p
              style={{
                color: (balanceData?.openingBalance ?? 0) < 0 ? 'red' : 'green'
              }}
            >
              ₹ {balanceData?.openingBalance}
            </p>
          </b>
        </div>
      </div>

      <div className="flex justify-around ">
        <div className="w-[45%] shadow-3 rounded-md flex justify-center flex-col p-3">
          <div className="flex justify-between">
            <p className="text-lg font-bold">Income Data</p>
            <p className="text-lg font-bold">Total</p>
          </div>

          <Divider className="my-2" />
          <div className="flex flex-col gap-y-2">
            {/* Dynamic Fund Details */}
            {balanceData?.FundDetails.filter((item) =>
              [2, 3, 5, 8].includes(item.refFundTypeId)
            ).map((item, index) => (
              <div key={index} className="flex justify-between">
                <p className="text-lg">{item.refFundTypeName}</p>
                <p className="text-lg font-bold">₹ {item.Balance}</p>
              </div>
            ))}
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-bold">
              ₹{' '}
              {balanceData?.FundDetails.filter((item) =>
                [2, 3, 5, 8].includes(item.refFundTypeId)
              ).reduce((acc, item) => acc + Number(item.Balance), 0)}
            </p>
          </div>
        </div>

        <div className="w-[45%] shadow-3 rounded-md flex justify-center flex-col p-3">
          <div className="flex justify-between">
            <p className="text-lg font-bold ">Expense Data</p>
            <p className="text-lg font-bold">Total</p>
          </div>

          <Divider className="my-2" />
          <div className="flex flex-col gap-y-2">
            {/* Dynamic Fund Details */}
            {balanceData?.FundDetails.filter((item) => [1, 4, 7].includes(item.refFundTypeId)).map(
              (item, index) => (
                <div key={index} className="flex justify-between">
                  <p className="text-lg">{item.refFundTypeName}</p>
                  <p className="text-lg font-bold">₹ {item.Balance}</p>
                </div>
              )
            )}
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-bold">
              ₹{' '}
              {balanceData?.FundDetails.filter((item) =>
                [1, 4, 7].includes(item.refFundTypeId)
              ).reduce((acc, item) => acc + Number(item.Balance), 0)}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="w-[40%] shadow-3 flex justify-between items-center rounded-md p-3 m-3">
          <p className="text-lg font-bold">Closing Balance</p>
          <p
            className="text-lg font-bold"
            style={{
              color: (balanceData?.clossingBalance ?? 0) < 0 ? 'red' : 'green'
            }}
          >
            ₹ {balanceData?.clossingBalance}{' '}
          </p>
        </div>
      </div>
    </div>
  )
}
