import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from "axios";
import decrypt from "../Helper/Helper";
import { useEffect, useState } from "react"
import { Panel } from 'primereact/panel';


interface followupData {
    FollowId: number;
    Message: string;
    date: any;
    UpdateAt: any;
}
interface AuditData {
    RpayId: number;
    LoanId: number;
    Month: string;
    Interest: number;
    Principal: number;
    followup: followupData[]
}



const LoanAudit = ({ loanId }: { loanId: number }) => {
    const [auditData, setAuditData] = useState<AuditData[]>([]);

    const renderFollowup = (rowData: AuditData) => {
        if (!rowData.followup || rowData.followup.length === 0 || rowData.followup[0].UpdateAt === null) {
            return <span>No follow-ups</span>;
        }

        return (
            <>
                {rowData.followup.map((item, index) => (
                    <Panel
                        key={index}
                        header={item.UpdateAt}
                        toggleable
                        collapsed={true}
                        expandIcon="pi pi-chevron-down"
                        collapseIcon="pi pi-times"
                    >
                        <p><b>Message</b></p>
                        <p>{item.Message}</p>
                        <p><b>Date & Time given By User</b></p>
                        <p>{item.date}</p>
                    </Panel>
                ))}



            </>

        );
    };

    const auditColumns = [
        { field: 'Month', header: 'Month' },
        { field: 'Interest', header: 'Interest' },
        { field: 'Principal', header: 'Principal Amount' },
        { field: 'followup', header: 'Follow Up' }
    ];

    const getAuditData = () => {
        axios.post(
            import.meta.env.VITE_API_URL + '/rePayment/loanAudit',
            {
                loanId: loanId,
            },
            {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            }
        ).then((response) => {
            const data = decrypt(response.data[1], response.data[0], import.meta.env.VITE_ENCRYPTION_KEY);
            console.log('data line ----- 205', data)
            localStorage.setItem("token", "Bearer " + data.token);
            if (data.success) {
                setAuditData(data.data)
            }
        })
    }

    useEffect(() => {
        getAuditData()
    }, [])


    return (
        <div className="card w-full bg-black">
            <DataTable
                value={auditData}
                scrollable
                scrollHeight="55vh"
                tableStyle={{ minWidth: '50rem' }}
            >
                {auditColumns.map((col, i) => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        body={col.field === 'followup' ? renderFollowup : undefined}
                    />
                ))}
            </DataTable>

        </div>
    )
}

export default LoanAudit