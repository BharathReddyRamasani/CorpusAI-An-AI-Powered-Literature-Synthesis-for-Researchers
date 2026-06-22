import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Upload, Search, LineChart, ArrowLeft, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onForgotSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setStep(2);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      await authApi.resetPassword({
        email: submittedEmail,
        otp: data.otp,
        new_password: data.new_password
      });
      setStep(3);
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
              Securely access <br/><span className="gradient-text">your knowledge</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-12">
              Get back to your academic workflow seamlessly and securely.
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
            {step === 1 && (
              <>
                <div className="mb-8">
                  <div className="lg:hidden flex mb-6">
                    <Logo size="md" />
                  </div>
                  <Link to="/login" className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to login
                  </Link>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Reset password</h2>
                  <p className="text-[var(--color-text-secondary)]">Enter your email address and we'll send you an OTP to reset your password.</p>
                </div>

                <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="flex flex-col gap-6">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={20} />}
                    {...registerForgot('email')}
                    error={forgotErrors.email?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
                    Send OTP
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-8">
                  <button onClick={() => setStep(1)} className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </button>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">Verify OTP</h2>
                  <p className="text-[var(--color-text-secondary)]">
                    We've sent a code to <strong className="text-[var(--color-text-primary)]">{submittedEmail}</strong>. Enter it below along with your new password.
                  </p>
                </div>

                <form onSubmit={handleResetSubmit(onResetSubmit)} className="flex flex-col gap-6">
                  <Input
                    label="6-Digit OTP"
                    placeholder="123456"
                    icon={<KeyRound size={20} />}
                    {...registerReset('otp')}
                    error={resetErrors.otp?.message}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    {...registerReset('new_password')}
                    error={resetErrors.new_password?.message}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    {...registerReset('confirm_password')}
                    error={resetErrors.confirm_password?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
                    Reset Password
                  </Button>
                </form>
              </>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Password Reset!</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
                <Link to="/login">
                  <Button className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
