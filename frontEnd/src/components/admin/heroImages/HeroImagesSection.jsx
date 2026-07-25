
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, RefreshCw, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import AdminLoading from '../../../common/AdminLoading';
import { fetchHeroImages, deleteHeroImage } from '../../../redux/slices/heroImagesSlice';
import toast from 'react-hot-toast';

const HeroImagesSection = memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { heroImages, loading, error } = useSelector((state) => state.heroImages);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchHeroImages());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    const toastId = toast.loading('Refreshing hero images...');
    try {
      await dispatch(fetchHeroImages()).unwrap();
      toast.success('Hero images refreshed successfully', { id: toastId });
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to refresh hero images';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, refreshing]);

  const handleAddHeroImage = () => {
    navigate('/admin/add-hero-image');
  };

  const handleEditHeroImage = (id) => {
    navigate(`/admin/edit-hero-image/${id}`);
  };

  const handleDeleteHeroImage = async (id, imageName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the hero image "${imageName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    const toastId = toast.loading('Deleting hero image...');
    try {
      await dispatch(deleteHeroImage(id)).unwrap();
      toast.success('Hero image deleted successfully', { id: toastId });
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to delete hero image';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && !heroImages.length) {
    return <AdminLoading text="Loading hero images" icon={ImageIcon} color="rose" />;
  }

  if (error) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error?.message || 'Failed to load hero images';
    
    return (
      <ErrorState 
        error={errorMessage}
        onRetry={handleRefresh}
        title="Failed to Load Hero Images"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!heroImages || heroImages.length === 0) {
    return (
      <EmptyState
        title="No Hero Images Found"
        message="You haven't added any hero images yet. Click the button below to add your first hero image."
        icon="image"
        showAction={true}
        actionText="Add Your First Hero Image"
        onAction={handleAddHeroImage}
      />
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-0">
      <div className="mb-6 flex justify-between flex-wrap gap-2 items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Images</h1>
          <p className="text-sm text-gray-500 mt-1">Manage landing page hero images</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleAddHeroImage}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Hero Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroImages.map((image) => (
          <div key={image._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative aspect-video bg-gray-100">
              <img
                src={image.url}
                alt={image.nameOfTheImage}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.png';
                }}
              />
              {deletingId === image._id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{image.nameOfTheImage}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditHeroImage(image._id)}
                    disabled={deletingId === image._id}
                    className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHeroImage(image._id, image.nameOfTheImage)}
                    disabled={deletingId === image._id}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HeroImagesSection.displayName = 'HeroImagesSection';
export default HeroImagesSection;