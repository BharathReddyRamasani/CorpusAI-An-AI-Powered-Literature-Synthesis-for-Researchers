import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
