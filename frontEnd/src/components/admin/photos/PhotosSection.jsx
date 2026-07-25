

// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Image, Heart, Eye, Trash2, Plus, X, Loader, Upload, Search, RefreshCw } from 'lucide-react';
// import { z } from 'zod';
// import { deleteServiceMetaItem, addEventPhoto, fetchMeta } from '../../../redux/slices/metaSlice';
// import AdminLoading from '../../../common/AdminLoading';
// import EmptyState from '../../../common/EmptyState';
// import ErrorState from '../../../common/ErrorState';
// import toast from 'react-hot-toast';

// const MAX_FILE_SIZE = 5 * 1024 * 1024;
// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// const photoSchema = z.object({
//   title: z.string().min(3, 'Title min 3 characters').max(100, 'Too long'),
//   category: z.string().min(1, 'Category required'),
//   description: z.string().max(500).optional()
// });

// const PhotosSection = React.memo(() => {
//   const dispatch = useDispatch();
//   const { meta, loading, error, deleteLoading, updateLoading } = useSelector((state) => state.meta);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
//   const [newCategoryName, setNewCategoryName] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [selectedPhoto, setSelectedPhoto] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [newPhoto, setNewPhoto] = useState({ title: '', category: 'all', description: '' });

//   useEffect(() => {
//     if (!meta) {
//       dispatch(fetchMeta());
//     }
//   }, [dispatch, meta]);

//   const photos = useMemo(() => meta?.eventPhotos || [], [meta?.eventPhotos]);

//   const categories = useMemo(() => {
//     const uniqueCategories = new Set();
//     uniqueCategories.add('all');
//     photos.forEach(photo => {
//       if (photo.category && photo.category !== 'all') {
//         uniqueCategories.add(photo.category);
//       }
//     });
    
//     return Array.from(uniqueCategories).map(cat => ({
//       id: cat,
//       label: cat === 'all' ? 'All Photos' : cat.charAt(0).toUpperCase() + cat.slice(1)
//     }));
//   }, [photos]);

