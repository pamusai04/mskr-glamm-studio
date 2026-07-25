const validateReviewData = (data) => {
  const { serviceName, serviceImage, rating } = data;

  if (!serviceName || serviceName.trim().length === 0) {
    return "Service name is required";
  }

  if (!rating) {
    return "Rating is required";
  }

  if (rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }

  return null;
};

module.exports = validateReviewData;