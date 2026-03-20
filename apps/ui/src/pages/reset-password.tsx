import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  console.log('TOKEN FROM URL:', token);
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    if (!token) {
      console.error('Reset token missing');
      return;
    }

    resetPassword.mutate({
      token: token,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] font-sans selection:bg-sky-500/30 text-slate-200">
      <div className="hidden lg:flex flex-col justify-between p-24 bg-[#080808] relative overflow-hidden border-r border-white/[0.03]">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-sky-900/10 blur-[120px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-bold tracking-[0.4em] text-white">
            <KeyRound size={18} className="text-sky-500" />
            STOREX
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-light leading-[1.2] text-white tracking-tight">
              Update your <br />
              <span className="text-slate-500 font-medium">access keys.</span>
            </h1>
          </motion.div>

          <div className="h-px w-12 bg-sky-500" />

          <p className="max-w-xs text-sm text-slate-500 font-light leading-relaxed tracking-wide">
            You are establishing a new high-entropy password. Ensure your new
            credentials are kept secure.
          </p>
        </div>

        <div className="relative z-10 text-[10px] tracking-[0.4em] text-slate-600 font-bold uppercase">
          Handshake Verified // Token Active
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          {/* Back Button */}

          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-500 transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Abort Update
          </button>

          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Reset Password
              </h2>

              <p className="text-slate-500 text-sm">
                Please enter and confirm your new password.
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* PASSWORD */}

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  New Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />

                  <Input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 pl-11 rounded-lg border-white/[0.05] bg-white/[0.02] text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-800 transition-all font-mono"
                  />
                </div>

                {errors.password && (
                  <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Confirm Password
                </Label>

                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />

                  <Input
                    {...register('confirmPassword')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 pl-11 rounded-lg border-white/[0.05] bg-white/[0.02] text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-800 transition-all font-mono"
                  />
                </div>

                {errors.confirmPassword && (
                  <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SHOW PASSWORD */}

              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="show"
                  className="rounded border-white/10 bg-white/5 text-sky-500 focus:ring-0"
                  onChange={() => setShowPass(!showPass)}
                />

                <label
                  htmlFor="show"
                  className="text-[10px] text-slate-500 uppercase tracking-widest font-bold cursor-pointer"
                >
                  Show Passwords
                </label>
              </div>

              {/* SUBMIT BUTTON */}

              <Button
                disabled={resetPassword.isPending}
                className="w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5"
              >
                {resetPassword.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
