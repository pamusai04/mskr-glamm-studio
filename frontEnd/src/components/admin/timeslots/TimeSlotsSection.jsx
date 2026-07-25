// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Clock, Plus, Trash2, Edit2, Loader, RefreshCw } from 'lucide-react';
// import { z } from 'zod';
// import { deleteServiceMetaItem, addTimeSlot, fetchMeta } from '../../../redux/slices/metaSlice';
// import AdminLoading from '../../../common/AdminLoading';
// import EmptyState from '../../../common/EmptyState';
// import ErrorState from '../../../common/ErrorState';
// import toast from 'react-hot-toast';

// const timeSlotSchema = z.object({
//   startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Use HH:MM AM/PM format'),
//   endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Use HH:MM AM/PM format')
// }).refine((data) => {
//   const convertTo24 = (time) => {
//     const [timePart, modifier] = time.split(' ');
//     let [hours, minutes] = timePart.split(':');
//     hours = parseInt(hours);
//     if (modifier === 'PM' && hours !== 12) hours += 12;
//     if (modifier === 'AM' && hours === 12) hours = 0;
//     return hours * 60 + parseInt(minutes);
//   };
//   return convertTo24(data.startTime) < convertTo24(data.endTime);
// }, { message: 'End time must be after start time' });

// const TimeSlotsSection = React.memo(() => {
//   const dispatch = useDispatch();
//   const { meta, loading, error, deleteLoading } = useSelector((state) => state.meta);
//   const [isEditing, setIsEditing] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [newSlot, setNewSlot] = useState({ 
//     startTime: '', 
//     startAmPm: 'AM',
//     endTime: '', 
//     endAmPm: 'AM'
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (!meta) {
//       dispatch(fetchMeta());
//     }
//   }, [dispatch, meta]);

//   const timeSlots = useMemo(() => meta?.timeSlots || [], [meta?.timeSlots]);

//   const formatTimeString = (time, ampm) => {
//     if (!time) return '';
//     const formattedTime = time.includes(':') ? time : `${time}:00`;
//     return `${formattedTime} ${ampm}`;
//   };

//   const validateSlot = useCallback((slot) => {
//     try {
//       const startTimeStr = formatTimeString(slot.startTime, slot.startAmPm);
//       const endTimeStr = formatTimeString(slot.endTime, slot.endAmPm);
//       timeSlotSchema.parse({ startTime: startTimeStr, endTime: endTimeStr });
//       setErrors({});
//       return { startTimeStr, endTimeStr };
//     } catch (error) {
//       const formattedErrors = {};
//       if (error.errors && Array.isArray(error.errors)) {
//         error.errors.forEach(err => {
//           if (err.path && err.path[0]) {
//             formattedErrors[err.path[0]] = err.message;
//           }
//         });
//       } else if (error.message) {
//         formattedErrors.form = error.message;
//       }
//       setErrors(formattedErrors);
//       return null;
//     }
//   }, []);

//   const handleAddSlot = useCallback(async () => {
//     if (!newSlot.startTime || !newSlot.endTime) {
//       setErrors({ form: 'Please fill both start and end time' });
//       return;
//     }

//     const validated = validateSlot(newSlot);
//     if (validated) {
//       setIsSubmitting(true);
//       const result = await dispatch(addTimeSlot({ 
//         startTime: validated.startTimeStr, 
//         endTime: validated.endTimeStr 
//       }));
//       if (result.meta.requestStatus === 'fulfilled') {
//         toast.success('Time slot added successfully');
//         setNewSlot({ 
//           startTime: '', startAmPm: 'AM',
//           endTime: '', endAmPm: 'AM'
//         });
//         setErrors({});
//       } else {
//         setErrors({ form: result.payload?.message || 'Failed to add time slot' });
//       }
//       setIsSubmitting(false);
//     }
//   }, [dispatch, newSlot, validateSlot]);

//   const handleDeleteSlot = useCallback(async (slotId) => {
//     if (window.confirm('Delete this time slot?')) {
//       const result = await dispatch(deleteServiceMetaItem(slotId));
//       if (result.meta.requestStatus === 'fulfilled') {
//         toast.success('Time slot deleted successfully');
//       }
//     }
//   }, [dispatch]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     const toastId = toast.loading('Refreshing time slots...');
//     try {
//       await dispatch(fetchMeta()).unwrap();
//       toast.success('Time slots refreshed successfully', { id: toastId });
//     } catch (error) {
//       toast.error('Failed to refresh time slots', { id: toastId });
//     } finally {
//       setRefreshing(false);
//     }
//   }, [dispatch]);

//   const slotList = useMemo(() => timeSlots.map((slot) => (
//     <div key={slot._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
//       <div className="flex items-center gap-2 sm:gap-3">
//         <Clock className="w-4 h-4 text-indigo-600" />
//         <span className="text-sm sm:text-base text-gray-900 font-medium">{slot.startTime} - {slot.endTime}</span>
//       </div>
//       {isEditing && (
//         <button onClick={() => handleDeleteSlot(slot._id)} disabled={deleteLoading} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
//           {deleteLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
//         </button>
//       )}
//     </div>
//   )), [timeSlots, isEditing, handleDeleteSlot, deleteLoading]);

//   if (loading && !timeSlots.length) {
//     return <AdminLoading text="Loading time slots" icon={Clock} color="indigo" />;
//   }

//   if (error && !timeSlots.length) {
//     return (
//       <ErrorState 
//         error={error}
//         onRetry={handleRefresh}
//         title="Failed to Load Time Slots"
//         icon="alert"
//         showRetry={true}
//       />
//     );
//   }

//   if (!loading && timeSlots.length === 0 && !isEditing) {
//     return (
//       <div className="p-4 sm:p-6">
//         <div className="flex flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
//               <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
//             </div>
//             <div>
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Time Slots</h2>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
//             >
//               <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//               {refreshing ? 'Refreshing...' : 'Refresh'}
//             </button>
//             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
//               <Edit2 className="w-4 h-4" /> Add Slots
//             </button>
//           </div>
//         </div>
//         <EmptyState
//           title="No Time Slots Found"
//           message="Click the button above to add your first time slot."
//           icon="default"
//           showAction={false}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="flex flex-col  sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
//             <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
//           </div>
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Time Slots</h2>
//             <p className="text-sm text-gray-500 mt-0.5">
//               {timeSlots.length} {timeSlots.length === 1 ? 'Slot' : 'Slots'} available
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
//           >
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//             {refreshing ? 'Refreshing...' : 'Refresh'}
//           </button>
//           {!isEditing && (
//             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
//               <Edit2 className="w-4 h-4" /> Edit Slots
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
//         {isEditing ? (
//           <div className="space-y-5 sm:space-y-6">
//             <div className="space-y-2 sm:space-y-3">
//               <label className="block text-sm font-semibold text-gray-700">Start Time</label>
//               <div className="flex gap-2">
//                 <input 
//                   type="text" 
//                   placeholder="09:00" 
//                   value={newSlot.startTime} 
//                   onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
//                   className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
//                     errors.startTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                   }`} 
//                 />
//                 <select 
//                   value={newSlot.startAmPm} 
//                   onChange={(e) => setNewSlot({ ...newSlot, startAmPm: e.target.value })}
//                   className="w-20 sm:w-24 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white"
//                 >
//                   <option value="AM">AM</option>
//                   <option value="PM">PM</option>
//                 </select>
//               </div>
//             </div>

//             <div className="space-y-2 sm:space-y-3">
//               <label className="block text-sm font-semibold text-gray-700">End Time</label>
//               <div className="flex gap-2">
//                 <input 
//                   type="text" 
//                   placeholder="10:30" 
//                   value={newSlot.endTime} 
//                   onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
//                   className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
//                     errors.endTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                   }`} 
//                 />
//                 <select 
//                   value={newSlot.endAmPm} 
//                   onChange={(e) => setNewSlot({ ...newSlot, endAmPm: e.target.value })}
//                   className="w-20 sm:w-24 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white"
//                 >
//                   <option value="AM">AM</option>
//                   <option value="PM">PM</option>
//                 </select>
//               </div>
//             </div>

//             {(errors.startTime || errors.endTime || errors.form) && (
//               <p className="text-sm text-red-600">{errors.startTime || errors.endTime || errors.form}</p>
//             )}

//             <button 
//               onClick={handleAddSlot} 
//               disabled={isSubmitting} 
//               className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm sm:text-base"
//             >
//               {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
//               Add Time Slot
//             </button>

//             <div className="space-y-2 mt-4">
//               <h3 className="text-sm font-semibold text-gray-700">Existing Time Slots:</h3>
//               {slotList}
//               {timeSlots.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No time slots added yet</p>}
//             </div>

//             <button 
//               onClick={() => {
//                 setIsEditing(false);
//                 setErrors({});
//                 setNewSlot({ 
//                   startTime: '', startAmPm: 'AM',
//                   endTime: '', endAmPm: 'AM'
//                 });
//               }} 
//               className="w-full py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
//             >
//               Done
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//             {timeSlots.map((slot) => (
//               <div key={slot._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <Clock className="w-4 h-4 text-indigo-600" />
//                 <span className="text-sm sm:text-base text-gray-900">{slot.startTime} - {slot.endTime}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// TimeSlotsSection.displayName = 'TimeSlotsSection';
// export default TimeSlotsSection;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Plus, Trash2, Edit2, Loader, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { deleteServiceMetaItem, addTimeSlot, fetchMeta } from '../../../redux/slices/metaSlice';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import toast from 'react-hot-toast';

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Use HH:MM AM/PM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Use HH:MM AM/PM format')
}).refine((data) => {
  const convertTo24 = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + parseInt(minutes);
  };
  return convertTo24(data.startTime) < convertTo24(data.endTime);
}, { message: 'End time must be after start time' });

