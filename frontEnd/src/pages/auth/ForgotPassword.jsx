
import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword, resetPassword, clearForgotError, clearResetError } from '../../redux/slices/userSlice';
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const forgotPasswordSchema = z.object({
  emailId: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
});

const ForgotPassword = () => {
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotLoading, forgotError, resetLoading, resetError, isAuthenticated } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      emailId: ''
    },
    mode: 'onChange'
  });

  const emailId = watch('emailId');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearForgotError());
      dispatch(clearResetError());
    };
  }, [dispatch]);

  const handleFieldBlur = useCallback((fieldName) => {
    trigger(fieldName);
  }, [trigger]);

  const onSubmit = async (data) => {
    if (isSubmitting || forgotLoading) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await dispatch(forgotPassword({ emailId: data.emailId }));
      
      if (!result.error) {
        setSubmittedEmail(data.emailId);
        setShowOTPInput(true);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetLoading || isSubmitting) {
      return;
    }
    
    if (!otpCode || otpCode.length !== 6) {
      return;
    }
    
    if (newPassword.length < 8) {
      return;
    }
    
    if (newPassword !== confirmPassword) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await dispatch(resetPassword({ 
        emailId: submittedEmail,
        otpCode, 
        newPassword 
      }));
      
      if (!result.error) {
        setIsSuccess(true);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-green-500">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Success!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link
            to="/login"
            className="block w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (showOTPInput) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100">
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-md bg-pink-500">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-500">
              Enter the OTP sent to <span className="font-semibold text-pink-600">{submittedEmail}</span> and your new password
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Enter OTP Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border-2 rounded-xl focus:outline-none focus:ring-2 bg-gray-50 border-gray-200 focus:border-pink-400 focus:ring-pink-200 text-gray-800"
                placeholder="000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-gray-50 border-gray-200 focus:border-pink-400 focus:ring-pink-200 text-gray-800"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-gray-50 border-gray-200 focus:border-pink-400 focus:ring-pink-200 text-gray-800"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>

            {(resetError || forgotError) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600 text-center">{resetError || forgotError}</p>
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={resetLoading || isSubmitting || !otpCode || otpCode.length !== 6 || !newPassword || !confirmPassword}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {resetLoading || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowOTPInput(false);
                  setOtpCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setIsSubmitting(false);
                  dispatch(clearForgotError());
                  dispatch(clearResetError());
                }}
                className="text-pink-500 hover:text-pink-600 text-sm"
              >
                Wrong email? Try again
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-800">Security Note</p>
                <p className="text-xs text-blue-700">The OTP will expire in 3 minutes for security reasons.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100">
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform bg-pink-500">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-pink-500">Forgot Password?</h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">Enter your email and we'll send you a reset OTP</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 inline mr-2 text-pink-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('emailId')}
              type="email"
              onBlur={() => handleFieldBlur('emailId')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 ${
                errors.emailId && touchedFields.emailId
                  ? 'border-red-500 focus:ring-red-200 text-red-800'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200 text-gray-800'
              }`}
              placeholder="you@example.com"
              autoComplete="off"
            />
            {errors.emailId && touchedFields.emailId && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.emailId.message}
              </p>
            )}
          </div>

          {forgotError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600 text-center">{forgotError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={forgotLoading || isSubmitting || !emailId || errors.emailId}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {forgotLoading || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send Reset OTP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold hover:underline cursor-pointer text-pink-500">
              Back to Login
            </Link>
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-800">Security Note</p>
              <p className="text-xs text-blue-700 mt-1">The reset OTP will expire in 3 minutes for security reasons.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;