//   const filteredPhotos = useMemo(() => {
//     let filtered = selectedCategory === 'all' 
//       ? photos 
//       : photos.filter(p => p.category === selectedCategory);
    
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(photo =>
//         photo.title?.toLowerCase().includes(searchLower) ||
//         photo.category?.toLowerCase().includes(searchLower) ||
//         photo.description?.toLowerCase().includes(searchLower)
//       );
//     }
    
//     return filtered;
//   }, [photos, selectedCategory, searchTerm]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > MAX_FILE_SIZE) {
//         setErrors({ ...errors, image: 'File size must be less than 5MB' });
//         return;
//       }
//       if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
//         setErrors({ ...errors, image: 'Only JPG, JPEG, PNG, and WEBP formats are allowed' });
//         return;
//       }
//       setImageFile(file);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//       setErrors({ ...errors, image: null });
//     }
//   };

//   const removeImage = () => {
//     setImageFile(null);
//     setImagePreview(null);
//     if (document.getElementById('imageInput')) {
//       document.getElementById('imageInput').value = '';
//     }
//   };

//   const validateForm = useCallback(() => {
//     try { 
//       photoSchema.parse(newPhoto); 
//       if (!imageFile) {
//         setErrors({ ...errors, image: 'Please select an image' });
//         return false;
//       }
//       setErrors({}); 
//       return true; 
//     } catch (error) {
//       const formattedErrors = {};
//       error.errors.forEach(err => { 
//         formattedErrors[err.path[0]] = err.message; 
//       });
//       setErrors(formattedErrors);
//       return false;
//     }
//   }, [newPhoto, imageFile]);

//   const handleAddPhoto = useCallback(async () => {
//     if (!validateForm()) return;
    
//     setIsSubmitting(true);
    
//     const formData = new FormData();
//     formData.append('eventPhoto', imageFile);
//     formData.append('title', newPhoto.title);
//     formData.append('category', newPhoto.category);
//     if (newPhoto.description) {
//       formData.append('description', newPhoto.description);
//     }
    
//     await dispatch(addEventPhoto(formData));
    
//     setShowAddModal(false);
//     setNewPhoto({ title: '', category: 'all', description: '' });
//     setImageFile(null);
//     setImagePreview(null);
//     setShowNewCategoryInput(false);
//     setNewCategoryName('');
//     setErrors({});
//     setIsSubmitting(false);
//   }, [dispatch, newPhoto, imageFile, validateForm]);

//   const handleDeletePhoto = useCallback(async (photoId) => {
//     if (window.confirm('Delete this photo?')) {
//       await dispatch(deleteServiceMetaItem(photoId));
//       setSelectedPhoto(null);
//     }
//   }, [dispatch]);

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     const toastId = toast.loading('Refreshing photos...');
//     try {
//       await dispatch(fetchMeta()).unwrap();
//       toast.success('Photos refreshed successfully', { id: toastId });
//     } catch (error) {
//       toast.error('Failed to refresh photos', { id: toastId });
//     } finally {
//       setRefreshing(false);
//     }
//   }, [dispatch]);

//   const handleAddNewCategory = () => {
//     const trimmedName = newCategoryName.trim().toLowerCase();
//     if (trimmedName) {
//       const existingCategory = categories.find(cat => cat.id === trimmedName);
//       if (existingCategory && existingCategory.id !== 'all') {
//         setErrors({ ...errors, category: 'Category already exists!' });
//         return;
//       }
//       setNewPhoto({ ...newPhoto, category: trimmedName });
//       setShowNewCategoryInput(false);
//       setNewCategoryName('');
//       setErrors({ ...errors, category: null });
//     }
//   };

//   const handleCancelNewCategory = () => {
//     setShowNewCategoryInput(false);
//     setNewCategoryName('');
//     setErrors({ ...errors, category: null });
//   };

//   if (loading && !photos.length) {
//     return <AdminLoading text="Loading event photos" icon={Image} color="orange" />;
//   }

//   if (error && !photos.length) {
//     return (
//       <ErrorState 
//         error={error}
//         onRetry={handleRefresh}
//         title="Failed to Load Event Photos"
//         icon="alert"
//         showRetry={true}
//       />
//     );
//   }

//   return (
//     <div className='p-5 sm:p-0'>
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
//             <Image className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
//           </div>
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Event Photos</h2>
//             <p className="text-sm text-gray-500 mt-0.5">Manage your event gallery photos</p>
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
//           <button 
//             onClick={() => setShowAddModal(true)} 
//             className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
//           >
//             <Plus className="w-4 h-4" /> Add Photo
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search photos by title, category or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
//           />
//         </div>
//       </div>

//       <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
//         {categories.map(cat => (
//           <button 
//             key={cat.id} 
//             onClick={() => setSelectedCategory(cat.id)}
//             className={`px-4 py-2 rounded-lg whitespace-nowrap transition text-sm font-medium ${
//               selectedCategory === cat.id 
//                 ? 'bg-orange-600 text-white shadow-md' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             {cat.label} 
//             {cat.id !== 'all' && (
//               <span className="ml-2 text-xs opacity-75">
//                 ({photos.filter(p => p.category === cat.id).length})
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {searchTerm && (
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-sm text-gray-600">
//             Showing <span className="font-medium text-gray-900">{filteredPhotos.length}</span> of{' '}
//             <span className="font-medium text-gray-900">{selectedCategory === 'all' ? photos.length : photos.filter(p => p.category === selectedCategory).length}</span> photos
//           </div>
//           <button
//             onClick={() => setSearchTerm('')}
//             className="text-sm text-orange-600 hover:text-orange-700 font-medium"
//           >
//             Clear search
//           </button>
//         </div>
//       )}

//       {!loading && photos.length === 0 ? (
//         <EmptyState
//           title="No Photos Found"
//           message="Click the button above to add your first event photo."
//           icon="default"
//           showAction={false}
//         />
//       ) : filteredPhotos.length === 0 && searchTerm ? (
//         <EmptyState
//           title="No photos found"
//           message="Try adjusting your search criteria"
//           icon="search"
//           showAction={false}
//         />
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredPhotos.map(photo => (
//             <div 
//               key={photo._id} 
//               className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
//               onClick={() => setSelectedPhoto(photo)}
//             >
//               <div className="relative">
//                 <div className='h-48'>
//                   <img 
//                     src={photo.url} 
//                     alt={photo.title} 
//                     className="w-full h-full object-cover" 
//                     loading="lazy" 
//                   />
//                 </div>
//                 <div className="absolute top-2 right-2 flex gap-1">
//                   <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
//                     <Eye className="w-3 h-3" /> {photo.views || 0}
//                   </span>
//                   <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
//                     <Heart className="w-3 h-3" /> {photo.likes || 0}
//                   </span>
//                 </div>
//               </div>
//               <div className="p-3">
//                 <div className="flex justify-between items-start mb-1">
//                   <h3 className="font-medium text-gray-900 text-sm">{photo.title}</h3>
//                   <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
//                     {photo.category}
//                   </span>
//                 </div>
//                 {photo.description && (
//                   <p className="text-xs text-gray-500 mt-1 line-clamp-2">{photo.description}</p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedPhoto && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
//               <h3 className="text-base font-bold text-gray-900">Photo Details</h3>
//               <button
//                 onClick={() => setSelectedPhoto(null)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="p-4">
//               <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-4">
//                 <img 
//                   src={selectedPhoto.url} 
//                   alt={selectedPhoto.title}
//                   className="w-full h-full object-cover"
//                 />
//               </div>

//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <h4 className="font-semibold text-gray-900 text-base">{selectedPhoto.title}</h4>
//                   <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize inline-block mt-1">
//                     {selectedPhoto.category}
//                   </span>
//                 </div>
//                 <div className="flex gap-2">
//                   <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg flex items-center gap-1">
//                     <Eye className="w-3 h-3" /> {selectedPhoto.views || 0}
//                   </span>
//                   <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg flex items-center gap-1">
//                     <Heart className="w-3 h-3" /> {selectedPhoto.likes || 0}
//                   </span>
//                 </div>
//               </div>

//               {selectedPhoto.description && (
//                 <div className="mb-4">
//                   <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
//                   <p className="text-sm text-gray-700">{selectedPhoto.description}</p>
//                 </div>
//               )}

//               <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
//                 Added: {new Date(selectedPhoto.createdAt).toLocaleString()}
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
//               <button
//                 onClick={() => handleDeletePhoto(selectedPhoto._id)}
//                 disabled={deleteLoading}
//                 className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-1"
//               >
//                 {deleteLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
//                 Delete Photo
//               </button>
//               <button
//                 onClick={() => setSelectedPhoto(null)}
//                 className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
//               <h3 className="text-base font-bold text-gray-900">Add New Photo</h3>
//               <button onClick={() => {
//                 setShowAddModal(false);
//                 setShowNewCategoryInput(false);
//                 setNewCategoryName('');
//                 setImageFile(null);
//                 setImagePreview(null);
//                 setErrors({});
//               }} className="text-gray-400 hover:text-gray-600">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-4 space-y-4">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Photo Image *</label>
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
//                   {imagePreview ? (
//                     <div className="relative">
//                       <img 
//                         src={imagePreview} 
//                         alt="Preview" 
//                         className="h-40 w-auto object-cover rounded-lg"
//                       />
//                       <button
//                         type="button"
//                         onClick={removeImage}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="space-y-1 text-center">
//                       <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                       <div className="flex text-sm text-gray-600">
//                         <label
//                           htmlFor="imageInput"
//                           className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500"
//                         >
//                           <span>Upload a file</span>
//                           <input
//                             id="imageInput"
//                             name="imageInput"
//                             type="file"
//                             className="sr-only"
//                             accept="image/jpeg,image/jpg,image/png,image/webp"
//                             onChange={handleImageChange}
//                           />
//                         </label>
//                         <p className="pl-1">or drag and drop</p>
//                       </div>
//                       <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to 5MB</p>
//                     </div>
//                   )}
//                 </div>
//                 {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
//                 <input 
//                   type="text" 
//                   name="title" 
//                   value={newPhoto.title} 
//                   onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
//                   placeholder="Photo title"
//                   className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
//                     errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
//                   }`} 
//                 />
//                 {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
//                 {!showNewCategoryInput ? (
//                   <div className="flex gap-2">
//                     <select 
//                       name="category" 
//                       value={newPhoto.category} 
//                       onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
//                       className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 bg-white"
//                     >
//                       {categories.filter(c => c.id !== 'all').map(cat => (
//                         <option key={cat.id} value={cat.id}>{cat.label}</option>
//                       ))}
//                     </select>
//                     <button
//                       type="button"
//                       onClick={() => setShowNewCategoryInput(true)}
//                       className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm whitespace-nowrap"
//                     >
//                       + New
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={newCategoryName}
//                       onChange={(e) => setNewCategoryName(e.target.value)}
//                       placeholder="Enter new category"
//                       className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
//                       autoFocus
//                     />
//                     <button
//                       type="button"
//                       onClick={handleAddNewCategory}
//                       className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
//                     >
//                       Add
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleCancelNewCategory}
//                       className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//                 {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
//                 <textarea 
//                   name="description" 
//                   value={newPhoto.description} 
//                   onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
//                   rows="3"
//                   placeholder="Photo description (optional)"
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 resize-none bg-white"
//                 />
//               </div>
              
//               {errors.submit && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-sm text-red-600">{errors.submit}</p>
//                 </div>
//               )}
              
//               <div className="flex gap-3 pt-2">
//                 <button 
//                   onClick={handleAddPhoto} 
//                   disabled={isSubmitting || updateLoading} 
//                   className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
//                 >
//                   {isSubmitting ? 'Adding...' : 'Add Photo'}
//                 </button>
//                 <button 
//                   onClick={() => {
//                     setShowAddModal(false);
//                     setShowNewCategoryInput(false);
//                     setNewCategoryName('');
//                     setImageFile(null);
//                     setImagePreview(null);
//                     setErrors({});
//                   }} 
//                   className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });

// PhotosSection.displayName = 'PhotosSection';
// export default PhotosSection;


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, Heart, Eye, Trash2, Plus, X, Loader, Upload, Search, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { fetchEventPhotos, addEventPhoto, deleteEventPhoto, clearEventPhotosError } from '../../../redux/slices/eventPhotosSlice';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const photoSchema = z.object({
  title: z.string().min(3, 'Title min 3 characters').max(100, 'Too long'),
  category: z.string().min(1, 'Category required'),
  description: z.string().max(500).optional()
});

const PhotosSection = React.memo(() => {
  const dispatch = useDispatch();
  const { eventPhotos, loading, error } = useSelector((state) => state.eventPhotos);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', category: 'all', description: '' });

  useEffect(() => {
    dispatch(fetchEventPhotos());
  }, [dispatch]);

  const photos = useMemo(() => eventPhotos || [], [eventPhotos]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set();
    uniqueCategories.add('all');
    photos.forEach(photo => {
      if (photo.category && photo.category !== 'all') {
        uniqueCategories.add(photo.category);
      }
    });
    
    return Array.from(uniqueCategories).map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All Photos' : cat.charAt(0).toUpperCase() + cat.slice(1)
    }));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? photos 
      : photos.filter(p => p.category === selectedCategory);
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(photo =>
        photo.title?.toLowerCase().includes(searchLower) ||
        photo.category?.toLowerCase().includes(searchLower) ||
        photo.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [photos, selectedCategory, searchTerm]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrors({ ...errors, image: 'File size must be less than 5MB' });
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors({ ...errors, image: 'Only JPG, JPEG, PNG, and WEBP formats are allowed' });
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setErrors({ ...errors, image: null });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (document.getElementById('imageInput')) {
      document.getElementById('imageInput').value = '';
    }
  };

  const validateForm = useCallback(() => {
    try { 
      photoSchema.parse(newPhoto); 
      if (!imageFile) {
        setErrors({ ...errors, image: 'Please select an image' });
        return false;
      }
      setErrors({}); 
      return true; 
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach(err => { 
        formattedErrors[err.path[0]] = err.message; 
      });
      setErrors(formattedErrors);
      return false;
    }
  }, [newPhoto, imageFile]);

  const handleAddPhoto = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', newPhoto.title);
    formData.append('category', newPhoto.category);
    if (newPhoto.description) {
      formData.append('description', newPhoto.description);
    }
    
    try {
      const result = await dispatch(addEventPhoto(formData)).unwrap();
      toast.success('Photo added successfully!');
      setShowAddModal(false);
      setNewPhoto({ title: '', category: 'all', description: '' });
      setImageFile(null);
      setImagePreview(null);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setErrors({});
    } catch (error) {
      toast.error(error.message || 'Failed to add photo');
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, newPhoto, imageFile, validateForm]);

  const handleDeletePhoto = useCallback(async (photoId) => {
    if (window.confirm('Delete this photo?')) {
      try {
        await dispatch(deleteEventPhoto(photoId)).unwrap();
        toast.success('Photo deleted successfully');
        setSelectedPhoto(null);
      } catch (error) {
        toast.error(error.message || 'Failed to delete photo');
      }
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing photos...');
    try {
      await dispatch(fetchEventPhotos()).unwrap();
      toast.success('Photos refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh photos', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleAddNewCategory = () => {
    const trimmedName = newCategoryName.trim().toLowerCase();
    if (trimmedName) {
      const existingCategory = categories.find(cat => cat.id === trimmedName);
      if (existingCategory && existingCategory.id !== 'all') {
        setErrors({ ...errors, category: 'Category already exists!' });
        return;
      }
      setNewPhoto({ ...newPhoto, category: trimmedName });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setErrors({ ...errors, category: null });
    }
  };

  const handleCancelNewCategory = () => {
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setErrors({ ...errors, category: null });
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearEventPhotosError());
    };
  }, [dispatch]);

  if (loading && !photos.length) {
    return <AdminLoading text="Loading event photos" icon={Image} color="orange" />;
  }

  if (error && !photos.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Event Photos"
        icon="alert"
        showRetry={true}
      />
    );
  }

  return (
    <div className='p-5 sm:p-0'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
            <Image className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Event Photos</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your event gallery photos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search photos by title, category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition text-sm font-medium ${
              selectedCategory === cat.id 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label} 
            {cat.id !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({photos.filter(p => p.category === cat.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {searchTerm && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredPhotos.length}</span> of{' '}
            <span className="font-medium text-gray-900">{selectedCategory === 'all' ? photos.length : photos.filter(p => p.category === selectedCategory).length}</span> photos
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {!loading && photos.length === 0 ? (
        <EmptyState
          title="No Photos Found"
          message="Click the button above to add your first event photo."
          icon="default"
          showAction={false}
        />
      ) : filteredPhotos.length === 0 && searchTerm ? (
        <EmptyState
          title="No photos found"
          message="Try adjusting your search criteria"
          icon="search"
          showAction={false}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <div 
              key={photo._id} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative">
                <div className='h-48'>
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {photo.views || 0}
                  </span>
                  <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {photo.likes || 0}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{photo.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
                    {photo.category}
                  </span>
                </div>
                {photo.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{photo.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Photo Details</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-base">{selectedPhoto.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize inline-block mt-1">
                    {selectedPhoto.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {selectedPhoto.views || 0}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {selectedPhoto.likes || 0}
                  </span>
                </div>
              </div>

              {selectedPhoto.description && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedPhoto.description}</p>
                </div>
              )}

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Added: {new Date(selectedPhoto.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
              <button
                onClick={() => handleDeletePhoto(selectedPhoto._id)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-1"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Photo
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Add New Photo</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setShowNewCategoryInput(false);
                setNewCategoryName('');
                setImageFile(null);
                setImagePreview(null);
                setErrors({});
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo Image *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-40 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imageInput"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="imageInput"
                            name="imageInput"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
                {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={newPhoto.title} 
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  placeholder="Photo title"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 ${
                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`} 
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                {!showNewCategoryInput ? (
                  <div className="flex gap-2">
                    <select 
                      name="category" 
                      value={newPhoto.category} 
                      onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 bg-white"
                    >
                      {categories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm whitespace-nowrap"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelNewCategory}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  name="description" 
                  value={newPhoto.description} 
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  rows="3"
                  placeholder="Photo description (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 resize-none bg-white"
                />
              </div>
              
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAddPhoto} 
                  disabled={isSubmitting || loading} 
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
                >
                  {isSubmitting ? 'Adding...' : 'Add Photo'}
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                    setImageFile(null);
                    setImagePreview(null);
                    setErrors({});
                  }} 
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PhotosSection.displayName = 'PhotosSection';
export default PhotosSection;