import { Avatar } from 'primereact/avatar'
import React from 'react'
import { IoMdNotificationsOutline } from 'react-icons/io'

const SecondaryHeader: React.FC = () => {
  return (
    <div>
      <div className="flex justify-content-between px-3 py-2 align-items-center shadow">
        <div className="userName">
          <p className="text-lg font-semibold">Hi Rohit</p>
          <p className="text-xs">Admin</p>
        </div>
        <div className="notifications flex align-items-center gap-2">
          <IoMdNotificationsOutline size={25} />
          <Avatar image="/images/avatar/asiyajavayant.png" shape="circle" />
        </div>
      </div>
    </div>
  )
}

export default SecondaryHeader
