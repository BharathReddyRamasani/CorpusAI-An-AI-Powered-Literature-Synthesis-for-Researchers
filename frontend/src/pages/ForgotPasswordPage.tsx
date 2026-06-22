import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Upload, Search, LineChart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error(error);
      // Even if it fails (e.g. user not found), we should probably show success to prevent email enumeration
      // But we'll just show a generic error toast via interceptor and not advance state
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
            {!isSubmitted ? (
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
                  <p className="text-[var(--color-text-secondary)]">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={20} />}
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2">
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mb-4">Check your email</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                  We've sent password reset instructions to <strong className="text-[var(--color-text-primary)]">{submittedEmail}</strong>.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
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
