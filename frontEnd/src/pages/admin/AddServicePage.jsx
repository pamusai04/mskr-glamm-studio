import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Upload, X, Tag, DollarSign, Sparkles, ChevronDown, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { addService, fetchAllServices } from '../../redux/slices/adminServiceSlice';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").min(3, "Service name must be at least 3 characters"),
  desc: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  price: z.number().min(1, "Price must be at least ₹1").max(100000, "Price cannot exceed ₹100,000"),
  originalPrice: z.number().optional(),
  duration: z.number().min(5, "Duration must be at least 5 minutes").max(240, "Duration cannot exceed 4 hours (240 minutes)"),
  serviceImage: z.any().optional(),
  title: z.string().min(1, "Category title is required"),
  type: z.string().min(1, "Category type is required"),
  category: z.string().min(1, "Category name is required"),
  categoryId: z.string().optional()
}).refine((data) => {
  if (data.originalPrice && data.originalPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: "Original price must be greater than current price",
  path: ["originalPrice"]
});

// Custom Select Component
const CustomCategorySelect = ({ value, onChange, options, placeholder, isCreatingNew, onNewCategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    if (optionValue === 'new' && onNewCategorySelect) {
      onNewCategorySelect();
    }
  };
  
  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-6 sm:pr-8 text-xs sm:text-sm md:text-base text-gray-700 bg-white border rounded-lg transition-all duration-200 flex items-center justify-between group ${
          isOpen 
            ? 'border-purple-300 ring-1 ring-purple-200' 
            : 'border-gray-200 hover:border-purple-300'
        }`}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown 
          className={`text-gray-400 group-hover:text-purple-400 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-purple-100 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm md:text-base transition-all duration-150 ${
                  value === option.value 
                    ? 'bg-purple-50 text-purple-500 font-medium' 
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const calculateDiscountDisplay = (originalPrice, currentPrice) => {
  const original = Number(originalPrice);
  const current = Number(currentPrice);
  
  if (!original || !current || isNaN(original) || isNaN(current) || original <= current) {
    return null;
  }
  
  const savings = original - current;
  const discountPercent = ((savings / original) * 100).toFixed(0);
  
  return {
    savings,
    discountPercent
  };
};

const AddServicePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, loading: fetchLoading } = useSelector((state) => state.adminServices);
  const [loading, setLoading] = useState(false);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      desc: '',
      price: '',
      originalPrice: '',
      duration: 30,
      serviceImage: '',
      categoryId: '',
      title: '',
      type: 'beauty',
      category: ''
    }
  });

  const selectedCategoryTitle = watch('title');
  const currentPrice = watch('price');
  const originalPriceValue = watch('originalPrice');
  const durationValue = watch('duration');

  useEffect(() => {
    if (!services || services.length === 0) {
      dispatch(fetchAllServices());
    }
  }, [dispatch, services]);

  useEffect(() => {
    if (services && services.length > 0) {
      const categoriesMap = new Map();
      services.forEach(service => {
        if (service.categoryId && !categoriesMap.has(service.categoryId)) {
          categoriesMap.set(service.categoryId, {
            title: service.categoryTitle,
            type: service.categoryType,
            category: service.categoryName,
            categoryId: service.categoryId
          });
        }
      });
      setExistingCategories(Array.from(categoriesMap.values()));
    }
  }, [services]);

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
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = '';
    }
  };

  const handleCategorySelection = useCallback((e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'new') {
      setIsCreatingNewCategory(true);
      setValue('title', '');
      setValue('type', 'beauty');
      setValue('category', '');
      setValue('categoryId', '');
    } else if (selectedValue) {
      setIsCreatingNewCategory(false);
      const selectedCategory = existingCategories.find(cat => cat.categoryId === selectedValue);
      if (selectedCategory) {
        setValue('categoryId', selectedCategory.categoryId);
        setValue('title', selectedCategory.title);
        setValue('type', selectedCategory.type);
        setValue('category', selectedCategory.category);
      }
    } else {
      setIsCreatingNewCategory(false);
      setValue('categoryId', '');
      setValue('title', '');
      setValue('type', 'beauty');
      setValue('category', '');
    }
  }, [existingCategories, setValue]);

  
  const formatDurationDisplay = (minutes) => {
    const value = Number(minutes);

    if (!value || isNaN(value) || value <= 0) return '';

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    }

    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  const onSubmit = useCallback(async (data) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('desc', data.desc);
    formData.append('price', Number(data.price));
    formData.append('duration', Number(data.duration));
    
    if (data.originalPrice) {
      formData.append('originalPrice', Number(data.originalPrice));
      formData.append('hasActiveOffer', true);
    }
    
    if (imageFile) {
      formData.append('serviceImage', imageFile);
    }
    
    if (data.categoryId) {
      formData.append('categoryId', data.categoryId);
    } else {
      formData.append('title', data.title);
      formData.append('type', data.type);
      formData.append('category', data.category);
    }
    
    const result = await dispatch(addService(formData));
    
    if (!result.error) {
      toast.success(result.payload?.message || 'Service added successfully!');
      navigate('/admin');
    } else {
      toast.error(result.payload || 'Failed to add service');
    }
    
    setLoading(false);
  }, [dispatch, navigate, imageFile]);

  const categoryOptions = [
    { value: 'new', label: '+ Create New Category' },
    { value: '', label: 'Select a category' },
    ...existingCategories.map(category => ({
      value: category.categoryId,
      label: `${category.title} (${category.category})`
    }))
  ];

  const selectedCategoryValue = isCreatingNewCategory ? 'new' : 
    (selectedCategoryTitle ? existingCategories.find(cat => cat.title === selectedCategoryTitle)?.categoryId || '' : '');

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-1.5 sm:gap-2 text-purple-500 hover:text-purple-600 transition-colors text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Admin Panel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Add New Service</h1>
                <p className="text-xs sm:text-sm text-gray-500">Add a new beauty service to your catalog</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 md:space-y-7">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Enter service name (e.g., Bridal Makeup, Hair Spa)"
                  className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                    errors.name ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Description *
                </label>
                <textarea
                  {...register('desc')}
                  rows="4"
                  placeholder="Describe the service details, benefits, and what customers can expect..."
                  className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                    errors.desc ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                  }`}
                />
                {errors.desc && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.desc.message}</p>
                )}
              </div>

              {/* Duration Field */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    Duration *
                  </span>
                </label>
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="5"
                      {...register('duration', { valueAsNumber: true })}
                      placeholder="Enter duration in minutes"
                      className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                        errors.duration ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    />
                  </div>
                  

                </div>
                {!Number.isNaN(durationValue) && durationValue > 0 && (
                  <p className="mt-1 text-[10px] sm:text-xs text-purple-600">
                    {formatDurationDisplay(durationValue)}
                  </p>
                )}
                {errors.duration && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.duration.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Minimum 5 minutes • Maximum 4 hours (240 minutes)</p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:gap-5 space-y-4 sm:space-y-0">
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Current Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="Enter current selling price..."
                    className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                      errors.price ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>
                
                <div className="w-full">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      Original Price (₹)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    {...register('originalPrice', { valueAsNumber: true })}
                    placeholder="Enter original price..."
                    className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                      errors.originalPrice ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                    }`}
                  />
                  {originalPriceValue && currentPrice && originalPriceValue > currentPrice && (
                    <p className="mt-1 text-xs sm:text-sm text-green-600">
                      ✨ Customer saves: ₹{originalPriceValue - currentPrice} ({((originalPriceValue - currentPrice) / originalPriceValue * 100).toFixed(0)}% off)
                    </p>
                  )}
                  {errors.originalPrice && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500"> {errors.originalPrice.message}</p>
                  )}
                </div>
              </div>

              {/* Custom Category Dropdown */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Service Category *
                </label>
                <CustomCategorySelect
                  value={selectedCategoryValue}
                  onChange={handleCategorySelection}
                  options={categoryOptions}
                  placeholder="Select a category"
                  isCreatingNew={isCreatingNewCategory}
                  onNewCategorySelect={() => setIsCreatingNewCategory(true)}
                />
              </div>

              {isCreatingNewCategory && (
                <div className="space-y-4 sm:space-y-5 pl-3 sm:pl-4 border-l-4 border-purple-200 bg-purple-50/30 p-4 sm:p-5 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-purple-600 inline-flex items-center gap-1.5">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                    New Category Details
                  </h3>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category Title *
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g., Professional Makeup, Hair Styling"
                      className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                        errors.title ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category Type *
                    </label>
                    <div className="relative">
                      <select
                        {...register('type')}
                        className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 bg-white cursor-pointer appearance-none ${
                          errors.type ? 'border-red-400' : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <option value="beauty">Beauty Treatment</option>
                        <option value="makeup">Makeup Service</option>
                      </select>
                      <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.type && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Category Slug/Name *
                    </label>
                    <input
                      type="text"
                      {...register('category')}
                      placeholder="e.g., makeup, hair, skincare (lowercase, no spaces)"
                      className={`w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 text-gray-900 ${
                        errors.category ? 'border-red-400 focus:ring-red-200 focus:border-red-300' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    />
                    {errors.category && (
                      <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Service Image
                </label>
                <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-purple-300 transition-colors duration-200">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Service preview" 
                        className="h-36 sm:h-44 md:h-52 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-gray-400" />
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm text-gray-600">
                        <label
                          htmlFor="imageInput"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-purple-500 hover:text-purple-600 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-300 transition-all duration-200"
                        >
                          <span>Upload an image</span>
                          <input
                            id="imageInput"
                            name="imageInput"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                        <span className="hidden sm:inline">or drag and drop</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        PNG, JPG, JPEG, WEBP • Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 sm:px-7 py-2.5 sm:py-3 bg-purple-500 text-white text-sm sm:text-base rounded-lg hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding Service...
                    </span>
                  ) : (
                    'Add Service'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gray-100 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServicePage;