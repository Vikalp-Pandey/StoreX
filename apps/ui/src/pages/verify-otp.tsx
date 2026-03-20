import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function VerifyOTPPage() {
  const { verifyOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Timer Logic State
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds = 5 minutes
  const email = location.state?.email || 'your email';

  // Countdown Effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  //  Helper to format time (e.g., 04:59)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: { otp: string }) => {
    verifyOtp.mutate(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] font-sans selection:bg-sky-500/30 text-slate-200">
      <div className="hidden lg:flex flex-col justify-between p-24 bg-[#080808] relative overflow-hidden border-r border-white/3">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-sky-900/10 blur-[120px] rounded-full" />

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
              Finalize your <br />
              <span className="text-slate-500 font-medium">
                security handshake.
              </span>
            </h1>
          </motion.div>
          <div className="h-px w-12 bg-sky-500" />
          <p className="max-w-xs text-sm text-slate-500 font-light leading-relaxed tracking-wide">
            We've dispatched a unique verification sequence to your terminal.
            Verify your identity to authorize node access.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] tracking-[0.2em] text-slate-600 font-bold uppercase">
          <span className="flex items-center gap-2">
            <Smartphone size={12} /> Secure 2FA
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>Identity Verified</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="space-y-10">
            <div className="space-y-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-sky-500 transition-colors mb-6"
              >
                <ArrowLeft size={14} /> Back to Signup
              </button>
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Handshake Required
              </h2>
              <p className="text-slate-500 text-sm">
                Enter the 6-digit code sent to <br />
                <span className="text-sky-500 font-mono text-xs">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Verification Code
                </Label>
                <Input
                  {...register('otp', {
                    required: 'OTP is required',
                    minLength: {
                      value: 6,
                      message: 'Handshake requires 6 digits',
                    },
                  })}
                  placeholder="000 000"
                  className="h-16 text-center text-3xl tracking-[0.5em] font-mono rounded-lg border-white/5 bg-white/2 text-white focus:border-sky-500/50 focus:ring-0 placeholder:text-slate-800 transition-all"
                />
                {errors.otp && (
                  <p className="text-[10px] text-rose-500 font-medium tracking-wide uppercase ml-1">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              <Button
                disabled={verifyOtp.isPending}
                className="w-full h-12 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-900/20 transition-all"
              >
                {verifyOtp.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Authorize Node'
                )}
              </Button>
            </form>

            <div className="space-y-4 text-center">
              <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Timer size={14} className="text-slate-700" />
                {timeLeft > 0 ? (
                  <>
                    Resend available in{' '}
                    <span className="text-slate-400 font-mono">
                      {formatTime(timeLeft)}
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-500 animate-pulse">
                    Ready for new handshake
                  </span>
                )}
              </p>

              <button
                disabled={timeLeft > 0}
                onClick={() => setTimeLeft(300)} // Logic to resend code would go here
                className={`text-xs font-bold uppercase tracking-tighter transition-colors ${
                  timeLeft > 0
                    ? 'text-slate-800 cursor-not-allowed'
                    : 'text-sky-500 hover:text-sky-400'
                }`}
              >
                Request New Code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
