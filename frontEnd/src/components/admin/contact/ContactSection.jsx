import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, Mail, Save, Edit2, X, Loader, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { updateContact, fetchMeta } from '../../../redux/slices/metaSlice';
import AdminLoading from '../../../common/AdminLoading';
import ErrorState from '../../../common/ErrorState';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').min(10, 'Minimum 10 digits').max(15, 'Too long'),
  gmailId: z.string().email('Invalid email').regex(/@gmail\.com$/, 'Must be Gmail address')
});

const ContactSection = React.memo(() => {
  const dispatch = useDispatch();
  const { meta, loading, error, updateLoading } = useSelector((state) => state.meta);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [contactData, setContactData] = useState({ phoneNumber: '', gmailId: '' });

  useEffect(() => {
    if (!meta) {
      dispatch(fetchMeta());
    }
  }, [dispatch, meta]);

  useEffect(() => {
    if (meta) {
      setContactData({ phoneNumber: meta.phoneNumber || '', gmailId: meta.gmailId || '' });
    }
  }, [meta]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validateForm = useCallback(() => {
    try {
      contactSchema.parse(contactData);
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach(err => { formattedErrors[err.path[0]] = err.message; });
      setErrors(formattedErrors);
      return false;
    }
  }, [contactData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    await dispatch(updateContact(contactData));
    setIsEditing(false);
  }, [dispatch, contactData, validateForm]);

  const handleCancel = useCallback(() => {
    setContactData({ phoneNumber: meta?.phoneNumber || '', gmailId: meta?.gmailId || '' });
    setErrors({});
    setIsEditing(false);
  }, [meta]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing contact information...');
    try {
      await dispatch(fetchMeta()).unwrap();
      toast.success('Contact information refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh contact information', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  if (loading && !meta) {
    return <AdminLoading text="Loading contact information" icon={Phone} color="teal" />;
  }

  if (error && !meta) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Contact Information"
        icon="alert"
        showRetry={true}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-teal-100 rounded-xl">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Contact Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your contact details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm sm:text-base"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Edit Contact
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        {isEditing ? (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={contactData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+919000369453"
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Gmail ID *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  name="gmailId"
                  value={contactData.gmailId}
                  onChange={handleInputChange}
                  placeholder="studio@gmail.com"
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${errors.gmailId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                />
              </div>
              {errors.gmailId && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.gmailId}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={updateLoading}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {updateLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {contactData.phoneNumber || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase">Email Address</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                  {contactData.gmailId || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;