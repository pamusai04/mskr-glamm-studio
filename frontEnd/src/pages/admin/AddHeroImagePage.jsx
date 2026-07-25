import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addHeroImage } from '../../redux/slices/heroImagesSlice';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const AddHeroImagePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [nameOfTheImage, setNameOfTheImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }
    
    if (!nameOfTheImage.trim()) {
      toast.error('Please enter a name for the image');
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('nameOfTheImage', nameOfTheImage);
    formData.append('image', imageFile);
    
    try {
      await dispatch(addHeroImage(formData)).unwrap();
      toast.success('Hero image added successfully');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Failed to add hero image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-1.5 sm:gap-2 text-rose-500 hover:text-rose-600 transition-colors text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Admin Panel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-5 sm:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Add New Hero Image</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Add a new hero image for your landing page</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Name of the Image *
                </label>
                <input
                  type="text"
                  value={nameOfTheImage}
                  onChange={(e) => setNameOfTheImage(e.target.value)}
                  placeholder="Enter image name"
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Image *
                </label>
                <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-rose-300 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
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
                      <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm text-gray-600">
                        <label
                          htmlFor="imageInput"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-rose-500 hover:text-rose-600 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
                          <input
                            id="imageInput"
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
                  className="flex-1 px-5 sm:px-7 py-2.5 sm:py-3 bg-rose-500 text-white text-sm sm:text-base rounded-lg hover:bg-rose-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Hero Image'
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

export default AddHeroImagePage;