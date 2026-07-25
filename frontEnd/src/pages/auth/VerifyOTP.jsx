import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { verifyOTP, resendOTP, clearOtpError } from '../../redux/slices/userSlice';
import { Mail, ArrowRight, Loader2, AlertCircle, Shield, Timer, RefreshCw, CheckCircle2 } from 'lucide-react';

const otpSchema = z.object({
  otpCode: z.string()
    .min(1, "OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers")
});

const emailSchema = z.object({
  emailId: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
});

const VerifyOTP = () => {
  const [timeLeft, setTimeLeft] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [showUserNotFound, setShowUserNotFound] = useState(false);
  const [rateLimitWaitTime, setRateLimitWaitTime] = useState(null);
  
  const errorShownRef = useRef(false);
  const redirectTimeoutRef = useRef(null);
  const rateLimitTimerRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { pendingEmail: reduxEmail, otpLoading, otpError, isAuthenticated } = useSelector((state) => state.user);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { emailId: '' },
    mode: 'onChange'
  });

  const manualEmail = emailForm.watch('emailId');

  useEffect(() => {
    const fromState = location.state?.email;
    const fromRedux = reduxEmail;
    const storedEmail = fromState || fromRedux;
    
    if (storedEmail) {
      setEmail(storedEmail);
      setShowEmailInput(false);
    } else {
      setShowEmailInput(true);
    }
  }, [location.state?.email, reduxEmail]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearOtpError());
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (rateLimitTimerRef.current) {
        clearInterval(rateLimitTimerRef.current);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      redirectTimeoutRef.current = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => {
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
      };
    } else if (redirectCountdown === 0) {
      navigate('/login', { replace: true });
    }
  }, [redirectCountdown, navigate]);

  useEffect(() => {
    if (otpError && !errorShownRef.current) {
      errorShownRef.current = true;
      
      const errorMessage = otpError.toLowerCase();
      
      if (errorMessage.includes('already verified')) {
        setRedirectCountdown(10);
      } 
      else if (errorMessage.includes('user not found')) {
        setShowUserNotFound(true);
      }
      else if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        const match = errorMessage.match(/(\d+)\s*(minute|second)/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const seconds = unit === 'minute' ? value * 60 : value;
          setRateLimitWaitTime(seconds);
          
          rateLimitTimerRef.current = setInterval(() => {
            setRateLimitWaitTime(prev => {
              if (prev <= 1) {
                clearInterval(rateLimitTimerRef.current);
                setCanResend(true);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
      else if (errorMessage.includes('expired')) {
        setTimeLeft(0);
        setCanResend(true);
      }
      else if (errorMessage.includes('attempt')) {
        const match = errorMessage.match(/(\d+)\s*attempt/);
        if (match) {
          const attempts = parseInt(match[1]);
          if (attempts === 0) {
            setTimeLeft(0);
            setCanResend(true);
          }
        }
      }
    }
  }, [otpError]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtpCode(value);
    }
  };

  const onOtpSubmit = async () => {
    if (!email) {
      setShowEmailInput(true);
      return;
    }
    
    if (!otpCode || otpCode.length !== 6) {
      return;
    }
    
    errorShownRef.current = false;
    await dispatch(verifyOTP({ emailId: email, otpCode }));
  };

  const onEmailSubmit = async (data) => {
    setEmail(data.emailId);
    setShowEmailInput(false);
    setShowUserNotFound(false);
    setRateLimitWaitTime(null);
    errorShownRef.current = false;
    
    const result = await dispatch(resendOTP({ emailId: data.emailId }));
    
    if (!result.error) {
      setTimeLeft(180);
      setCanResend(false);
    } else {
      const errorMsg = result.payload?.message || result.error?.message || '';
      if (errorMsg.toLowerCase().includes('user not found')) {
        setShowUserNotFound(true);
      } else if (errorMsg.toLowerCase().includes('already verified')) {
        setRedirectCountdown(10);
      } else if (errorMsg.toLowerCase().includes('too many requests')) {
        const match = errorMsg.match(/(\d+)\s*(minute|second)/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const seconds = unit === 'minute' ? value * 60 : value;
          setRateLimitWaitTime(seconds);
          
          rateLimitTimerRef.current = setInterval(() => {
            setRateLimitWaitTime(prev => {
              if (prev <= 1) {
                clearInterval(rateLimitTimerRef.current);
                setCanResend(true);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    if (!email) {
      setShowEmailInput(true);
      return;
    }
    
    setShowUserNotFound(false);
    setRateLimitWaitTime(null);
    errorShownRef.current = false;
    
    const result = await dispatch(resendOTP({ emailId: email }));
    
    if (!result.error) {
      setTimeLeft(180);
      setCanResend(false);
    } else {
      const errorMsg = result.payload?.message || result.error?.message || '';
      if (errorMsg.toLowerCase().includes('user not found')) {
        setShowUserNotFound(true);
      } else if (errorMsg.toLowerCase().includes('already verified')) {
        setRedirectCountdown(10);
      } else if (errorMsg.toLowerCase().includes('too many requests')) {
        const match = errorMsg.match(/(\d+)\s*(minute|second)/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const seconds = unit === 'minute' ? value * 60 : value;
          setRateLimitWaitTime(seconds);
          
          rateLimitTimerRef.current = setInterval(() => {
            setRateLimitWaitTime(prev => {
              if (prev <= 1) {
                clearInterval(rateLimitTimerRef.current);
                setCanResend(true);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    }
  };

  const handleSignUp = () => {
    navigate('/register', { state: { email: email } });
  };

  if (redirectCountdown !== null && redirectCountdown > 0) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Email Already Verified</h2>
          <p className="text-gray-600">
            This email has already been verified. Redirecting you to login page...
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg">
              <Timer className="w-5 h-5" />
              <span className="font-semibold">Redirecting in {redirectCountdown} seconds</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 text-pink-500 hover:text-pink-600 font-semibold cursor-pointer"
          >
            Click here to login now
          </button>
        </div>
      </div>
    );
  }

  if (showUserNotFound) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Account Not Found</h2>
          <p className="text-gray-600 mb-4">
            No account exists with the email: <span className="font-semibold text-pink-600">{email}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Please sign up first to create an account and verify your email.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleSignUp}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Create New Account
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowUserNotFound(false);
                setShowEmailInput(true);
                setEmail('');
                emailForm.reset();
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Try Different Email
            </button>
          </div>
          <div className="mt-4 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-500 font-semibold hover:underline">
                Login here
              </Link>
            </p>
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
            <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-md bg-pink-500">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-pink-500">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-500">
            {showEmailInput 
              ? "Enter your email address to receive verification code"
              : "We've sent a verification code to your email"
            }
          </p>
        </div>

        {showEmailInput ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Mail className="w-4 h-4 inline mr-2 text-pink-500" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...emailForm.register('emailId')}
                type="email"
                onBlur={() => emailForm.trigger('emailId')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${
                  emailForm.formState.errors.emailId && emailForm.formState.touchedFields.emailId
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                }`}
                placeholder="you@example.com"
                autoComplete="off"
              />
              {emailForm.formState.errors.emailId && emailForm.formState.touchedFields.emailId && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {emailForm.formState.errors.emailId.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!manualEmail || emailForm.formState.errors.emailId || otpLoading}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-pink-500 font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100">
              <p className="text-sm font-semibold text-pink-600 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {email}
              </p>
              <button
                onClick={() => {
                  setShowEmailInput(true);
                  setShowUserNotFound(false);
                  setRateLimitWaitTime(null);
                  errorShownRef.current = false;
                }}
                className="text-xs text-pink-500 hover:text-pink-600 mt-1 cursor-pointer"
              >
                Wrong email? Change
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Timer className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-600">Code expires in:</span>
                <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={handleOtpChange}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl text-gray-500 tracking-widest font-mono border-2 rounded-xl focus:outline-none focus:ring-2 bg-gray-50 border-gray-200 focus:border-pink-400 focus:ring-pink-200"
                placeholder="000000"
                autoComplete="off"
              />
            </div>

            <button
              onClick={onOtpSubmit}
              disabled={otpLoading || !otpCode || otpCode.length !== 6}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              {rateLimitWaitTime !== null ? (
                <div className="flex items-center justify-center gap-2 text-orange-500">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Please wait {formatTime(rateLimitWaitTime)} before retrying
                  </span>
                </div>
              ) : canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-pink-500 hover:text-pink-600 text-sm flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              ) : (
                <p className="text-xs text-gray-400">
                  Didn't receive code? Wait {formatTime(timeLeft)} to resend
                </p>
              )}
            </div>

            <div className="text-center border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-pink-500 font-semibold hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-800">Security Note</p>
              <p className="text-xs text-blue-700">
                Never share this OTP with anyone. Our team will never ask for it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;