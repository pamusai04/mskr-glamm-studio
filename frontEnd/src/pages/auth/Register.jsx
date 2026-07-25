import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from '../../redux/slices/userSlice';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Loader2,
  Smartphone,
  Info,
  Shield
} from 'lucide-react';
import TermsAndPrivacy from '../../components/legal/TermsAndPrivacy';

const registerSchema = z.object({
  fullName: z.string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  emailId: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  contactNumber: z.string()
    .min(1, "Contact number is required")
    .length(10, "Contact number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number starting with 6,7,8,9"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character")
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
    getValues
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      emailId: '',
      contactNumber: '',
      password: ''
    },
    mode: 'onChange'
  });

  const password = watch('password');
  const fullName = watch('fullName');
  const emailId = watch('emailId');
  const contactNumber = watch('contactNumber');

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Medium';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordRequirementStatus = (requirement) => {
    if (!password) return false;
    if (requirement === 'length') return password.length >= 8;
    if (requirement === 'uppercase') return /[A-Z]/.test(password);
    if (requirement === 'number') return /[0-9]/.test(password);
    if (requirement === 'special') return /[^a-zA-Z0-9]/.test(password);
    return false;
  };

  const isPasswordStrong = useMemo(() => {
    return passwordStrength === 4;
  }, [passwordStrength]);

  const isFormValidForModal = useMemo(() => {
    return fullName && 
           emailId && 
           contactNumber && 
           contactNumber.length === 10 &&
           password &&
           isPasswordStrong &&
           !errors.fullName &&
           !errors.emailId &&
           !errors.contactNumber &&
           !errors.password;
  }, [fullName, emailId, contactNumber, password, isPasswordStrong, errors]);

  const onSubmit = () => {
    setShowChecklist(true);
  };

  const confirmRegistration = useCallback(async () => {
    const data = getValues();
    const result = await dispatch(registerUser({
      fullName: data.fullName,
      emailId: data.emailId,
      contactNumber: data.contactNumber,
      password: data.password
    }));
    
    setShowChecklist(false);
    
    if (!result.error && result.payload) {
      if (result.payload.requiresVerification) {
        navigate('/verify-otp', { state: { email: data.emailId } });
      } else {
        navigate('/');
      }
    }
  }, [dispatch, getValues, navigate]);

  const handleFieldBlur = useCallback((fieldName) => {
    trigger(fieldName);
  }, [trigger]);

  return (
    <>
      <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-lg w-full space-y-6 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-pink-100">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform bg-pink-500">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-pink-500">
              Create Account
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-500">
              Join us and start your beauty journey
            </p>
          </div>
          
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-2 text-pink-500" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  onBlur={() => handleFieldBlur('fullName')}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${
                    errors.fullName && touchedFields.fullName
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                  }`}
                  placeholder="Enter your full name"
                  autoComplete="off"
                />
                {errors.fullName && touchedFields.fullName && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-2 text-pink-500" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emailId')}
                  type="email"
                  onBlur={() => handleFieldBlur('emailId')}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${
                    errors.emailId && touchedFields.emailId
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  We'll send booking confirmations to this email
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
                  <Phone className="w-4 h-4 inline mr-2 text-pink-500" />
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">+91</span>
                  </div>
                  <input
                    {...register('contactNumber')}
                    type="tel"
                    onBlur={() => handleFieldBlur('contactNumber')}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${
                      errors.contactNumber && touchedFields.contactNumber
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                    }`}
                    placeholder="9876543210"
                    autoComplete="off"
                    maxLength={10}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Enter a valid 10-digit mobile number
                </p>
                {errors.contactNumber && touchedFields.contactNumber && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactNumber.message}
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
                    onBlur={() => handleFieldBlur('password')}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm bg-gray-50 ${
                      errors.password && touchedFields.password
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-pink-400 focus:ring-pink-200'
                    }`}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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

                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {getPasswordRequirementStatus('length') ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={`text-xs ${getPasswordRequirementStatus('length') ? 'text-green-600' : 'text-gray-500'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPasswordRequirementStatus('uppercase') ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={`text-xs ${getPasswordRequirementStatus('uppercase') ? 'text-green-600' : 'text-gray-500'}`}>
                          One uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPasswordRequirementStatus('number') ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={`text-xs ${getPasswordRequirementStatus('number') ? 'text-green-600' : 'text-gray-500'}`}>
                          One number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPasswordRequirementStatus('special') ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={`text-xs ${getPasswordRequirementStatus('special') ? 'text-green-600' : 'text-gray-500'}`}>
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.password && touchedFields.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValidForModal || loading}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <TermsAndPrivacy />
              <p className="text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:underline cursor-pointer text-pink-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {showChecklist && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-pink-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Your Registration</h3>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">Please verify your details before registering:</p>
              
              <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  {fullName && fullName.length >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Full Name: <span className="font-semibold">{fullName || 'Not provided'}</span>
                  </span>
                </div>
                
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
                  {contactNumber && contactNumber.length === 10 ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Contact: <span className="font-semibold">+91 {contactNumber || 'Not provided'}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {isPasswordStrong ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Password Strength: <span className={`font-semibold ${
                      isPasswordStrong ? 'text-green-600' : 
                      passwordStrength === 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{getPasswordStrengthText()}</span>
                  </span>
                </div>
              </div>
              
              <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-blue-800">Important Note</p>
                    <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                      Please remember your password. You'll need it to log in and manage your bookings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => setShowChecklist(false)}
                className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={confirmRegistration}
                disabled={loading}
                className="flex-1 bg-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin inline mr-1.5 sm:mr-2" />
                    Creating...
                  </>
                ) : (
                  'Confirm Registration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;