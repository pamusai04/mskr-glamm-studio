
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Sparkles, Eye, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import GallerySkeleton from '../../common/GallerySkeleton';
import ErrorState from '../../common/ErrorState';
import { fetchServiceMeta } from '../../redux/slices/serviceMetaSlice';

const Gallery = () => {
  const dispatch = useDispatch();
  const { eventPhotos, usersCount, bookingsCount, loading, error } = useSelector((state) => state.serviceMeta);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const galleryRef = useRef(null);
  const modalContentRef = useRef(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    dispatch(fetchServiceMeta());
  }, [dispatch]);

  useEffect(() => {
    if (!hasScrolled.current && galleryRef.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        try {
          const navbar = document.querySelector('nav');
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition = galleryRef.current?.getBoundingClientRect().top;
          
          if (elementPosition !== undefined) {
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
          }
        } catch (error) {
          console.warn('Scroll error:', error);
        }
      }, 100);
    }
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(["all"]);
    eventPhotos?.forEach(photo => {
      if (photo.category) uniqueCategories.add(photo.category);
    });
    return Array.from(uniqueCategories).map(category => ({
      id: category,
      name: category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)
    }));
  }, [eventPhotos]);

  // Use eventPhotos directly - no mapping needed
  const filteredImages = useMemo(() => {
    if (!eventPhotos || eventPhotos.length === 0) return [];
    if (activeCategory === "all") return eventPhotos;
    return eventPhotos.filter(photo => photo.category === activeCategory);
  }, [activeCategory, eventPhotos]);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const handleImageClick = useCallback((photo, index) => {
    setSelectedImage(photo);
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
    setSelectedIndex(null);
    document.body.style.overflow = 'auto';
  }, []);

  const handleNextImage = useCallback(() => {
    if (selectedIndex !== null && filteredImages.length > 0) {
      const nextIndex = (selectedIndex + 1) % filteredImages.length;
      setSelectedImage(filteredImages[nextIndex]);
      setSelectedIndex(nextIndex);
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedIndex, filteredImages]);

  const handlePrevImage = useCallback(() => {
    if (selectedIndex !== null && filteredImages.length > 0) {
      const prevIndex = (selectedIndex - 1 + filteredImages.length) % filteredImages.length;
      setSelectedImage(filteredImages[prevIndex]);
      setSelectedIndex(prevIndex);
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedIndex, filteredImages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'Escape') handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNextImage, handlePrevImage, handleCloseModal]);

  if (loading) {
    return <GallerySkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => dispatch(fetchServiceMeta())} />;
  }

  return (
    <>
      <div className="min-h-screen bg-white px-3 sm:px-4 lg:px-8 xl:px-24 pb-10 sm:pb-12 md:pb-16 overflow-x-hidden">
        <div className="fixed top-40 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob will-change-transform pointer-events-none -z-10"></div>
        <div className="fixed top-40 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 will-change-transform pointer-events-none -z-10"></div>
        <div className="fixed bottom-40 left-20 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 will-change-transform pointer-events-none -z-10"></div>

        <div ref={galleryRef} className="container mx-auto px-2 sm:px-3 md:px-4 relative z-10 scroll-mt-32">
          <div className="pt-8 sm:pt-10 md:pt-12 lg:pt-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-pink-500" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Our Gallery
                </h1>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-pink-500" />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
                Explore our stunning makeup transformations and get inspired for your special moment
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-5 sm:mt-6 md:mt-8">
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-500">{eventPhotos?.length || 0}+</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">Looks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-500">{usersCount || 0}+</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-500">{bookingsCount || 0}+</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">Bookings Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-500">{Math.max(0, categories.length - 1)}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">Categories</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10 sticky top-16 sm:top-20 z-20 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-md">
            <div className="w-full overflow-x-auto scrollbar-hide bg-linear-to-r from-pink-100 via-purple-100 to-blue-100 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl flex gap-1.5 sm:gap-2 justify-start md:justify-center md:flex-wrap md:overflow-visible">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`relative px-2.5 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full font-medium transition-all duration-300 hover:-translate-y-1 whitespace-nowrap text-[10px] sm:text-xs md:text-sm ${
                    activeCategory === category.id
                      ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 shadow-sm'
                  }`}
                >
                  <span className="inline-block">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 transition-all duration-300 mb-10">
              {filteredImages.map((photo, idx) => (
                <div 
                  key={photo._id} 
                  className="group relative transform transition-all duration-300 hover:-translate-y-1 hover:z-10"
                >
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                    onClick={() => handleImageClick(photo, idx)}
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-pink-100 to-purple-100">
                      {!photo.url ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                      ) : (
                        <img 
                          src={photo.url} 
                          alt={photo.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold text-pink-600 shadow-lg capitalize">
                        {photo.category || 'uncategorized'}
                      </div>
                    </div>

                    <div className="p-1.5 sm:p-2 md:p-2.5 bg-white flex flex-col gap-0.5 sm:gap-1">
                      <h3 className="font-semibold text-gray-800 text-[10px] sm:text-xs md:text-sm line-clamp-1">
                        {photo.title || 'Untitled'}
                      </h3>
                      <p className="text-gray-500 text-[9px] sm:text-[10px] md:text-xs line-clamp-1">
                        {photo.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-xs text-gray-400">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{photo.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎨</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 mb-1 sm:mb-2">No images found</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-[90%] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base truncate flex-1">
                {selectedImage.title}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div 
              ref={modalContentRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {filteredImages.length > 1 && (
                <div className="sticky top-0 bg-white pt-1 pb-2 z-10 flex justify-center gap-2 sm:gap-3">
                  <button
                    onClick={handlePrevImage}
                    className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-700"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Prev
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-700"
                  >
                    Next
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 flex justify-center items-center">
                {!selectedImage.url ? (
                  <div className="w-full h-48 sm:h-56 md:h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                  </div>
                ) : (
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.title}
                    className="w-full max-h-48 sm:max-h-56 md:max-h-80 object-contain rounded-lg"
                  />
                )}
              </div>
              
              <div>
                <span className="inline-block px-1.5 sm:px-2 md:px-2.5 py-0.5 bg-pink-100 text-pink-600 rounded-full text-[9px] sm:text-[10px] md:text-xs font-semibold capitalize">
                  {selectedImage.category || 'uncategorized'}
                </span>
              </div>
              
              <div>
                <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                  {selectedImage.description || 'No description available'}
                </p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs text-gray-500 pt-2 border-t border-gray-100">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{selectedImage.views || 0} views</span>
              </div>
            </div>
            
            <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-medium bg-pink-600 text-white rounded-lg sm:rounded-xl hover:bg-pink-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default React.memo(Gallery);
