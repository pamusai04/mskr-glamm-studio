export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'Not specified';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min${mins !== 1 ? 's' : ''}`;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
};

export const calculateDiscountPercentage = (originalPrice, price) => {
  if (!originalPrice || !price || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const hasDiscount = (originalPrice, price) => {
  return originalPrice && price && originalPrice > price;
};

export const formatPrice = (price) => {
  return price?.toLocaleString('en-IN') || '0';
};