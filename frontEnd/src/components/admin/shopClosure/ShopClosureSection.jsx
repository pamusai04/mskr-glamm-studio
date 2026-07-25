import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Plus, Trash2, Edit2, Loader, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { fetchMeta, addShopClosureDate, deleteShopClosureDate } from '../../../redux/slices/metaSlice';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import toast from 'react-hot-toast';

const closureDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format (e.g., 2026-06-15)'),
  reason: z.string().optional()
});

const ShopClosureSection = React.memo(() => {
  const dispatch = useDispatch();
  const { meta, loading, error } = useSelector((state) => state.meta);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newClosure, setNewClosure] = useState({ 
    date: '', 
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!meta) {
      dispatch(fetchMeta());
    }
  }, [dispatch, meta]);

  const shopClosureDates = useMemo(() => meta?.shopClosureDates || [], [meta?.shopClosureDates]);

  const validateClosure = useCallback((closure) => {
    try {
      closureDateSchema.parse({ date: closure.date, reason: closure.reason });
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          if (err.path && err.path[0]) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
      } else if (error.message) {
        formattedErrors.form = error.message;
      }
      setErrors(formattedErrors);
      return false;
    }
  }, []);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAddClosure = useCallback(async () => {
    if (!newClosure.date) {
      setErrors({ form: 'Please enter a date' });
      return;
    }

    const validated = validateClosure(newClosure);
    if (validated) {
      setIsSubmitting(true);
      await dispatch(addShopClosureDate({ 
        date: newClosure.date, 
        reason: newClosure.reason 
      }));
      setNewClosure({ date: '', reason: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [dispatch, newClosure, validateClosure]);

  const handleDeleteClosure = useCallback(async (closureId) => {
    if (window.confirm('Delete this closure date?')) {
      setDeleteLoading(true);
      await dispatch(deleteShopClosureDate(closureId));
      setDeleteLoading(false);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMeta()).unwrap();
      toast.success('Closure dates refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh closure dates');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleDateChange = (e) => {
    let value = e.target.value;
    let formattedValue = value.replace(/[^0-9-]/g, '');
    
    if (formattedValue.length === 4 && !formattedValue.includes('-')) {
      formattedValue = formattedValue + '-';
    }
    if (formattedValue.length === 7 && formattedValue.split('-')[1]?.length === 2 && !formattedValue.endsWith('-')) {
      formattedValue = formattedValue + '-';
    }
    if (formattedValue.length > 10) {
      formattedValue = formattedValue.slice(0, 10);
    }
    
    setNewClosure({ ...newClosure, date: formattedValue });
  };

  const closureList = useMemo(() => shopClosureDates.map((closure) => (
    <div key={closure._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3">
        <Calendar className="w-4 h-4 text-red-600" />
        <div>
          <span className="text-sm sm:text-base text-gray-900 font-medium">{formatDisplayDate(closure.date)}</span>
          {closure.reason && (
            <p className="text-xs text-gray-500 mt-0.5">{closure.reason}</p>
          )}
        </div>
      </div>
      {isEditing && (
        <button 
          onClick={() => handleDeleteClosure(closure._id)} 
          disabled={deleteLoading} 
          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
        >
          {deleteLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  )), [shopClosureDates, isEditing, handleDeleteClosure, deleteLoading]);

  if (loading && !shopClosureDates.length) {
    return <AdminLoading text="Loading closure dates" icon={Calendar} color="red" />;
  }

  if (error && !shopClosureDates.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Closure Dates"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!loading && shopClosureDates.length === 0 && !isEditing) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shop Closure Dates</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
            >
              <Edit2 className="w-4 h-4" /> Add Closure Dates
            </button>
          </div>
        </div>
        <EmptyState
          title="No Closure Dates Found"
          message="Click the button above to add your first shop closure date."
          icon="Calendar"
          showAction={false}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shop Closure Dates</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {shopClosureDates.length} {shopClosureDates.length === 1 ? 'Closure Date' : 'Closure Dates'} scheduled
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
            >
              <Edit2 className="w-4 h-4" /> Edit Closures
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Closure Date *</label>
              <input 
                type="text" 
                placeholder="YYYY-MM-DD (e.g., 2026-06-15)" 
                value={newClosure.date} 
                onChange={handleDateChange}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                  errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`} 
              />
              <p className="text-xs text-gray-400">Format: YYYY-MM-DD (e.g., 2026-06-15)</p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Reason (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Diwali, Pongal, Maintenance" 
                value={newClosure.reason} 
                onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                  errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`} 
              />
            </div>

            {(errors.date || errors.form) && (
              <p className="text-sm text-red-600">{errors.date || errors.form}</p>
            )}

            <button 
              onClick={handleAddClosure} 
              disabled={isSubmitting} 
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
              Add Closure Date
            </button>

            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-semibold text-gray-700">Existing Closure Dates:</h3>
              {closureList}
              {shopClosureDates.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No closure dates added yet</p>}
            </div>

            <button 
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                setNewClosure({ date: '', reason: '' });
              }} 
              className="w-full py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopClosureDates.map((closure) => (
              <div key={closure._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-4 h-4 text-red-600" />
                <div>
                  <span className="text-sm sm:text-base text-gray-900">{formatDisplayDate(closure.date)}</span>
                  {closure.reason && (
                    <p className="text-xs text-gray-500 mt-0.5">{closure.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ShopClosureSection.displayName = 'ShopClosureSection';
export default ShopClosureSection;