// utils/errorHandler.js
export const handleApiError = (error, customMessages = {}) => {
  if (error?.response?.status === 429) {
    const data = error.response.data;
    const retryAfter = data.retryAfter || 60;
    const minutes = Math.ceil(retryAfter / 60);
    const message = data.message || `Too many requests. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    
    return {
      message,
      retryAfter,
      isRateLimit: true,
      displayMessage: message
    };
  }
  
  // Handle other errors
  const message = error?.response?.data?.message || 
                  error?.message || 
                  customMessages.default || 
                  'Something went wrong. Please try again.';
  
  return {
    message,
    isRateLimit: false,
    displayMessage: message
  };
};