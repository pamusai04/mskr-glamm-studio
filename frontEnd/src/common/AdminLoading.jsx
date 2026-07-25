import { memo } from 'react';

const AdminLoading = memo(({ text, icon: Icon, color }) => {
  const colorClasses = {
    pink: {
      border: 'border-pink-100',
      borderTop: 'border-t-pink-500',
      text: 'text-pink-500',
    },
    amber: {
      border: 'border-amber-100',
      borderTop: 'border-t-amber-500',
      text: 'text-amber-500',
    },
    emerald: {
      border: 'border-emerald-100',
      borderTop: 'border-t-emerald-600',
      text: 'text-emerald-600',
    },
    cyan: {
      border: 'border-cyan-100',
      borderTop: 'border-t-cyan-600',
      text: 'text-cyan-600',
    },
    teal: {
      border: 'border-teal-100',
      borderTop: 'border-t-teal-600',
      text: 'text-teal-600',
    },
    orange: {
      border: 'border-orange-100',
      borderTop: 'border-t-orange-600',
      text: 'text-orange-600',
    },
    purple: {
      border: 'border-purple-100',
      borderTop: 'border-t-purple-600',
      text: 'text-purple-600',
    },
    blue: {
      border: 'border-blue-100',
      borderTop: 'border-t-blue-600',
      text: 'text-blue-600',
    },
    red: {
      border: 'border-red-100',
      borderTop: 'border-t-red-600',
      text: 'text-red-600'
    }
    
  };

  const selectedColor = colorClasses[color] || colorClasses.pink;

  return (
    <div className="flex items-center flex-col justify-center min-h-80">
      <div className="relative">
        <div className={`w-12 h-12 border-4 ${selectedColor.border} ${selectedColor.borderTop} rounded-full animate-spin`}></div>
        {Icon && (
          <Icon className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 ${selectedColor.text} animate-pulse`} />
        )}
      </div>
      <div className='flex items-center gap-2 mt-3'>
        {text && <p className="text-gray-600">{text}</p>}
        <span className={`loading loading-dots loading-md ${selectedColor.text}`}></span>
      </div>
    </div>
  );
});

export default AdminLoading;