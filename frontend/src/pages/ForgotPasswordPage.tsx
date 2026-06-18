import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

// Step 1 Schema: Request OTP
const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Step 2 Schema: Reset Password
const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RequestFormValues = z.infer<typeof requestSchema>
type ResetFormValues = z.infer<typeof resetSchema>

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
  })

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onRequestSubmit = async (data: RequestFormValues) => {
    try {
      setIsLoading(true)
      await authApi.forgotPassword(data)
      setEmail(data.email)
      setStep(2)
      toast.success('If an account exists, an OTP has been sent to your email.')
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSubmit = async (data: ResetFormValues) => {
    try {
      setIsLoading(true)
      await authApi.resetPassword({
        email,
        otp: data.otp,
        new_password: data.new_password,
      })
      toast.success('Password successfully reset! You can now log in.')
      navigate('/login')
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep-void)', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      
      {/* Subtle background glow */}
      <div className="animate-pulse-glow" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}
      >
        <div style={{ 
          background: 'var(--bg-surface)', 
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to login
          </Link>

          {step === 1 ? (
            <>
              <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                  <KeyRound size={32} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Forgot Password</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Enter your email and we'll send you a 6-digit verification code to reset your password.</p>
              </div>

              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={20} />}
                  {...requestForm.register('email')}
                  error={requestForm.formState.errors.email?.message}
                />
                <Button type="submit" size="lg" isLoading={isLoading} style={{ width: '100%', background: 'var(--accent-primary)', color: 'white' }}>
                  Send Verification Code
                </Button>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                  <Lock size={32} color="var(--color-success)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Reset Password</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Enter the 6-digit code sent to <br/><strong style={{color: 'var(--text-primary)'}}>{email}</strong></p>
              </div>

              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Input
                  label="6-Digit OTP"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 600 }}
                  {...resetForm.register('otp')}
                  error={resetForm.formState.errors.otp?.message}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock size={20} />}
                  {...resetForm.register('new_password')}
                  error={resetForm.formState.errors.new_password?.message}
                />
                <Button type="submit" size="lg" isLoading={isLoading} style={{ width: '100%', background: 'var(--color-success)', color: 'white' }}>
                  Reset Password
                </Button>
              </form>
            </>
          )}

        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
