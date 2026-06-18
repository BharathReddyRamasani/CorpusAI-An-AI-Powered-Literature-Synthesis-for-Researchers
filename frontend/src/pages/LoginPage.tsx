import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { BrainCircuit, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginPage = () => {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      const res = await authApi.login(data)
      setCredentials(res.user, res.token.access_token)
      toast.success('Logged in successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      // Error toast is handled by axios interceptor, but we can catch specific ones if needed
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
            top: '20%',
            left: '10%',
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
          style={{ position: 'absolute', top: '15%', right: '15%', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 0 }}
        >
          <div style={{ width: 40, height: '4px', background: 'var(--accent-primary)', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: 60, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: 30, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
        </motion.div>

        <motion.div 
          className="animate-float-delayed"
          style={{ position: 'absolute', bottom: '25%', left: '10%', width: '100px', height: '100px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5, zIndex: 0 }}
        />

        {/* Branding Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <BrainCircuit size={48} color="var(--accent-primary)" />
            </div>
            <h1 className="text-glow" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              Advanced AI <br/>
              <span style={{ color: 'var(--accent-violet)' }}>Research Assistant</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem' }}>
              Elevate your academic workflow with AI-powered document analysis, instant Q&A, and interactive study tools designed for modern researchers.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', fontWeight: 700 }}>01</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Upload & Parse</h4>
                <p style={{ color: 'var(--text-muted)' }}>Process unlimited PDF research papers securely.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--accent-violet)', fontSize: '1.25rem', fontWeight: 700 }}>02</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Cross-Document RAG</h4>
                <p style={{ color: 'var(--text-muted)' }}>Ask questions and compare methodologies across papers.</p>
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
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={20} />}
                {...register('email')}
                error={errors.email?.message}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock size={20} />}
                  {...register('password')}
                  error={errors.password?.message}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" isLoading={isLoading} style={{ marginTop: '0.5rem', width: '100%', background: 'var(--accent-primary)', color: 'white' }}>
                Sign In
              </Button>
            </form>

            <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
