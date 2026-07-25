// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { MapPin, Edit2, Save, X, Loader, RefreshCw } from 'lucide-react';
// import { z } from 'zod';
// import { updateLocation, fetchMeta } from '../../../redux/slices/metaSlice';
// import AdminLoading from '../../../common/AdminLoading';
// import ErrorState from '../../../common/ErrorState';
// import toast from 'react-hot-toast';

// const locationSchema = z.object({
//   lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
//   lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
//   address: z.string().min(5, 'Address must be at least 5 characters').max(500, 'Address too long')
// });

// const LocationSection = React.memo(() => {
//   const dispatch = useDispatch();
//   const { meta, loading, error, updateLoading } = useSelector((state) => state.meta);
//   const [isEditing, setIsEditing] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [locationData, setLocationData] = useState({ lat: '', lng: '', address: '' });
  
//   useEffect(() => {
//     if (!meta) {
//       dispatch(fetchMeta());
//     }
//   }, [dispatch, meta]);

//   useEffect(() => {
//     if (meta?.location) {
//       setLocationData({
//         lat: meta.location.lat || '',
//         lng: meta.location.lng || '',
//         address: meta.location.address || ''
//       });
//     }
//   }, [meta?.location]);

//   const handleInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setLocationData(prev => ({
//       ...prev,
//       [name]: name === 'lat' || name === 'lng' ? value === '' ? '' : parseFloat(value) : value
//     }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   }, [errors]);

//   const validateForm = useCallback(() => {
//     try {
//       locationSchema.parse({
//         lat: typeof locationData.lat === 'number' ? locationData.lat : parseFloat(locationData.lat),
//         lng: typeof locationData.lng === 'number' ? locationData.lng : parseFloat(locationData.lng),
//         address: locationData.address
//       });
//       setErrors({});
//       return true;
//     } catch (error) {
//       const formattedErrors = {};
//       error.errors.forEach(err => { formattedErrors[err.path[0]] = err.message; });
//       setErrors(formattedErrors);
//       return false;
//     }
//   }, [locationData]);

//   const handleSave = useCallback(async () => {
//     if (!validateForm()) return;
//     const result = await dispatch(updateLocation(locationData));
//     if (result.meta.requestStatus === 'fulfilled') {
//       toast.success('Location updated successfully');
//       setIsEditing(false);
//     }
//   }, [dispatch, locationData, validateForm]);

//   const handleCancel = useCallback(() => {
//     setLocationData({
//       lat: meta?.location?.lat || '',
//       lng: meta?.location?.lng || '',
//       address: meta?.location?.address || ''
//     });
//     setErrors({});
//     setIsEditing(false);
//   }, [meta?.location]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     const toastId = toast.loading('Refreshing location information...');
//     try {
//       await dispatch(fetchMeta()).unwrap();
//       toast.success('Location information refreshed successfully', { id: toastId });
//     } catch (error) {
//       toast.error('Failed to refresh location information', { id: toastId });
//     } finally {
//       setRefreshing(false);
//     }
//   }, [dispatch]);

//   const mapEmbedUrl = useMemo(() => {
//     if (meta?.location?.lat && meta?.location?.lng) {
//       return `https://maps.google.com/maps?q=${meta.location.lat},${meta.location.lng}&z=15&output=embed`;
//     }
//     return null;
//   }, [meta?.location?.lat, meta?.location?.lng]);

//   if (loading && !meta) {
//     return <AdminLoading text="Loading location information" icon={MapPin} color="blue" />;
//   }

