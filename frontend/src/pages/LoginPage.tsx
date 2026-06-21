import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, Upload, Search, LineChart, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await authApi.login(data);
      setCredentials(res.user, res.token.access_token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-center flex-[1.2] p-16 relative overflow-hidden bg-[var(--color-background-secondary)] border-r border-[var(--color-border)]">
        
        {/* Animated Background Blobs */}
        <div className="bg-blob w-[500px] h-[500px] bg-[var(--color-primary)] top-10 -left-20" />
        <div className="bg-blob w-[400px] h-[400px] bg-[var(--color-accent)] bottom-10 right-0" style={{ animationDelay: '2s' }} />

        {/* Floating Icon Cluster */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <svg className="absolute w-full h-full" style={{ strokeDasharray: '4 4' }}>
            <line x1="30%" y1="40%" x2="70%" y2="60%" stroke="var(--color-border)" strokeWidth="2" />
            <line x1="70%" y1="40%" x2="30%" y2="60%" stroke="var(--color-border)" strokeWidth="2" />
          </svg>
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[30%] left-[30%] p-4 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)]">
            <Upload size={24} className="text-[var(--color-primary)]" />
          </motion.div>
          <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-[30%] right-[30%] p-4 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)]">
            <Search size={24} className="text-[var(--color-accent)]" />
          </motion.div>
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-[30%] left-[45%] p-4 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)]">
            <LineChart size={24} className="text-[var(--color-secondary)]" />
          </motion.div>
        </div>

        {/* Branding Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Logo size="lg" className="mb-8" />
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-balance leading-tight mb-6 text-[var(--color-text-primary)]">
              Your intelligent <span className="gradient-text">research partner</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-12">
              Elevate your academic workflow. Securely store your papers, generate AI insights, and access a custom-built knowledge base anywhere.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] z-10"
        >
          <div className="card-surface p-10 shadow-xl">
            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-6">
                <Logo size="md" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Welcome back</h2>
              <p className="text-[var(--color-text-secondary)]">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={20} />}
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="flex flex-col gap-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock size={20} />}
                  {...register('password')}
                  error={errors.password?.message}
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
                Sign In
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
