import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { BrainCircuit, Mail, Lock, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
})

type RegisterFormValues = z.infer<typeof registerSchema>
type OtpFormValues = z.infer<typeof otpSchema>

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true)
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password
      })
      setRegisteredEmail(data.email)
      toast.success('Registration successful! Please check your email for the OTP.')
      setStep(2)
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOtp = async (data: OtpFormValues) => {
    try {
      setIsLoading(true)
      const res = await authApi.verifyOtp({ email: registeredEmail, otp: data.otp })
      setCredentials(res.user, res.token.access_token)
      toast.success('Email verified successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep-void)' }}>
      {/* Left Brand Panel */}
      <div 
        className="auth-brand-panel mesh-bg"
        style={{ 
          flex: 1.2, 
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center', 
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid var(--border-subtle)'
        }}
      >
        {/* Animated Background Elements */}
        <motion.div 
          className="animate-pulse-glow"
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'var(--accent-glow)',
            filter: 'blur(100px)',
            borderRadius: '50%',
            zIndex: 0
          }}
        />

        {/* 3D Floating Elements */}
        <motion.div 
          className="animate-float"
          style={{ position: 'absolute', top: '15%', left: '15%', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 0 }}
        >
          <div style={{ width: 40, height: '4px', background: 'var(--accent-violet)', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: 60, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: 30, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
        </motion.div>

        <motion.div 
          className="animate-float-delayed"
          style={{ position: 'absolute', bottom: '25%', right: '15%', width: '100px', height: '100px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5, zIndex: 0 }}
        />

        {/* Branding Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <BrainCircuit size={48} color="var(--accent-primary)" />
            </div>
            <h1 className="text-glow" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Join the Future of <br/>
              <span style={{ color: 'var(--accent-violet)' }}>Academic Research</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem' }}>
              Create an account to securely store your papers, generate AI insights, and access your custom-built knowledge base anywhere.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 700 }}>03</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Automated Flashcards</h4>
                <p style={{ color: 'var(--text-muted)' }}>Turn complex papers into bite-sized study materials instantly.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--accent-violet)', fontSize: '1.25rem', fontWeight: 700 }}>04</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Data Visualization</h4>
                <p style={{ color: 'var(--text-muted)' }}>Extract tables and draw interactive charts automatically.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        
        {/* Subtle background glow behind the form */}
        <div className="animate-pulse-glow" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(0,0,0,0) 70%)',
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
            {step === 1 ? (
              <>
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Create an account</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Get started with your AI Research Assistant</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    icon={<UserIcon size={20} />}
                    {...register('name')}
                    error={errors.name?.message}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={20} />}
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    {...register('password')}
                    error={errors.password?.message}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} style={{ marginTop: '1rem', width: '100%', background: 'var(--accent-primary)', color: 'white' }}>
                    Create Account
                  </Button>
                </form>

                <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sign in</Link>
                </p>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                    <Mail size={32} color="var(--accent-primary)" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Verify your email</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>We've sent a 6-digit code to <strong>{registeredEmail}</strong></p>
                </div>

                <form onSubmit={handleOtpSubmit(onVerifyOtp)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    style={{ fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center' }}
                    maxLength={6}
                    {...registerOtp('otp')}
                    error={otpErrors.otp?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} style={{ marginTop: '1rem', width: '100%', background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-primary))', color: 'white' }}>
                    Verify & Continue
                  </Button>
                </form>

                <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Didn't receive the code?{' '}
                  <button onClick={() => setStep(1)} style={{ fontWeight: 600, color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Go back</button>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
