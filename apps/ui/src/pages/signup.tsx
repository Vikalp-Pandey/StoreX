import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // Ensure z is imported
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit', // Validates when a user leaves an input
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (values: SignupFormValues) => {
    signup.mutate(values, {
      onSuccess: () => {},
    });
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    const baseUrl = 'http://localhost:3000';
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] font-sans selection:bg-sky-500/30 text-slate-200">
      {/* LEFT SIDE: Minimalist Brand Identity */}
      <div className="hidden lg:flex flex-col justify-between p-24 bg-[#080808] relative overflow-hidden border-r border-white/3">
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-sky-900/10 blur-[120px] rounded-full" />

        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-[0.4em] text-white"
          >
            <ShieldCheck size={18} className="text-sky-500" />
            STOREX
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-light leading-[1.2] text-white tracking-tight">
              Scale your vision <br />
              <span className="text-slate-500 font-medium">
                with secure custody.
              </span>
            </h1>
          </motion.div>
          <div className="h-px w-12 bg-sky-500" />
          <p className="max-w-xs text-sm text-slate-500 font-light leading-relaxed tracking-wide">
            Deploy your digital assets into an environment built for
            industrial-grade encryption.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] tracking-[0.2em] text-slate-600 font-bold uppercase">
          <span>Enterprise Ready</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>v3.0 Secure</span>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Create Console Account
              </h2>
              <p className="text-slate-500 text-sm">
                Initialize your identity to begin deployment.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />
                  <Input
                    {...form.register('name')}
                    placeholder="Enter full name"
                    className={`h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-700 transition-all ${form.formState.errors.name ? 'border-rose-500/40' : ''}`}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-[10px] text-rose-500 font-medium tracking-wide uppercase mt-1 ml-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Work Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />
                  <Input
                    {...form.register('email')}
                    placeholder="name@company.com"
                    className={`h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-700 transition-all ${form.formState.errors.email ? 'border-rose-500/40' : ''}`}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-[10px] text-rose-500 font-medium tracking-wide uppercase mt-1 ml-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Access Key
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />
                  <Input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-700 transition-all ${form.formState.errors.password ? 'border-rose-500/40' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-600 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-[10px] text-rose-500 font-medium tracking-wide uppercase mt-1 ml-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <p className="text-center text-slate-600 text-[13px]">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="text-slate-300 font-semibold hover:text-sky-500 transition-colors"
                >
                  Log in to Console
                </Link>
              </p>

              <Button
                disabled={signup.isPending}
                className="w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-900/20 transition-all active:scale-[0.99]"
              >
                {signup.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Request Access'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#050505] px-4 text-slate-600">
                  Quick Authenticate
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-white/5 bg-white/1 hover:bg-white/4 text-xs font-medium text-slate-400 hover:text-white transition-all"
              >
                <FaGoogle size={14} /> Google
              </button>
              <button
                onClick={() => handleOAuth('github')}
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-white/5 bg-white/1 hover:bg-white/4 text-xs font-medium text-slate-400 hover:text-white transition-all"
              >
                <FaGithub size={14} /> GitHub
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
