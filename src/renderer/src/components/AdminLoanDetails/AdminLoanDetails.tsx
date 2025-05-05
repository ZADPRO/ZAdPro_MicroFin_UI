import { TabPanel, TabView } from 'primereact/tabview'
import React, { useState } from 'react'

interface AddNewSupplierProps {
  closeSidebarNew: () => void
}

const AdminLoanDetails: React.FC<AddNewSupplierProps> = ({ closeSidebarNew }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleBack = () => {
    goToHistoryTab()
  }

  return (
    <div>
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => {
          console.log(e.index)
          setActiveIndex(e.index)
        }}
        style={{ marginTop: '1rem' }}
      >
        <TabPanel header="Loan History"></TabPanel>
        <TabPanel header="Loan Audit"></TabPanel>
        <TabPanel header="Loan Closing"></TabPanel>
      </TabView>
    </div>
  )
}

export default AdminLoanDetails
