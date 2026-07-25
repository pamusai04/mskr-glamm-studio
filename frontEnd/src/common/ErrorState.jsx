import React from 'react';
import { SearchX, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

const ErrorState = ({ 
  error, 
  onRetry, 
  title = "Failed to Load Services",
  icon = "default",
  showRetry = true,
  className = ""
}) => {
  
  const getIcon = () => {
    switch(icon) {
      case 'network':
        return <WifiOff className="w-12 h-12 text-red-500" />;
      case 'alert':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <SearchX className="w-12 h-12 text-red-500" />;
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {error || "Unable to fetch data. Please check your connection and try again."}
          </p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;