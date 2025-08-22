import SecondaryHeader from '@renderer/components/SecondaryHeader/SecondaryHeader'
import React from 'react'
import { IoCalendarOutline } from 'react-icons/io5'
import { IoCard } from 'react-icons/io5'
import { AiOutlineRise } from 'react-icons/ai'
import { Divider } from 'primereact/divider'
// import { Chart } from 'primereact/chart'

const LatestDashboard: React.FC = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Profit',
        data: [5000, 30000, 18256598, 25000, 15000, 35000, 120000],
        borderColor: '#16a34a', // Tailwind green-600
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#16a34a',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Loss',
        data: [20000, 10000, 5000, 20000, 35000, 50000, 70000],
        borderColor: '#991b1b', // Tailwind red-800
        backgroundColor: 'rgba(153, 27, 27, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [6, 6], // Dotted line
        pointBackgroundColor: '#991b1b',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151', // Tailwind gray-700
          usePointStyle: true,
          pointStyleWidth: 12,
          padding: 20,
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: '#111827', // Tailwind gray-900
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280', // Tailwind gray-500
          font: {
            size: 13
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6b7280',
          callback: (value: number) => {
            if (value >= 1000) return value / 1000 + 'k'
            return value
          }
        },
        grid: {
          color: '#f3f4f6' // Tailwind gray-100
        }
      }
    }
  }

  console.log("data", data, options)
  return (
    <div>
      <SecondaryHeader />
      <div className="flex px-3 py-2 align-items-center justify-content-between">
        <div className="flex gap-3 align-items-center">
          <div className="rounded-full p-2 border-1">
            <IoCalendarOutline />
          </div>
          <div>
            <p className="py-1 px-4 border-1 rounded-full">This Month</p>
          </div>
        </div>
        <div className="bg-[#0478df] px-4 py-1 border-1 rounded-full text-white">
          <p>Add new loan</p>
        </div>
      </div>

      <div className="flex px-3 py-2 gap-[2%] h-full">
        <div className="flex flex-col w-[70%] h-full">
          {/* OPENING AND CLOSE BALANCE DATA  */}
          <div className="flex flex-1 gap-3">
            <div className="flex-1 rounded-xl shadow-lg">
              <div className="flex flex-col">
                <div className="flex flex-col bg-[#0478df] text-white rounded-t-xl px-3 py-3">
                  <p>Opening balance</p>
                  <p className="text-3xl font-bold py-1">₹ 12,00,000</p>
                </div>
                <div className="flex flex-col px-3 py-3">
                  <p>Closing balance</p>
                  <div className="flex align-items-end justify-content-between">
                    <p className="text-3xl font-bold py-1">₹ 8,00,000</p>
                    <p className="text-xs">Details </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-xl shadow-lg">
              <div className="flex flex-col">
                <div className="flex flex-col bg-[#0478df] text-white rounded-t-xl px-3 py-3">
                  <p>Total Amount</p>
                  <p className="text-3xl font-bold py-1">₹ 12,00,000</p>
                </div>
                <div className="flex flex-col px-3 py-3">
                  <p>Total Collection</p>
                  <div className="flex align-items-end justify-content-between">
                    <p className="text-3xl font-bold py-1">₹ 8,00,000</p>
                    <p className="text-xs">Details </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LOAN TYPE CARDS */}
          <div className="flex pt-2 gap-3">
            <div className="flex-1 shadow-lg p-3">
              <div className="flex align-items-center gap-3">
                <div className="bg-[#0478df] p-2 rounded-lg">
                  <IoCard size={30} color="white" />
                </div>
                <div className="flex flex-col w-full">
                  <p>New Loan</p>
                  <div className="flex justify-content-between align-items-end">
                    <p className="text-4xl font-bold">30</p>
                    <div className="flex gap-2 algin-items-center">
                      <p className="text-sm">+11.02</p>
                      <AiOutlineRise />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 shadow-lg p-3">
              <div className="flex align-items-center gap-3">
                <div className="bg-[#0478df] p-2 rounded-lg">
                  <IoCard size={30} color="white" />
                </div>
                <div className="flex flex-col w-full">
                  <p>Top up Loan</p>
                  <div className="flex justify-content-between align-items-end">
                    <p className="text-4xl font-bold">30</p>
                    <div className="flex gap-2 algin-items-center">
                      <p className="text-sm">+11.02</p>
                      <AiOutlineRise />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 shadow-lg p-3">
              <div className="flex align-items-center gap-3">
                <div className="bg-[#0478df] p-2 rounded-lg">
                  <IoCard size={30} color="white" />
                </div>
                <div className="flex flex-col w-full">
                  <p>Extension Loan</p>
                  <div className="flex justify-content-between align-items-end">
                    <p className="text-4xl font-bold">30</p>
                    <div className="flex gap-2 algin-items-center">
                      <p className="text-sm">+11.02</p>
                      <AiOutlineRise />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHART JS */}
          <div className="w-full mt-3 h-[400px] bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Profit vs Loss</h2>
              <select className="border rounded-lg px-3 py-1 text-sm text-gray-700">
                <option>Jan - Jun</option>
                <option>Jul - Dec</option>
              </select>
            </div>
            {/* <Chart type="line" data={data} options={options} className="h-[320px]" /> */}
          </div>
        </div>
        <div className="flex w-[28%] h-full">
          <div className="flex-1 rounded-xl shadow-lg">
            <div className="flex flex-col">
              <div className="flex flex-col bg-[#0478df] text-white rounded-xl px-3 py-3">
                <p>This Month</p>
                <p className="text-3xl font-bold py-1">₹ 12,00,000</p>
              </div>
              <div className="flex px-3 py-3 align-items-center justify-content-between">
                <p className="flex-1">This Month Repayment Amount</p>
                <p className="text-2xl flex-1 font-bold py-1">₹ 8,00,000</p>
              </div>
              <Divider />
              <div className="flex flex-col p-3">
                <p>This Month Collected Amount: </p>
                <div className="flex">
                  <div className="flex-1">Total Principal Amount</div>
                  <div className="flex-1">₹ 25,00,000</div>
                </div>
                <div className="flex">
                  <div className="flex-1">Total Interest</div>
                  <div className="flex-1">₹ 25,00,000</div>
                </div>
                <div className="flex">
                  <div className="flex-1">Total Advance</div>
                  <div className="flex-1">₹ 25,00,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestDashboard
