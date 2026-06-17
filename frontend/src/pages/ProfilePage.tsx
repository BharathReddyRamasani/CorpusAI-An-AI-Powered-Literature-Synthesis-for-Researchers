import React, { useState } from 'react'
import { User as UserIcon, Lock, Key, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  
  const [name, setName] = useState(user?.name || '')
  const [updatingProfile, setUpdatingProfile] = useState(false)
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setUpdatingProfile(true)
      const updated = await authApi.updateProfile({ name })
      updateUser(updated)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) return
    try {
      setUpdatingPassword(true)
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword })
      toast.success('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and security settings.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px' }}>
        
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <UserIcon size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Personal Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Full Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Email Address (Read-only)" 
                    value={user?.email || ''} 
                    disabled 
                    style={{ opacity: 0.7 }}
                  />
                </div>
              </div>
              
              <div style={{ alignSelf: 'flex-start' }}>
                <Button type="submit" isLoading={updatingProfile}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <Shield size={24} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security</h2>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
              <Input 
                label="Current Password" 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                placeholder="••••••••" 
                required
              />
              <Input 
                label="New Password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••" 
                required
                minLength={6}
              />
              
              <div style={{ alignSelf: 'flex-start' }}>
                <Button type="submit" variant="secondary" isLoading={updatingPassword}>Update Password</Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* API Info (Hackathon demo) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Key size={20} color="var(--color-warning)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>API Access</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Your account is configured for the AI Research Assistant platform. All background processing including vector embeddings and LLM generation is handled automatically by the backend.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-deep-void)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <Lock size={16} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Bearer token active for session.</span>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}

export default ProfilePage