//   if (error && !meta) {
//     return (
//       <ErrorState 
//         error={error}
//         onRetry={handleRefresh}
//         title="Failed to Load Location Information"
//         icon="alert"
//         showRetry={true}
//       />
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
//             <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//           </div>
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Location Information</h2>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Manage your business location
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
//           >
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             {refreshing ? 'Refreshing...' : 'Refresh'}
//           </button>
//           {!isEditing && (
//             <button 
//               onClick={() => setIsEditing(true)} 
//               className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
//             >
//               <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" /> 
//               Edit Location
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
//         {isEditing ? (
//           <div className="space-y-4 sm:space-y-5">
//             <div>
//               <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Latitude *</label>
//               <input 
//                 type="number" 
//                 name="lat" 
//                 value={locationData.lat} 
//                 onChange={handleInputChange}
//                 placeholder="Enter latitude (e.g., 17.6914)"
//                 className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
//                   errors.lat ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                 }`} 
//                 step="any" 
//               />
//               {errors.lat && (
//                 <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
//                   <X className="w-3 h-3" /> {errors.lat}
//                 </p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Longitude *</label>
//               <input 
//                 type="number" 
//                 name="lng" 
//                 value={locationData.lng} 
//                 onChange={handleInputChange}
//                 placeholder="Enter longitude (e.g., 83.0034)"
//                 className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
//                   errors.lng ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                 }`} 
//                 step="any" 
//               />
//               {errors.lng && (
//                 <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
//                   <X className="w-3 h-3" /> {errors.lng}
//                 </p>
//               )}
//             </div>
            
//             <div>
//               <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Address *</label>
//               <textarea 
//                 name="address" 
//                 value={locationData.address} 
//                 onChange={handleInputChange}
//                 placeholder="Enter full address"
//                 rows="3"
//                 className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400 ${
//                   errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                 }`} 
//               />
//               {errors.address && (
//                 <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
//                   <X className="w-3 h-3" /> {errors.address}
//                 </p>
//               )}
//             </div>
            
//             <div className="flex flex-col sm:flex-row gap-3 pt-4">
//               <button 
//                 onClick={handleSave} 
//                 disabled={updateLoading} 
//                 className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
//               >
//                 {updateLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                 {updateLoading ? 'Saving...' : 'Save Changes'}
//               </button>
//               <button 
//                 onClick={handleCancel} 
//                 className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-3 sm:space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
//               <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
//                 <p className="text-xs text-gray-500 uppercase">Latitude</p>
//                 <p className="text-sm sm:text-lg font-semibold text-gray-900 bg-blue-50 p-2 rounded-xl mt-1 break-all">
//                   {locationData.lat || 'Not set'}
//                 </p>
//               </div>
//               <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
//                 <p className="text-xs text-gray-500 uppercase">Longitude</p>
//                 <p className="text-sm sm:text-lg font-semibold text-gray-900 bg-blue-50 p-2 rounded-xl mt-1 break-all">
//                   {locationData.lng || 'Not set'}
//                 </p>
//               </div>
//             </div>
//             <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
//               <p className="text-xs text-gray-500 uppercase">Address</p>
//               <p className="text-sm sm:text-base text-gray-900 mt-1">
//                 {locationData.address || 'Not set'}
//               </p>
//             </div>
//             {mapEmbedUrl && (
//               <div className="mt-4 h-48 sm:h-64 rounded-lg overflow-hidden border">
//                 <iframe 
//                   title="Map" 
//                   src={mapEmbedUrl} 
//                   className="w-full h-full" 
//                   allowFullScreen 
//                   loading="lazy" 
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// LocationSection.displayName = 'LocationSection';
// export default LocationSection;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Edit2, Save, X, Loader, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { updateLocation, fetchMeta, clearError } from '../../../redux/slices/metaSlice';
import AdminLoading from '../../../common/AdminLoading';
import ErrorState from '../../../common/ErrorState';
import toast from 'react-hot-toast';

const locationSchema = z.object({
  lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500, 'Address too long')
});

