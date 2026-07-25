

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, QrCode, Share2, Download, Copy, Check, Smartphone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import UserProfileSkeleton from '../../common/UserProfileSkeleton';
import { useCart } from '../../components/user/cart/useCart';
import ErrorState from '../../common/ErrorState';
import EmptyState from '../../common/EmptyState';
import { 
  logoutUser, 
  clearError, 
  updateUserProfile,
  changeUserPassword,
  clearPasswordChangeError,
  fetchUserProfile
} from '../../redux/slices/userSlice';

const profileSchema = z.object({
  fullName: z.string()
    .min(3, "Full name must be at least 3 characters")
    .max(20, "Full name must be less than 20 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a valid gender' })
  }),
  contactNumber: z.string()
    .min(1, "Contact number is required")
    .regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
});

const passwordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/^[^\s]+$/, "Password cannot contain spaces"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const { 
    user, 
    isAuthenticated, 
    loading, 
    updateLoading, 
    updateError,
    passwordChangeLoading,
    passwordChangeError
  } = useSelector((state) => state.user);
  
  const { qrCode } = useSelector((state) => state.landingPage);
  const { cart } = useCart();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({
    fullName: '',
    gender: '',
    contactNumber: ''
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      gender: '',
      contactNumber: ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watchPassword('newPassword');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing profile...');
    try {
      await dispatch(fetchUserProfile()).unwrap();
      toast.success('Profile refreshed successfully', { id: toastId });
    } catch {
      toast.error('Failed to refresh profile', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
    if (user) {
      setProfileValue('fullName', user.fullName || '');
      setProfileValue('gender', user.gender || '');
      setProfileValue('contactNumber', user.contactNumber || '');
      setOriginalProfile({
        fullName: user.fullName || '',
        gender: user.gender || '',
        contactNumber: user.contactNumber || ''
      });
    }
  }, [user, isAuthenticated, loading, navigate, setProfileValue]);

  useEffect(() => {
    if (updateError) {
      dispatch(clearError());
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    if (passwordChangeError) {
      dispatch(clearPasswordChangeError());
    }
  }, [passwordChangeError, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch {
      // Error handled by slice
    }
  };

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
    if (isEditingProfile) {
      resetProfile({
        fullName: originalProfile.fullName,
        gender: originalProfile.gender,
        contactNumber: originalProfile.contactNumber
      });
    }
  };

  const handleChangePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    if (isChangingPassword) {
      resetPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const onProfileSubmit = async (data) => {
    const updateData = {};
    let hasChanges = false;
    
    if (data.fullName !== originalProfile.fullName) {
      updateData.fullName = data.fullName;
      hasChanges = true;
    }
    
    if (data.gender !== originalProfile.gender) {
      updateData.gender = data.gender;
      hasChanges = true;
    }
    
    if (data.contactNumber !== originalProfile.contactNumber) {
      updateData.contactNumber = data.contactNumber;
      hasChanges = true;
    }
    
    if (!hasChanges) {
      toast.error('No changes detected');
      return;
    }
    
    try {
      await dispatch(updateUserProfile(updateData)).unwrap();
      setOriginalProfile({
        fullName: data.fullName,
        gender: data.gender,
        contactNumber: data.contactNumber
      });
      setIsEditingProfile(false);
    } catch {
      // Error handled by slice
    }
  };

  const onPasswordSubmit = async (data) => {
    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    };
    
    try {
      await dispatch(changeUserPassword(passwordData)).unwrap();
      resetPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch {
      // Error handled by slice
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShareQR = async () => {
    if (!qrCode || !qrCode.qrImage) {
      toast.error('QR code not available');
      return;
    }

    try {
      if (navigator.share) {
        const response = await fetch(qrCode.qrImage);
        const blob = await response.blob();
        const file = new File([blob], 'msk-makeover-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'MSKR GLAMM STUDIO',
          text: 'Check out MSKR GLAMM STUDIO - Book your appointment now! ✨ Share with your friends and family!',
          files: [file]
        });
        toast.success('Shared successfully! 🎉');
      } else {
        await navigator.clipboard.writeText(qrCode.qrImage);
        setIsCopied(true);
        toast.success('QR code URL copied! Share it with your friends! 📤');
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(qrCode.qrImage);
          setIsCopied(true);
          toast.success('QR code URL copied! Share it with your friends! 📤');
          setTimeout(() => setIsCopied(false), 3000);
        } catch (clipboardError) {
          toast.error('Failed to share QR code. Please try again.');
        }
      }
    }
  };

  const handleDownloadQR = async () => {
    if (!qrCode || !qrCode.qrImage) {
      toast.error('QR code not available');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(qrCode.qrImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'msk-makeover-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR code downloaded! Share it with your friends! 📱');
    } catch (error) {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrCode?.qrImage || '');
      setIsCopied(true);
      toast.success('QR code URL copied! Share it with your friends and family! 📤');
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  if (loading || refreshing) {
    return <UserProfileSkeleton />;
  }

  if (updateError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <ErrorState 
          error={updateError}
          onRetry={handleRefresh}
          title="Failed to Load Profile"
          icon="alert"
          showRetry={true}
        />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <EmptyState 
          title="No User Data"
          message="User profile data is not available."
          icon="CircleUserRound"
          showAction={true}
          actionText="Go to Login"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }
  
  const profilePhotoUrl = user.profilePhoto?.url || user.profilePhoto;

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-indigo-100 overflow-hidden">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://static.vecteezy.com/system/resources/previews/036/280/650/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                      <span className="text-2xl sm:text-3xl text-indigo-600 font-semibold">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{user.fullName}</h2>
                <p className="text-sm text-gray-500 mt-1">{user.emailId}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                  {user.gender && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full capitalize">
                      {user.gender}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    Cart: {cart?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Edit Profile</h3>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfileToggle}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {!isEditingProfile ? (
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Full Name</span>
                    <span className="text-sm text-gray-800 font-medium">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Gender</span>
                    <span className="text-sm text-gray-800 font-medium capitalize">
                      {user.gender || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm text-gray-800 font-medium">{user.emailId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Contact Number</span>
                    <span className="text-sm text-gray-800 font-medium">{user.contactNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      {...registerProfile('fullName')}
                      type="text"
                      className={`w-full px-3 py-2 text-gray-600 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                        profileErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {profileErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{profileErrors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      {...registerProfile('gender')}
                      className={`select select-bordered w-full text-sm text-gray-600 bg-white focus:outline-none transition-all duration-200 ${
                        profileErrors.gender ? 'select-error' : ''
                      }`}
                      style={{
                        borderColor: '#d1d5db',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option disabled value="">Select Gender</option>
                      <option value="male" className="hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-150">
                        Male
                      </option>
                      <option value="female" className="hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-150">
                        Female
                      </option>
                      <option value="other" className="hover:bg-indigo-100 hover:text-indigo-600 transition-colors duration-150">
                        Other
                      </option>
                    </select>
                    {profileErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">{profileErrors.gender.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">+91</span>
                      </div>
                      <input
                        {...registerProfile('contactNumber')}
                        type="tel"
                        className={`w-full pl-12 pr-3 py-2 text-gray-600 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                          profileErrors.contactNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    {profileErrors.contactNumber && (
                      <p className="text-red-500 text-xs mt-1">{profileErrors.contactNumber.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user.emailId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleEditProfileToggle}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {updateLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Change Password</h3>
                {!isChangingPassword && (
                  <button
                    onClick={handleChangePasswordToggle}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {!isChangingPassword ? (
              <div className="p-4 sm:p-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Password is securely encrypted</p>
                  <p className="text-xs text-gray-500 mt-1">Click "Change" to update your password</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        {...registerPassword('currentPassword')}
                        type={showCurrentPassword ? "text" : "password"}
                        className={`w-full px-3 py-2 text-gray-600 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        {...registerPassword('newPassword')}
                        type={showNewPassword ? "text" : "password"}
                        className={`w-full px-3 py-2 text-gray-600 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        {...registerPassword('confirmPassword')}
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full px-3 py-2 text-gray-600 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleChangePasswordToggle}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordChangeLoading}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {passwordChangeLoading ? 'Changing...' : 'Update'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Account Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-gray-500">Account ID</span>
                <span className="text-xs text-gray-800 font-mono">{user._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                <span className="text-sm text-gray-500">Account Type</span>
                <span className="text-sm text-gray-800 font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                <span className="text-sm text-gray-500">Cart Items</span>
                <span className="text-sm text-indigo-600 font-semibold">{cart?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                <span className="text-sm text-gray-500">Account Status</span>
                <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-100">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm text-gray-800">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/cart')}
                className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium"
              >
                🛒 View Cart
              </button>
              <button
                onClick={() => navigate('/booking-history')}
                className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium"
              >
                📋 View Booking History
              </button>
              <button
                onClick={() => navigate('/services')}
                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-left text-sm font-medium"
              >
                ✨ Browse Services
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Section - Added at bottom */}
        {qrCode && (
          <div className="mt-6 mb-10 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 rounded-2xl shadow-sm border border-violet-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Share MSKR GLAMM STUDIO</h3>
                    <p className="text-sm text-gray-500">Share with friends & family</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                    {!imageError ? (
                      <img 
                        src={qrCode.qrImage} 
                        alt="QR Code" 
                        className="w-full h-full object-contain p-1"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <QrCode className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <button
                    onClick={handleShareQR}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md shadow-violet-200"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>

                  <button
                    onClick={handleDownloadQR}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>

                  <button
                    onClick={handleCopyQR}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-gray-200"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-violet-200/50">
                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  📤 Share this QR code with your friends so they can easily book their appointments at MSKR GLAMM STUDIO!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;