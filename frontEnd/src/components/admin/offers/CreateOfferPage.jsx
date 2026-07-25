import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, Percent, IndianRupee, Award, Plus, Loader, Search, ChevronDown } from 'lucide-react';
import { createOffer } from '../../../redux/slices/offerSlice';
import { fetchAllServices } from '../../../redux/slices/adminServiceSlice';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const offerSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(300, 'Description must not exceed 300 characters')
    .trim(),
  offerType: z.enum(['percentage', 'fixed']),
  discountValue: z.number()
    .positive('Discount value must be greater than 0')
    .refine((val) => val <= 100, {
      message: 'Percentage discount cannot exceed 100%',
      path: ['discountValue']
    }),
  applicableService: z.string().min(1, 'Please select a service'),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional().default(0),
  firstTimeUserOnly: z.boolean().default(false),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  maxUses: z.number().min(1, 'Maximum uses must be at least 1').optional().nullable(),
}).refine((data) => {
  if (data.validFrom && data.validUntil) {
    return new Date(data.validUntil) > new Date(data.validFrom);
  }
  return true;
}, {
  message: 'Valid until date must be after valid from date',
  path: ['validUntil']
});

const CreateOfferPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, loading: servicesLoading } = useSelector((state) => state.adminServices);
  const { loading: offerLoading } = useSelector((state) => state.offers);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'percentage',
    discountValue: '',
    minAmount: '',
    validFrom: '',
    validUntil: '',
    maxUses: '',
    firstTimeUserOnly: false,
    applicableService: ''
  });

  const [errors, setErrors] = useState({});
  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  useEffect(() => {
    if (!services || services.length === 0) {
      dispatch(fetchAllServices());
    }
  }, [dispatch, services]);

  const uniqueServices = services?.filter((service, index, self) => 
    index === self.findIndex(s => s._id === service._id)
  ) || [];

  const filteredServices = uniqueServices.filter(service =>
    service.name?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const selectedService = uniqueServices.find(s => s._id === formData.applicableService);

  const validateForm = () => {
    try {
      const validationData = {
        ...formData,
        discountValue: formData.discountValue ? Number(formData.discountValue) : 0,
        minAmount: formData.minAmount ? Number(formData.minAmount) : 0,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
      };
      
      offerSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      applicableService: serviceId
    }));
    setIsServiceDropdownOpen(false);
    setServiceSearch('');
    if (errors.applicableService) {
      setErrors(prev => ({ ...prev, applicableService: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      offerType: formData.offerType,
      discountValue: Number(formData.discountValue),
      applicableService: formData.applicableService,
      minAmount: formData.minAmount ? Number(formData.minAmount) : 0,
      firstTimeUserOnly: formData.firstTimeUserOnly,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
    };

    try {
      await dispatch(createOffer(submitData)).unwrap();
      toast.success('Offer created successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Failed to create offer');
    }
  };

  const discountDisplay = formData.offerType === 'percentage' 
    ? `${formData.discountValue || '0'}% OFF`
    : `₹${formData.discountValue || '0'} OFF`;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8  lg:py-8">
        <div className="mb-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Back to Offers
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Offer</h1>
                <p className="text-sm text-gray-500 mt-0.5">Create special discounts and promotions for your services</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Special Discount"
                    maxLength="100"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                      errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.title}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">3-100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    maxLength="300"
                    placeholder="Describe the offer details and terms..."
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">10-300 characters</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Discount Configuration
                </h2>

                <div className="flex flex-col  gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Offer Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerType: 'percentage', discountValue: '' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 text-sm sm:text-base font-medium ${
                          formData.offerType === 'percentage'
                            ? 'bg-pink-600 border-pink-700 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-pink-50 hover:border-pink-300'
                        }`}
                      >
                        <Percent size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Percentage</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, offerType: 'fixed', discountValue: '' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 text-sm sm:text-base font-medium ${
                          formData.offerType === 'fixed'
                            ? 'bg-pink-600 border-pink-700 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-pink-50 hover:border-pink-300'
                        }`}
                      >
                        <IndianRupee size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Fixed Amount</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        placeholder={formData.offerType === 'percentage' ? "Enter percentage" : "Enter amount"}
                        min="0.01"
                        step="0.01"
                        className={`w-full px-3 sm:px-4 pr-12 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                          errors.discountValue ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                      />
                      <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base font-medium">
                        {formData.offerType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                    {errors.discountValue && (
                      <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.discountValue}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Purchase Amount <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="minAmount"
                      value={formData.minAmount}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Minimum purchase amount required (0 for no minimum)</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Validity Period
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Valid From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                      min={today}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                        errors.validFrom ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                    />
                    {errors.validFrom && (
                      <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.validFrom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                      min={formData.validFrom || today}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                        errors.validUntil ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                    />
                    {errors.validUntil && (
                      <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.validUntil}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Usage Limits
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum Total Uses <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    min="1"
                    step="1"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-200 ${
                      errors.maxUses ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.maxUses && (
                    <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.maxUses}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Leave empty for unlimited uses</p>
                </div>

                <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <input
                    type="checkbox"
                    name="firstTimeUserOnly"
                    id="firstTimeUserOnly"
                    checked={formData.firstTimeUserOnly}
                    onChange={handleChange}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="firstTimeUserOnly" className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 cursor-pointer">
                    <Award size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
                    First Time Users Only
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Applicable Service <span className="text-red-500">*</span>
                </h2>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 flex justify-between items-center transition-all duration-200 text-sm sm:text-base ${
                      errors.applicableService ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={selectedService ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedService ? selectedService.name : 'Select a service'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform text-gray-400 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {selectedService && (
                    <div className="mt-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-pink-800">{selectedService.name}</p>
                          {selectedService.description && (
                            <p className="text-xs sm:text-sm text-pink-600 mt-0.5 line-clamp-2">{selectedService.description}</p>
                          )}
                        </div>
                        <span className="text-sm sm:text-base font-bold text-pink-800 whitespace-nowrap">₹{selectedService.price}</span>
                      </div>
                    </div>
                  )}

                  {isServiceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsServiceDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={serviceSearch}
                              onChange={(e) => setServiceSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                          {servicesLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader className="w-6 h-6 animate-spin text-pink-600" />
                            </div>
                          ) : filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                              <button
                                key={service._id}
                                type="button"
                                onClick={() => handleServiceSelect(service._id)}
                                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-pink-50 transition-colors ${
                                  formData.applicableService === service._id 
                                    ? 'bg-pink-100 text-pink-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
                                  <div className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium">{service.name}</span>
                                    {service.description && (
                                      <span className="text-xs text-gray-500 block mt-0.5 line-clamp-1">{service.description}</span>
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">₹{service.price}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-8 text-sm text-gray-500 text-center">
                              No services found
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {errors.applicableService && (
                  <p className="mt-1.5 text-xs sm:text-sm text-red-500">{errors.applicableService}</p>
                )}
                
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Select the specific service that this offer will apply to.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Preview
                </h2>
                <div className="bg-linear-to-r from-pink-50 to-purple-50 rounded-lg p-4 sm:p-5 border-2 border-pink-200">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
                    {formData.title || 'Offer Title'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">
                    {formData.description || 'Offer description will appear here'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border-2 border-pink-300">
                      {formData.offerType === 'percentage' ? (
                        <Percent size={12} className="sm:w-[14px] sm:h-[14px] text-pink-600" />
                      ) : (
                        <IndianRupee size={12} className="sm:w-[14px] sm:h-[14px] text-pink-600" />
                      )}
                      <span className="text-xs sm:text-sm font-bold text-pink-600">
                        {discountDisplay}
                      </span>
                    </div>
                    {formData.firstTimeUserOnly && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border-2 border-purple-300">
                        <Award size={12} className="sm:w-[14px] sm:h-[14px] text-purple-600" />
                        <span className="text-xs sm:text-sm font-bold text-purple-600">
                          First Time Only
                        </span>
                      </div>
                    )}
                    {formData.minAmount && formData.minAmount > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border-2 border-blue-300">
                        <IndianRupee size={12} className="sm:w-[14px] sm:h-[14px] text-blue-600" />
                        <span className="text-xs sm:text-sm font-bold text-blue-600">
                          Min. ₹{formData.minAmount}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedService && (
                    <div className="mt-3 pt-3 border-t border-pink-200">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold">Applied to:</span> {selectedService.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Valid from {formData.validFrom || 'start date'} until {formData.validUntil || 'end date'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/offers')}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerLoading}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {offerLoading ? (
                    <>
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Create Offer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferPage;