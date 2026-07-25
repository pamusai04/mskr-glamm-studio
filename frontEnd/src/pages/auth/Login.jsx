
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginUser } from '../../redux/slices/userSlice';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Smartphone,
  Shield,
  Key
} from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
});

const Login = memo(() => {
  const [showPassword, setShowPassword] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
    getValues
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailId: '',
      password: ''
    },
    mode: 'onChange'
  });

  const emailId = watch('emailId');
  const password = watch('password');

  const isFormValidForModal = useMemo(() => {
    return emailId &&
      emailId.includes('@') &&
      password &&
      password.length > 0 &&
      !errors.emailId &&
      !errors.password;
  }, [emailId, password, errors]);

  const onSubmit = () => {
    if (isFormValidForModal && !isSubmitting) {
      setShowChecklist(true);
    }
  };

  const confirmLogin = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const data = getValues();
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      if (result) {
        setShowChecklist(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      setShowChecklist(false);
      setIsSubmitting(false);
    }
  }, [dispatch, getValues, isSubmitting]);

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'MadhuriShivaKumar') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-md w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform bg-pink-500">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-500">
              Sign in to continue your beauty journey
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-2 text-pink-500" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emailId')}
                  type="email"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${errors.emailId && touchedFields.emailId
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                    }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  Enter the email you used to register
                </p>
                {errors.emailId && touchedFields.emailId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emailId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Lock className="w-4 h-4 inline mr-2 text-pink-500" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${errors.password && touchedFields.password
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                      }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-pink-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && touchedFields.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-pink-500 hover:text-pink-600 border border-gray-50 border-dashed hover:border-green-500 font-medium transition-all duration-200 flex items-center justify-end gap-1 group px-2 py-1 rounded-lg hover:bg-pink-50"
                >
                  <Key className="w-3 h-3 transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-sm" />
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValidForModal || loading || isSubmitting}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-xs md:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline cursor-pointer text-pink-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showChecklist && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-pink-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Your Login</h3>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">Please verify your credentials before logging in:</p>

              <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  {emailId && emailId.includes('@') ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Email: <span className="font-semibold">{emailId || 'Not provided'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {password && password.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Password: <span className="font-semibold">••••••••</span>
                    <span className="text-gray-500 ml-1">({password?.length || 0} characters)</span>
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-blue-800">Security Note</p>
                    <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                      Never share your password with anyone. We'll never ask for your password outside of login.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => {
                  setShowChecklist(false);
                  setIsSubmitting(false);
                }}
                className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={confirmLogin}
                disabled={loading || isSubmitting}
                className="flex-1 bg-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading || isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin inline mr-1.5 sm:mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Confirm Login'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Login;