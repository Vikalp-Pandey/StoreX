import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Loader2,
  ArrowLeft,
  LifeBuoy,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => forgotPassword.mutate(data);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] font-sans selection:bg-sky-500/30 text-slate-200">
      {/* LEFT SIDE: Minimalist Brand Identity */}
      <div className="hidden lg:flex flex-col justify-between p-24 bg-[#080808] relative overflow-hidden border-r border-white/3">
        {/* Subtle Architectural Glow (Focused for Recovery) */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-slate-500/5 blur-[120px] rounded-full" />

        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-[0.4em] text-white"
          >
            <KeyRound size={18} className="text-sky-500" />
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
              Vault <br />
              <span className="text-slate-500 font-medium">
                re-authentication.
              </span>
            </h1>
          </motion.div>
          <div className="h-px w-12 bg-sky-500" />
          <p className="max-w-xs text-sm text-slate-500 font-light leading-relaxed tracking-wide">
            Initiate the recovery protocol to regain access to your encrypted
            infrastructure and digital assets.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] tracking-[0.2em] text-slate-600 font-bold uppercase">
          <LifeBuoy size={14} className="text-sky-500/50" />
          <span>Technical Support Active</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          {/* Back Navigation */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-500 transition-colors text-[10px] font-bold uppercase tracking-widest group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to entry
          </Link>

          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Recovery Protocol
              </h2>
              <p className="text-slate-500 text-sm">
                A secure reset link will be dispatched to your ID.
              </p>
            </div>

            {forgotPassword.isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-lg bg-sky-500/5 border border-sky-500/10 text-sky-400 text-xs leading-relaxed tracking-wide font-medium text-center"
              >
                Protocol engaged. Please inspect your inbox for the
                authorization link.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Identity (Work Email)
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-700" />
                    <Input
                      {...register('email', { required: 'Email is required' })}
                      placeholder="name@company.com"
                      className="h-12 pl-11 rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-800 transition-all font-light"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-rose-500 font-medium tracking-wide uppercase mt-1 ml-1">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                <Button
                  disabled={forgotPassword.isPending}
                  className="w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5 active:scale-[0.99]"
                >
                  {forgotPassword.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Request Reset'
                  )}
                </Button>
              </form>
            )}

            <div className="pt-8 border-t border-white/3">
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white/1 border border-white/3">
                <ShieldAlert size={20} className="text-slate-600 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-normal tracking-wide">
                  Account recovery requires valid 2FA identification. If you
                  have lost access to your secondary device, please contact
                  system administrators.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
