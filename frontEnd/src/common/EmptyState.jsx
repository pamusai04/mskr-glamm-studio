import React from 'react';
import { Package, ShoppingBag, Search, ShoppingCart, Gift, Calendar, CircleUserRound } from 'lucide-react';

const EmptyState = ({ 
  title = "No Services Found",
  message = "No services are available at the moment.",
  icon = "default",
  showAction = false,
  actionText = "Browse Categories",
  onAction,
  className = ""
}) => {
  
  const getIcon = () => {
    switch(icon) {
      case 'search':
        return <Search className="w-12 h-12 text-gray-400" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-12 h-12 text-gray-400" />;
      case 'package':
        return <Package className="w-12 h-12 text-gray-400" />;
      case 'Gift':
        return <Gift className="w-12 h-12 text-gray-400" />;
      case 'Calendar':
        return <Calendar className="w-12 h-12 text-gray-400" />;
      case 'CircleUserRound':
        return <CircleUserRound className="w-12 h-12 text-gray-400" />;
      default:
        return <ShoppingBag className="w-12 h-12 text-gray-400" />;
    }
  };
  

  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {message}
          </p>
          {showAction && onAction && (
            <button
              onClick={onAction}
              className="px-6 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;