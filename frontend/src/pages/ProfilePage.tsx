import React, { useState } from 'react';
import { User as UserIcon, Lock, Key, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  
  const [name, setName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setUpdatingProfile(true);
      const updated = await authApi.updateProfile({ name });
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    try {
      setUpdatingPassword(true);
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Account Settings</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Manage your personal information and security settings.</p>
      </motion.div>

      <div className="flex flex-col gap-8">
        
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Personal Information</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">Update your profile details and public presence.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name" 
                />
                <Input 
                  label="Email Address" 
                  value={user?.email || ''} 
                  disabled 
                  helper="Contact support to change your email address."
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                <Button type="submit" isLoading={updatingProfile} variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">Security</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">Ensure your account is using a long, random password to stay secure.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6">
              <div className="flex flex-col gap-6 max-w-md mb-6">
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
              </div>
              
              <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                <Button type="submit" variant="secondary" isLoading={updatingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* API Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <Key size={20} className="text-amber-500" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] tracking-tight">API Access</h2>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm mb-4 max-w-2xl">
              Your account is configured for the Corpus AI platform. All background processing including vector embeddings and LLM generation is handled automatically by the backend.
            </p>
            <div className="flex items-center gap-2 bg-[var(--color-background)] p-3 rounded-[12px] font-mono text-sm border border-[var(--color-border)] w-fit">
              <Lock size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-[var(--color-text-secondary)]">Bearer token active for session.</span>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default ProfilePage;
