import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUserStatus,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for logging out
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      navigate('/login');
      toast.error('Logged Out Successfully.');
    },
  });
};

export const useAuth = () => {
  const navigate = useNavigate();

  const signin = useMutation({
    mutationFn: authApi.signin,
    onSuccess: (data) => {
      if (data.twoFactorRequired) {
        toast.info('Two-factor authentication required.');
        navigate('/verify-otp');
      } else {
        const successMessage = data?.detail;
        toast.success(successMessage);
        navigate('/dashboard');
      }
    },
    onError: (err: any) => {
      console.log(err.response);
      const errorMessage =
        err?.response?.data?.detail ||
        'Authentication failed. Please check your credentials.';
      toast.error(errorMessage);
    },
  });

  const signup = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data, variables) => {
      const infoMessage = data?.detail;
      toast.info(infoMessage);
      navigate('/verify-otp', { state: { email: variables.email } });
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.detail || 'Registration failed.';
      toast.error(errorMessage);
    },
  });

  const verifyOtp = useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: (data) => {
      const successMessage = data?.detail;
      toast.success(successMessage);
      navigate('/dashboard');
    },
  });

  const forgotPassword = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      const successMessage = data?.detail;
      toast.success(successMessage);
      navigate('/reset-password');
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail;
      toast.error(errorMessage);
    },
  });

  const resetPassword = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      const successMessage = data?.detail;
      toast.success(successMessage);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail;
      toast.error(errorMessage);
    },
  });

  const user = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUserStatus,
    retry: false,
  });

  return {
    signin,
    signup,
    verifyOtp,
    forgotPassword,
    resetPassword,
    user,
  };
};
