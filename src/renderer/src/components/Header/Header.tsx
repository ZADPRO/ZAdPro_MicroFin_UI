import { useEffect, useState, useRef } from 'react'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import axios from 'axios'
import decrypt from '../Helper/Helper'
const Header = ({ userName, pageName, reLoad }) => {
  const goBack = () => {
    reLoad()
  }
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [checked, setChecked] = useState<boolean>(false)

  const handleClick = () => {
    setShowOptions(!showOptions)
  }
  const getCashFlow = () => {
    try {
      axios
        .get(import.meta.env.VITE_API_URL + '/cashFlow/getCashFlow', {
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
            setChecked(data.cashFlow)
          }
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false)
      }
    }
    getCashFlow()

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const handelCashFlow = (data: boolean) => {
    try {
      axios
        .post(
          import.meta.env.VITE_API_URL + '/cashFlow/updateCashFlow',
          {
            cashFlow: data
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
          goBack()
        })
    } catch (error) {
      console.log('error in Header in Cash Flow', error)
    }
  }
  return (
    <div className="headerPrimary">
      <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{pageName}</div>
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleClick}>
          <div style={{ fontSize: '1rem', paddingBottom: '1px', fontWeight: '700' }}>
            {userName}
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: '700', color: '#f8d20f' }}>
            {localStorage.getItem('roleId') === '1' ? 'Admin' : 'Agent'}
          </div>
        </div>

        {showOptions && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '5px',
              marginTop: '5px',
              zIndex: 1000,
              padding: '5px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            className="w-[15rem]"
          >
            <div className="w-full flex m-2">
              <div className="w-[60%]">
                <b>Show Cash</b>
              </div>
              <div className="w-[40%]">
                <InputSwitch
                  checked={checked}
                  onChange={(e: InputSwitchChangeEvent) => {
                    setChecked(e.value), handelCashFlow(e.value)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
