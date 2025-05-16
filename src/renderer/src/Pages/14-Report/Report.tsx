import Header from '@renderer/components/Header/Header'
import decrypt from '@renderer/components/Helper/Helper'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import overAllImage from "../../assets/overAllReport.png"

type Props = {}

export default function Report({ }: Props) {
    const [username, setUsername] = useState('')
    const [loadingStatus, setLoadingStatus] = useState(true)

    const loadData = () => {
        console.log('line --------- 25')
        try {
            axios
                .get(import.meta.env.VITE_API_URL + '/adminRoutes/getBankFundList', {
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
                        setLoadingStatus(false)
                        setUsername(data.name[0].refUserFname + ' ' + data.name[0].refUserLname)

                    }
                })
        } catch (e: any) {
            console.log(e)
        }
    }
    useEffect(() => {
        loadData()
    }, [])
    return (
        <>
            <ToastContainer />
            <Header userName={username} pageName={'Report'} />
            {loadingStatus ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#f8d20f',
                        height: '92vh',
                        width: '100%'
                    }}
                >
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '5rem' }}></i>
                </div>
            ) : (
                <div>
                    <div className=''>

                    </div>
                </div>
            )}
        </>
    )
}