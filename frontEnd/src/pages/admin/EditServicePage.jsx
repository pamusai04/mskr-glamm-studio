import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Tag, Folder, Layers, Upload, X, Clock, DollarSign, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateService } from '../../redux/slices/adminServiceSlice';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").min(3, "Service name must be at least 3 characters"),
  desc: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  price: z.number().min(1, "Price must be at least ₹1").max(100000, "Price cannot exceed ₹100,000"),
  originalPrice: z.number().optional(),
  duration: z.number().min(5, "Duration must be at least 5 minutes").max(240, "Duration cannot exceed 4 hours (240 minutes)")
}).refine((data) => {
  if (data.originalPrice && data.originalPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Original price must be greater than current price",
  path: ["originalPrice"]
});

const EditServicePage = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { services, loading: fetchLoading } = useSelector((state) => state.adminServices);
  const [loading, setLoading] = useState(false);
  const [serviceFound, setServiceFound] = useState(true);
  const [serviceData, setServiceData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: useMemo(() => ({
      name: '',
      desc: '',
      price: '',
      originalPrice: '',
      duration: 30
    }), [])
  });

  const currentPrice = watch('price');
  const originalPriceValue = watch('originalPrice');
  const durationValue = watch('duration');

  const currentService = useMemo(() => {
    if (!services || !services.length || !id) return null;
    return services.find(s => s._id === id);
  }, [services, id]);

  useEffect(() => {
    if (currentService) {
      setServiceFound(true);
      setServiceData(currentService);
      setCurrentImageUrl(currentService.serviceImage || '');
      reset({
        name: currentService.name || '',
        desc: currentService.desc || '',
        price: currentService.price || '',
        originalPrice: currentService.originalPrice || '',
        duration: currentService.duration || 30
      });
    } else if (services && services.length > 0 && !currentService) {
      setServiceFound(false);
      toast.error('Service not found');
      navigate('/admin');
    }
  }, [currentService, reset, navigate, services]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG, and WEBP formats are allowed');
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setCurrentImageUrl('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl('');
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = '';
    }
  };

  const formatDurationDisplay = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minute${mins > 1 ? 's' : ''}`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  };

  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('_id', id);
    formData.append('name', data.name);
    formData.append('desc', data.desc);
    formData.append('price', Number(data.price));
    formData.append('duration', Number(data.duration));
    
    if (data.originalPrice) {
      formData.append('originalPrice', Number(data.originalPrice));
    }
    
    if (imageFile) {
      formData.append('serviceImage', imageFile);
    }
    
    const result = await dispatch(updateService({ id, serviceData: formData }));
    
    if (!result.error) {
      toast.success(result.payload?.message || 'Service updated successfully!');
      navigate('/admin');
    } else {
      toast.error(result.payload || 'Failed to update service');
    }
    
    setLoading(false);
  }, [dispatch, id, navigate, imageFile]);

  const handleCancel = useCallback(() => {
    navigate('/admin');
  }, [navigate]);
  
  const categoryInfo = useMemo(() => {
    if (!serviceData) return [];
    return [
      { label: 'Category Title', value: serviceData.categoryTitle, icon: Folder },
      { label: 'Category Name', value: serviceData.categoryName, icon: Tag },
      { label: 'Category Type', value: serviceData.categoryType, icon: Layers },
      { label: 'Total Bookings', value: serviceData.bookCount || 0, suffix: 'bookings', icon: null }
    ];
  }, [serviceData]);
  
  // Helper function to safely get numeric value for display
  const getSafeNumber = (value) => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Safe display values
  const safeDuration = getSafeNumber(durationValue);
  const safeOriginalPrice = getSafeNumber(originalPriceValue);
  const safeCurrentPrice = getSafeNumber(currentPrice);

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!serviceFound) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-20">
        <div className="mb-4 sm:mb-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-1.5 sm:gap-2 text-purple-600 hover:text-purple-700 transition-colors text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Admin Panel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Save className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Edit Service</h1>
              <p className="text-xs sm:text-sm text-gray-500">Update service details</p>
            </div>
          </div>

          {categoryInfo.length > 0 && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                Category Information (Read Only)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {categoryInfo.map((item, index) => (
                  <div key={index}>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">
                      {item.label}
                    </label>
                    <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white rounded border border-gray-200">
                      {item.icon && <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />}
                      <span className="text-xs sm:text-sm text-gray-900">
                        {item.value ?? 'N/A'}
                        {item.suffix && (
                          <span className="text-gray-500 text-[10px] sm:text-xs ml-1">
                            {item.suffix}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className='flex flex-col sm:flex-row sm:justify-between sm:gap-5 space-y-4 sm:space-y-0'>
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter service name"
                />
                {errors.name && (
                  <p className="mt-1 text-[10px] sm:text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>  
              
            </div>

            <div className='flex flex-col sm:flex-row sm:justify-between sm:gap-5 space-y-4 sm:space-y-0'>
              <div className='w-full'>
                <label className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Current Price
                  (<IndianRupee className="w-4 h-4 text-gray-500"/>) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    {...register('price', { valueAsNumber: true })}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter current price"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-[10px] sm:text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>  
              <div className='w-full'>
                <label className="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Original Price
                  (<IndianRupee className="w-4 h-4 text-gray-500"/>)*
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    {...register('originalPrice', { valueAsNumber: true })}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                      errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter original price "
                  />
                </div>
                {safeOriginalPrice && safeCurrentPrice && safeOriginalPrice > safeCurrentPrice && (
                  <p className="mt-1 text-[10px] sm:text-xs text-green-600">
                    ✨ Customer saves: ₹{safeOriginalPrice - safeCurrentPrice} ({((safeOriginalPrice - safeCurrentPrice) / safeOriginalPrice * 100).toFixed(0)}% off)
                  </p>
                )}
                {errors.originalPrice && (
                  <p className="mt-1 text-[10px] sm:text-sm text-red-600">{errors.originalPrice.message}</p>
                )}
              </div>
            </div>

            <div className='w-full'>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              
              <div className="flex items-stretch gap-2">
                <input
                  type="number"
                  step="5"
                  {...register('duration', { valueAsNumber: true })}
                  className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter duration in minutes"
                />

                <div className="flex items-center justify-center px-3 border border-gray-300 rounded-lg bg-white">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {safeDuration && safeDuration > 0 && (
                <p className="mt-1 text-[10px] sm:text-xs text-purple-600">
                  {formatDurationDisplay(safeDuration)}
                </p>
              )}
              
              {errors.duration && (
                <p className="mt-1 text-[10px] sm:text-sm text-red-600">{errors.duration.message}</p>
              )}
              <p className="mt-0.5 text-[9px] sm:text-xs text-gray-400">Minimum 5 minutes • Maximum 4 hours (240 minutes)</p>
            </div>
  
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('desc')}
                rows="3"
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                  errors.desc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter service description"
              />
              {errors.desc && (
                <p className="mt-1 text-[10px] sm:text-sm text-red-600">{errors.desc.message}</p>
              )}
            </div>
      
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Service Image
              </label>
              
              {(currentImageUrl || imagePreview) && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={imagePreview || currentImageUrl} 
                    alt="Current service" 
                    className="h-32 sm:h-40 md:h-48 w-auto object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
              
              <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" />
                  <div className="flex flex-col sm:flex-row items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <label
                      htmlFor="imageInput"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Upload a new image</span>
                      <input
                        id="imageInput"
                        name="imageInput"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="hidden sm:block">or drag and drop</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    PNG, JPG, JPEG, WEBP up to 5MB
                  </p>
                  {currentImageUrl && !imagePreview && (
                    <p className="text-[10px] sm:text-xs text-green-600">
                      Current image will be kept if no new image is uploaded
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white text-xs sm:text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Updating...' : 'Update Service'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

EditServicePage.displayName = 'EditServicePage';

export default EditServicePage;