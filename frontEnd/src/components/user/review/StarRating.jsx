import React, { memo, useMemo } from 'react';
import { Star } from 'lucide-react';

const StarRating = memo(({ rating, size = 18, className = '' }) => {
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  
  return (
    <div className={`flex gap-1 ${className}`}>
      {stars.map(star => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
});

StarRating.displayName = 'StarRating';

export default StarRating;