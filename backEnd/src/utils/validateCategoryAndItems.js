const validateCategoryAndItems = (data) => {
  const { title, type, category, name, desc, price, serviceImage, categoryId, duration } = data;

  if (!name || name.trim().length < 2) {
    throw new Error("Service name must be at least 2 characters");
  }

  if (!desc || desc.trim().length < 5) {
    throw new Error("Description must be at least 5 characters");
  }

  if (!duration) {
    throw new Error("Duration is required");
  }

  let durationValue = duration;
  if (typeof durationValue === "string") {
    durationValue = parseInt(durationValue);
  }
  if (isNaN(durationValue) || durationValue < 5 || durationValue > 240) {
    throw new Error("Duration must be between 5 and 240 minutes");
  }

  if (price !== undefined) {
    let priceValue = price;
    if (typeof priceValue === "string") {
      priceValue = parseFloat(priceValue);
    }
    if (isNaN(priceValue) || priceValue < 0) {
      throw new Error("Price must be a positive number");
    }
  }

  if (serviceImage !== undefined) {
    if (typeof serviceImage !== "string" || (serviceImage && !serviceImage.startsWith("http"))) {
      throw new Error("Service image must be a valid URL");
    }
  }

  if (!categoryId) {
    if (!title || title.trim().length < 2) {
      throw new Error("Category title must be at least 2 characters");
    }

    if (!type || !["makeup", "beauty"].includes(type)) {
      throw new Error("Category type must be either 'makeup' or 'beauty'");
    }

    if (!category || category.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters");
    }
  }

  return true;
};

module.exports = validateCategoryAndItems;