const LocationSection = React.memo(() => {
  const dispatch = useDispatch();
  const { meta, loading, error, updateLoading, isRateLimited } = useSelector((state) => state.meta);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationData, setLocationData] = useState({ lat: '', lng: '', address: '' });
  
  useEffect(() => {
    if (!meta) {
      dispatch(fetchMeta());
    }
  }, [dispatch, meta]);

  useEffect(() => {
    if (meta?.location) {
      setLocationData({
        lat: meta.location.lat || '',
        lng: meta.location.lng || '',
        address: meta.location.address || ''
      });
    }
  }, [meta?.location]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({
      ...prev,
      [name]: name === 'lat' || name === 'lng' ? value === '' ? '' : parseFloat(value) : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validateForm = useCallback(() => {
    try {
      locationSchema.parse({
        lat: typeof locationData.lat === 'number' ? locationData.lat : parseFloat(locationData.lat),
        lng: typeof locationData.lng === 'number' ? locationData.lng : parseFloat(locationData.lng),
        address: locationData.address
      });
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach(err => { formattedErrors[err.path[0]] = err.message; });
      setErrors(formattedErrors);
      return false;
    }
  }, [locationData]);

  const handleSave = useCallback(async () => {
    if (isRateLimited) {
      toast.error('Please wait before trying again');
      return;
    }

    if (!validateForm()) return;

    try {
      await dispatch(updateLocation(locationData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      // Error handled by slice
    }
  }, [dispatch, locationData, validateForm, isRateLimited]);

  const handleCancel = useCallback(() => {
    setLocationData({
      lat: meta?.location?.lat || '',
      lng: meta?.location?.lng || '',
      address: meta?.location?.address || ''
    });
    setErrors({});
    setIsEditing(false);
  }, [meta?.location]);

  const handleRefresh = useCallback(async () => {
    if (isRateLimited) {
      toast.error('Please wait before trying again');
      return;
    }

    setRefreshing(true);
    const toastId = toast.loading('Refreshing location information...');
    try {
      await dispatch(fetchMeta()).unwrap();
      toast.success('Location information refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh location information', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, isRateLimited]);

  const mapEmbedUrl = useMemo(() => {
    if (meta?.location?.lat && meta?.location?.lng) {
      return `https://maps.google.com/maps?q=${meta.location.lat},${meta.location.lng}&z=15&output=embed`;
    }
    return null;
  }, [meta?.location?.lat, meta?.location?.lng]);

  if (loading && !meta) {
    return <AdminLoading text="Loading location information" icon={MapPin} color="blue" />;
  }

  if (error && !meta) {
    return (
      <ErrorState 
        error={isRateLimited ? 'Too many requests. Please try again later.' : error}
        onRetry={handleRefresh}
        title="Failed to Load Location Information"
        icon="alert"
        showRetry={!isRateLimited}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Location Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your business location
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isRateLimited}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              disabled={isRateLimited}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" /> 
              Edit Location
            </button>
          )}
        </div>
      </div>

      {isRateLimited && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <X className="w-4 h-4" />
            Too many requests. Please wait a moment before trying again.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        {isEditing ? (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Latitude *</label>
              <input 
                type="number" 
                name="lat" 
                value={locationData.lat} 
                onChange={handleInputChange}
                placeholder="Enter latitude (e.g., 17.6914)"
                disabled={isRateLimited}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                  errors.lat ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                } ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`} 
                step="any" 
              />
              {errors.lat && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.lat}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Longitude *</label>
              <input 
                type="number" 
                name="lng" 
                value={locationData.lng} 
                onChange={handleInputChange}
                placeholder="Enter longitude (e.g., 83.0034)"
                disabled={isRateLimited}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                  errors.lng ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                } ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`} 
                step="any" 
              />
              {errors.lng && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.lng}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Address *</label>
              <textarea 
                name="address" 
                value={locationData.address} 
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows="3"
                disabled={isRateLimited}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400 ${
                  errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                } ${isRateLimited ? 'opacity-50 cursor-not-allowed' : ''}`} 
              />
              {errors.address && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> {errors.address}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={handleSave} 
                disabled={updateLoading || isRateLimited} 
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {updateLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancel} 
                disabled={isRateLimited}
                className="flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Latitude</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900 bg-blue-50 p-2 rounded-xl mt-1 break-all">
                  {locationData.lat || 'Not set'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase">Longitude</p>
                <p className="text-sm sm:text-lg font-semibold text-gray-900 bg-blue-50 p-2 rounded-xl mt-1 break-all">
                  {locationData.lng || 'Not set'}
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Address</p>
              <p className="text-sm sm:text-base text-gray-900 mt-1">
                {locationData.address || 'Not set'}
              </p>
            </div>
            {mapEmbedUrl && (
              <div className="mt-4 h-48 sm:h-64 rounded-lg overflow-hidden border">
                <iframe 
                  title="Map" 
                  src={mapEmbedUrl} 
                  className="w-full h-full" 
                  allowFullScreen 
                  loading="lazy" 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

LocationSection.displayName = 'LocationSection';
export default LocationSection;