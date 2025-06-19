import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { FaBars, FaBox, FaUserCheck, FaUsers } from 'react-icons/fa'
// import { MdDashboard } from "react-icons/md";
import { LuLogOut } from 'react-icons/lu'
import { BsBank2 } from 'react-icons/bs'
import { GiMoneyStack } from 'react-icons/gi'
import { FaPiggyBank } from 'react-icons/fa'
import { GiTakeMyMoney } from 'react-icons/gi'
// import { GrTransaction } from "react-icons/gr";
import { GiWallet } from 'react-icons/gi'
import { MdDashboard } from 'react-icons/md'
import { FaMoneyBillTransfer } from 'react-icons/fa6'
import { AiFillFolderOpen } from 'react-icons/ai'
import { MdDisplaySettings } from 'react-icons/md'

import logo from '../../assets/Logo-1.png'

import { NavLink, useLocation } from 'react-router-dom'

import './Navbar.css'

const routes = [
  {
    path: '/dashboard',
    name: 'DashBoard',
    icon: <MdDashboard />
  },
  {
    path: '/agents',
    name: 'Agents',
    icon: <FaUserCheck />
  },
  {
    path: '/customers',
    name: 'Customers',
    icon: <FaUsers />
  },
  {
    path: '/banks',
    name: 'Bank Details',
    icon: <BsBank2 />
  },

  {
    path: '/funds',
    name: 'Funds',
    icon: <FaPiggyBank />
  },

  {
    path: '/products',
    name: 'Products',
    icon: <FaBox />
  },

  {
    path: '/loans',
    name: 'Loans',
    icon: <GiMoneyStack />
  },
  {
    path: '/repayment',
    name: 'Repayment',
    icon: <GiTakeMyMoney />
  },
  {
    path: '/adminloan',
    name: 'Admin Loan',
    icon: <FaMoneyBillTransfer />
  },
  {
    path: '/expense',
    name: 'Expense',
    icon: <GiWallet />
  },
  {
    path: '/report',
    name: 'Report',
    icon: <AiFillFolderOpen />
  },
  {
    path: '/customize',
    name: 'Customize',
    icon: <MdDisplaySettings />
  },
  {
    path: '/',
    name: 'Logout',
    icon: <LuLogOut />
  }
]

export default function Navbar({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    show: {
      width: 'auto',
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  }

  const hideSidebarPaths = ['/']

  const location = useLocation()

  return (
    <div>
      <div className="main_container">
        {!hideSidebarPaths.includes(location.pathname) && (
          <>
            <motion.div
              animate={{
                width: isOpen ? '15vw' : '5vw',
                transition: {
                  duration: 0.2,
                  type: 'spring',
                  damping: 10
                }
              }}
              className="sidebar"
            >
              <div className="top_section">
                <AnimatePresence>
                  {isOpen && (
                    <motion.h1
                      className="logo"
                      variants={showAnimation}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                    >
                      <img src={logo} alt="logo" style={{ width: '90%' }} />
                    </motion.h1>
                  )}
                </AnimatePresence>
                <div className="bars">
                  <FaBars onClick={toggle} />
                </div>
              </div>

              <section className="routes">
                {routes.map((route) => (
                  <NavLink
                    to={route.path}
                    key={route.name}
                    className="link"
                    onClick={() => {
                      if (route.name === 'Logout') {
                        localStorage.clear()
                      }
                    }}
                  >
                    <div className="icon">{route.icon}</div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="link_text"
                          variants={showAnimation}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                        >
                          {route.name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </NavLink>
                ))}
              </section>
            </motion.div>
            <main style={{ width: isOpen ? '85vw' : '95vw' }}>{children}</main>
          </>
        )}
        {hideSidebarPaths.includes(location.pathname) && (
          <main style={{ width: '100vw' }}>{children}</main>
        )}
      </div>
    </div>
  )
}
