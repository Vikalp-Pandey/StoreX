import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, Layers } from 'lucide-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// --- UPDATED SCHEMAS ---
export const signinSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorEnabled: z.boolean().optional(),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
      twoFactorEnabled: false,
    },
  });

  const onSubmit = (values: SigninFormValues) => {
    signin.mutate(values);
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    const baseUrl = 'http://localhost:3000';
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] font-sans selection:bg-sky-500/30 text-slate-200 overflow-hidden">
      {/* LEFT SIDE: Brand Identity */}
      <div className="hidden lg:flex flex-col justify-between p-24 bg-[#080808] relative overflow-hidden border-r border-white/3">
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-sky-900/10 blur-[120px] rounded-full" />
        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-[0.4em] text-white"
          >
            <Layers size={18} className="text-sky-500" />
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
              Cloud infrastructure <br />
              <span className="text-slate-500 font-medium">
                reimagined for scale.
              </span>
            </h1>
          </motion.div>
          <div className="h-px w-12 bg-sky-500" />
          <p className="max-w-xs text-sm text-slate-500 font-light leading-relaxed tracking-wide">
            Access your unified interface for secure data custody and
            industrial-grade encrypted asset delivery.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.03),transparent_70%)]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="space-y-10">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Signin to Console
              </h2>
              <p className="text-slate-500 text-sm">
                Configure your identity to begin node access.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* EMAIL */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-zinc-700" />
                    <Input
                      {...form.register('email')}
                      placeholder="name@company.com"
                      className={`h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 transition-all placeholder:text-zinc-800 ${form.formState.errors.email ? 'border-rose-500/40 bg-rose-500/5' : ''}`}
                    />
                  </div>
                  {/* DYNAMIC ZOD ERROR */}
                  {form.formState.errors.email && (
                    <p className="text-[10px] text-rose-500 font-mono tracking-tighter uppercase mt-1 ml-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Access Key
                    </Label>
                    <Link
                      to="#"
                      className="text-[10px] font-bold text-sky-500/50 hover:text-sky-400 uppercase tracking-tighter transition-colors"
                    >
                      Recovery?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-700" />
                    <Input
                      {...form.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 transition-all placeholder:text-zinc-800 ${form.formState.errors.password ? 'border-rose-500/40 bg-rose-500/5' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* DYNAMIC ZOD ERROR */}
                  {form.formState.errors.password && (
                    <p className="text-[10px] text-rose-500 font-mono tracking-tighter uppercase mt-1 ml-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={signin.isPending}
                  className="w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-lg shadow-sky-900/20"
                >
                  {signin.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Request Access'
                  )}
                </Button>

                <p className="text-center text-slate-600 text-[13px]">
                  New to the platform?{' '}
                  <Link
                    to="/signup"
                    className="text-slate-300 font-semibold hover:text-sky-500 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>

            <div className="grid grid-cols-2 gap-3 pt-2">
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
