
// import React, { memo, useCallback } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { Edit, Trash2, Calendar, Users, Image, Clock } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { deleteService } from '../../../redux/slices/adminServiceSlice';

// const ServiceCard = memo(({ service }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
  
//   const handleEdit = useCallback(() => {
//     navigate(`/admin/edit-service/${service._id}`);
//   }, [navigate, service._id]);

//   const handleDelete = useCallback(async () => {
//     if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
//       const result = await dispatch(deleteService({ _id: service._id }));
//       if (!result.error) {
//         toast.success(result.payload?.message || 'Service deleted successfully!');
//       } else {
//         toast.error(result.payload || 'Failed to delete service');
//       }
//     }
//   }, [dispatch, service._id, service.name]);

//   const hasOriginalPrice = service.originalPrice && service.originalPrice > service.price;
//   const savings = hasOriginalPrice ? service.originalPrice - service.price : 0;
//   const savingsPercentage = hasOriginalPrice ? ((savings / service.originalPrice) * 100).toFixed(0) : 0;
  
//   const formatDuration = (minutes) => {
//     if (!minutes && minutes !== 0) return 'Not specified';
    
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
    
//     if (hours === 0) {
//       return `${mins} min${mins !== 1 ? 's' : ''}`;
//     }
//     if (mins === 0) {
//       return `${hours} hour${hours !== 1 ? 's' : ''}`;
//     }
//     return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
//   };
  
//   return (
//     <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 ease-out overflow-hidden border border-gray-100 hover:border-purple-100">
//       <div className="relative h-44 overflow-hidden bg-linear-to-br from-pink-50 to-purple-50">
//         {service.serviceImage ? (
//           <img 
//             src={service.serviceImage} 
//             alt={service.name}
//             className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
//             loading="lazy"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center transition-opacity duration-500 group-hover:opacity-90">
//             <Image className="w-10 h-10 text-purple-200" />
//           </div>
//         )}
        
//         <div className="absolute top-3 left-3">
//           <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 backdrop-blur-sm text-purple-600 text-[10px] sm:text-xs font-medium rounded-full shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
//             {service.categoryTitle}
//           </span>
//         </div>
//       </div>

//       <div className="p-3 sm:p-4">
//         <div className="mb-2">
//           <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-purple-500 transition-colors duration-500 line-clamp-1">
//             {service.name}
//           </h3>
//           <p className="text-gray-500 text-[11px] sm:text-xs mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-500">
//             {service.desc}
//           </p>
//         </div>

//         <div className="mb-3">
//           {hasOriginalPrice ? (
//             <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
//               <span className="text-base sm:text-xl font-bold text-purple-600 group-hover:text-purple-500 transition-colors duration-500">
//                 ₹{service.price.toLocaleString()}
//               </span>
//               <span className="text-[11px] sm:text-sm text-gray-400 line-through">
//                 ₹{service.originalPrice.toLocaleString()}
//               </span>
//               <span className="text-[9px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full">
//                 {savingsPercentage}% OFF
//               </span>
//             </div>
//           ) : (
//             <span className="text-base sm:text-xl font-bold text-purple-600 group-hover:text-purple-500 transition-colors duration-500">
//               ₹{service.price.toLocaleString()}
//             </span>
//           )}
//         </div>

//         <div className="flex items-center gap-2 sm:gap-3 mb-4 text-[10px] sm:text-xs text-gray-500">
//           <div className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-500">
//             <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
//             <span>{service.bookCount || 0} bookings</span>
//           </div>
//           <div className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-500">
//             <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
//             <span>{formatDuration(service.duration)}</span>
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={handleEdit}
//             className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-100 text-gray-700 rounded-lg sm:rounded-full hover:bg-purple-200 hover:text-purple-600 transition-all duration-500 text-[11px] sm:text-sm font-medium"
//           >
//             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
//             Edit
//           </button>
//           <button
//             onClick={handleDelete}
//             className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-100 text-gray-700 rounded-lg sm:rounded-full hover:bg-red-200 hover:text-red-500 transition-all duration-500 text-[11px] sm:text-sm font-medium"
//           >
//             <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// });

// ServiceCard.displayName = 'ServiceCard';

// export default ServiceCard;


import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Users, Image, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteService } from '../../../redux/slices/adminServiceSlice';
import { 
  formatDuration, 
  calculateDiscountPercentage, 
  hasDiscount,
  formatPrice 
} from '../../../utils/serviceUtils';

const ServiceCard = memo(({ service }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleEdit = useCallback(() => {
    navigate(`/admin/edit-service/${service._id}`);
  }, [navigate, service._id]);

  const handleDelete = useCallback(async () => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      const result = await dispatch(deleteService({ _id: service._id }));
      if (!result.error) {
        toast.success(result.payload?.message || 'Service deleted successfully!');
      } else {
        toast.error(result.payload || 'Failed to delete service');
      }
    }
  }, [dispatch, service._id, service.name]);

  const discount = hasDiscount(service.originalPrice, service.price);
  const discountPercentage = calculateDiscountPercentage(service.originalPrice, service.price);
  const formattedPrice = formatPrice(service.price);
  const formattedOriginalPrice = formatPrice(service.originalPrice);
  const durationText = formatDuration(service.duration);
  
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 ease-out overflow-hidden border border-gray-100 hover:border-purple-100">
      <div className="relative h-44 overflow-hidden bg-linear-to-br from-pink-50 to-purple-50">
        {service.serviceImage ? (
          <img 
            src={service.serviceImage} 
            alt={service.name}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-opacity duration-500 group-hover:opacity-90">
            <Image className="w-10 h-10 text-purple-200" />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 backdrop-blur-sm text-purple-600 text-[10px] sm:text-xs font-medium rounded-full shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
            {service.categoryTitle}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-purple-500 transition-colors duration-500 line-clamp-1">
            {service.name}
          </h3>
          <p className="text-gray-500 text-[11px] sm:text-xs mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-500">
            {service.desc}
          </p>
        </div>

        <div className="mb-3">
          {discount ? (
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-xl font-bold text-purple-600 group-hover:text-purple-500 transition-colors duration-500">
                ₹{formattedPrice}
              </span>
              <span className="text-[11px] sm:text-sm text-gray-400 line-through">
                ₹{formattedOriginalPrice}
              </span>
              <span className="text-[9px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full">
                {discountPercentage}% OFF
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-xl font-bold text-purple-600 group-hover:text-purple-500 transition-colors duration-500">
              ₹{formattedPrice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-4 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-500">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
            <span>{service.bookCount || 0} bookings</span>
          </div>
          <div className="flex items-center gap-1 group-hover:text-purple-500 transition-colors duration-500">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
            <span>{durationText}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-100 text-gray-700 rounded-lg sm:rounded-full hover:bg-purple-200 hover:text-purple-600 transition-all duration-500 text-[11px] sm:text-sm font-medium"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-100 text-gray-700 rounded-lg sm:rounded-full hover:bg-red-200 hover:text-red-500 transition-all duration-500 text-[11px] sm:text-sm font-medium"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;