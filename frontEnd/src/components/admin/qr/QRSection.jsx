import React, { memo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react';
import { getQR, addOrUpdateQR, clearQRState } from '../../../redux/slices/qrSlice';
import toast from 'react-hot-toast';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import AdminLoading from '../../../common/AdminLoading';

const QRSection = memo(() => {
  const dispatch = useDispatch();
  const { qrData, isLoading, isError, errorMessage, isSuccess } = useSelector((state) => state.qr);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const toastId = toast.loading('Refreshing QR code...');
    try {
      await dispatch(getQR()).unwrap();
      toast.success('QR code refreshed successfully', { id: toastId });
    } catch (error) {
      // Check if error is 404 (not found) - this is expected when no QR exists
      if (error?.status === 404 || error?.message?.includes('not found')) {
        toast.success('No QR code found. Upload one to get started.', { id: toastId });
      } else {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to refresh QR code';
        toast.error(errorMessage, { id: toastId });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a QR code image');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading QR code...');

    try {
      const formData = new FormData();
      formData.append('qrImage', selectedFile);

      const result = await dispatch(addOrUpdateQR(formData)).unwrap();
      
      if (result) {
        toast.success('QR code uploaded successfully', { id: toastId });
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        dispatch(clearQRState());
        // Refresh to get the new QR code
        await dispatch(getQR());
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to upload QR code';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // Check if QR data exists - handle 404 case gracefully
  const hasQRData = qrData && qrData._id;

  if (isLoading && !hasQRData) {
    return <AdminLoading text="Loading QR code" icon={ImageIcon} color="violet" />;
  }

  if (isError && !hasQRData) {
    // Check if error is 404 (not found) - show empty state instead of error
    if (errorMessage?.includes('not found') || errorMessage?.status === 404) {
      return (
        <EmptyState
          title="No QR Code Found"
          message="You haven't uploaded a QR code yet. Upload one now."
          icon="image"
          showAction={false}
        />
      );
    }
    
    const errorMsg = typeof errorMessage === 'string' 
      ? errorMessage 
      : errorMessage?.message || 'Failed to load QR code';
    
    return (
      <ErrorState 
        error={errorMsg}
        onRetry={handleRefresh}
        title="Failed to Load QR Code"
        icon="alert"
        showRetry={true}
      />
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-0">
      <div className="mb-6 flex justify-between flex-wrap gap-2 items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your QR code image</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isUploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {!hasQRData ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No QR Code Found</h3>
            <p className="text-gray-500 mb-6">Upload a QR code image to get started</p>
            
            {/* Upload section for empty state */}
            <div className="max-w-md mx-auto">
              {!preview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-violet-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload QR code image</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload QR Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current QR Code Display */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Current QR Code</h2>
              <p className="text-sm text-gray-500 mt-1">This QR code is currently active</p>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-64 h-64 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={qrData.qrImage}
                  alt="QR Code"
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Uploaded: {new Date(qrData.updatedAt).toLocaleString()}</p>
                <p>ID: {qrData._id}</p>
              </div>
            </div>
          </div>

          {/* Upload New QR Code */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Update QR Code</h2>
              <p className="text-sm text-gray-500 mt-1">Upload a new QR code image (will replace existing)</p>
            </div>
            <div className="p-6">
              {!preview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-violet-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload new QR code image</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Update QR Code
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

QRSection.displayName = 'QRSection';
export default QRSection;