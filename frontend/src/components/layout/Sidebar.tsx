import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, User as UserIcon, LogOut, PanelLeftClose, PanelLeft, Globe } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { motion } from 'framer-motion'

export const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/papers', label: 'My Papers', icon: <FileText size={20} /> },
    { path: '/global-research', label: 'Global Research', icon: <Globe size={20} /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon size={20} /> },
  ]

  return (
    <aside
      style={{
        width: sidebarOpen ? '260px' : '80px',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        overflowX: 'hidden',
        boxShadow: '10px 0 30px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div className="animate-pulse-glow" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-violet))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99,102,241,0.4)' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>A</span>
            </div>
            <span className="text-glow" style={{ fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>AI Assistant</span>
          </motion.div>
        )}
        <button onClick={toggleSidebar} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover:text-white">
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          
          return (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 100%)',
                    borderLeft: '3px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    zIndex: -1
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', transition: 'color 0.3s' }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {sidebarOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>{user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} style={{ color: 'var(--text-secondary)', padding: '0.5rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <LogOut size={20} />
          </button>
        )}
      </div>

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: all 0.2s;
          white-space: nowrap;
          text-decoration: none;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
        .nav-link.active {
          color: var(--text-primary);
          font-weight: 600;
        }
        .hover\\:text-white:hover {
          color: white !important;
        }
      `}</style>
    </aside>
  )
}
