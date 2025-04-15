import Navbar from '../00-Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Login from '../02-LoginPage/Login'
import Dashboard from '../03-Dashboard/Dashboard'
import Agents from '../04-Agents/Agents'
import Customers from '../05-Customers/Customers'
import BankDetails from '../06-BankDetails/BankDetails'
import Products from '../07-Products/Products'
import Funds from '../08-Funds/Funds'
import Loan from '../09-Loans/Loan'
import Repayments from '../10-Repayments/Repayments'

export const MainRoutes = () => {
    return (
        <>
            <Navbar>
                <Routes>
                    <Route index path='/' element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/banks" element={<BankDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/funds" element={<Funds />} />
                    <Route path="/repayment" element={<Repayments />} />
                    <Route path="/loans" element={<Loan />} />
                </Routes>
            </Navbar>
        </>
    )
}
