import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Upload, Search, LineChart } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore(s => s.setCredentials);
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (res.token) {
        setCredentials(res.user, res.token.access_token);
        toast.success('Registration successful! Auto-verified for development.');
        navigate('/dashboard');
        return;
      }

      setRegisteredEmail(data.email);
      toast.success('Registration successful! Please check your email for the OTP.');
      setStep(2);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormValues) => {
    try {
      setIsLoading(true);
      const res = await authApi.verifyOtp({ email: registeredEmail, otp: data.otp });
      setCredentials(res.user, res.token.access_token);
      toast.success('Email verified successfully!');
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
              Join the future of <br/><span className="gradient-text">academic research</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-12">
              Create an account to securely store your papers, generate AI insights, and access your custom-built knowledge base anywhere.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] z-10"
        >
          <div className="card-surface p-10 shadow-xl my-8">
            {step === 1 ? (
              <>
                <div className="text-center mb-8">
                  <div className="lg:hidden flex justify-center mb-6">
                    <Logo size="md" />
                  </div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Create an account</h2>
                  <p className="text-[var(--color-text-secondary)]">Get started with Corpus AI</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

                  <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-4">
                    Create Account
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] mb-4">
                    <Mail size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Verify your email</h2>
                  <p className="text-[var(--color-text-secondary)]">We've sent a 6-digit code to <strong>{registeredEmail}</strong></p>
                </div>

                <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="flex flex-col gap-6">
                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    className="text-center text-2xl tracking-[0.5em]"
                    maxLength={6}
                    {...registerOtp('otp')}
                    error={otpErrors.otp?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
                    Verify & Continue
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
                  Didn't receive the code?{' '}
                  <button onClick={() => setStep(1)} className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors">
                    Go back
                  </button>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
