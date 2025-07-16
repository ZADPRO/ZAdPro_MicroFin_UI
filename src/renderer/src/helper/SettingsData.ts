import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'

export interface SettingData {
  paymentMethod: number | null
  rePaymentMethod: number | null
  initialInterest: boolean | null
  weekStartEnd: String | null
  loanDueType: number | null
}

export const getSettingData = async () => {
  let SettingData: SettingData = {
    paymentMethod: null,
    rePaymentMethod: null,
    initialInterest: null,
    weekStartEnd: null,
    loanDueType: null
  }
  try {
    await axios
      .get(import.meta.env.VITE_API_URL + '/settings/paymentMethod/getOption', {
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
        if (data.success) {
          const data1 = data.settings.filter((e) => e.refSettingId === 6)
          const data2 = data.settings.filter((e) => e.refSettingId === 7)
          const data3 = data.settings.filter((e) => e.refSettingId === 3)
          const data4 = data.settings.filter((e) => e.refSettingId === 5)
          const data5 = data.settings.filter((e) => e.refSettingId === 9)
          SettingData = {
            ...SettingData,
            paymentMethod: data1[0].refSettingValue,
            rePaymentMethod: data2[0].refSettingValue,
            initialInterest: data3[0].refSettingBoolean,
            weekStartEnd: data4[0].refSettingData,
            loanDueType: data5[0].refSettingValue
          }
        }
      })
  } catch (error) {
    console.log('error', error)
  }

  return SettingData
}