const TimeSlotsSection = React.memo(() => {
  const dispatch = useDispatch();
  const { meta, loading, error, deleteLoading } = useSelector((state) => state.meta);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newSlot, setNewSlot] = useState({ 
    startTime: '', 
    startAmPm: 'AM',
    endTime: '', 
    endAmPm: 'AM'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!meta) {
      dispatch(fetchMeta());
    }
  }, [dispatch, meta]);

  const timeSlots = useMemo(() => meta?.timeSlots || [], [meta?.timeSlots]);

  const formatTimeString = (time, ampm) => {
    if (!time) return '';
    const formattedTime = time.includes(':') ? time : `${time}:00`;
    return `${formattedTime} ${ampm}`;
  };

  const validateSlot = useCallback((slot) => {
    try {
      const startTimeStr = formatTimeString(slot.startTime, slot.startAmPm);
      const endTimeStr = formatTimeString(slot.endTime, slot.endAmPm);
      timeSlotSchema.parse({ startTime: startTimeStr, endTime: endTimeStr });
      setErrors({});
      return { startTimeStr, endTimeStr };
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
      return null;
    }
  }, []);

  const handleAddSlot = useCallback(async () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      setErrors({ form: 'Please fill both start and end time' });
      return;
    }

    const validated = validateSlot(newSlot);
    if (validated) {
      setIsSubmitting(true);
      await dispatch(addTimeSlot({ 
        startTime: validated.startTimeStr, 
        endTime: validated.endTimeStr 
      }));
      setNewSlot({ 
        startTime: '', startAmPm: 'AM',
        endTime: '', endAmPm: 'AM'
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [dispatch, newSlot, validateSlot]);

  const handleDeleteSlot = useCallback(async (slotId) => {
    if (window.confirm('Delete this time slot?')) {
      await dispatch(deleteServiceMetaItem(slotId));
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing time slots...');
    try {
      await dispatch(fetchMeta()).unwrap();
      toast.success('Time slots refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh time slots', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const slotList = useMemo(() => timeSlots.map((slot) => (
    <div key={slot._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3">
        <Clock className="w-4 h-4 text-indigo-600" />
        <span className="text-sm sm:text-base text-gray-900 font-medium">{slot.startTime} - {slot.endTime}</span>
      </div>
      {isEditing && (
        <button onClick={() => handleDeleteSlot(slot._id)} disabled={deleteLoading} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
          {deleteLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  )), [timeSlots, isEditing, handleDeleteSlot, deleteLoading]);

  if (loading && !timeSlots.length) {
    return <AdminLoading text="Loading time slots" icon={Clock} color="indigo" />;
  }

  if (error && !timeSlots.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Time Slots"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!loading && timeSlots.length === 0 && !isEditing) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Time Slots</h2>
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
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
              <Edit2 className="w-4 h-4" /> Add Slots
            </button>
          </div>
        </div>
        <EmptyState
          title="No Time Slots Found"
          message="Click the button above to add your first time slot."
          icon="default"
          showAction={false}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col  sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-indigo-100 rounded-xl">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Time Slots</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {timeSlots.length} {timeSlots.length === 1 ? 'Slot' : 'Slots'} available
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
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
              <Edit2 className="w-4 h-4" /> Edit Slots
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        {isEditing ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Start Time</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="09:00" 
                  value={newSlot.startTime} 
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                    errors.startTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`} 
                />
                <select 
                  value={newSlot.startAmPm} 
                  onChange={(e) => setNewSlot({ ...newSlot, startAmPm: e.target.value })}
                  className="w-20 sm:w-24 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-semibold text-gray-700">End Time</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="10:30" 
                  value={newSlot.endTime} 
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                    errors.endTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`} 
                />
                <select 
                  value={newSlot.endAmPm} 
                  onChange={(e) => setNewSlot({ ...newSlot, endAmPm: e.target.value })}
                  className="w-20 sm:w-24 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {(errors.startTime || errors.endTime || errors.form) && (
              <p className="text-sm text-red-600">{errors.startTime || errors.endTime || errors.form}</p>
            )}

            <button 
              onClick={handleAddSlot} 
              disabled={isSubmitting} 
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
              Add Time Slot
            </button>

            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-semibold text-gray-700">Existing Time Slots:</h3>
              {slotList}
              {timeSlots.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No time slots added yet</p>}
            </div>

            <button 
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                setNewSlot({ 
                  startTime: '', startAmPm: 'AM',
                  endTime: '', endAmPm: 'AM'
                });
              }} 
              className="w-full py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <div key={slot._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm sm:text-base text-gray-900">{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

TimeSlotsSection.displayName = 'TimeSlotsSection';
export default TimeSlotsSection;