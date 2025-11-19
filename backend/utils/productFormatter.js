// utils/productFormatter.js
export const formatProduct = (p) => {
  const imageData = p.image?.data
    ? Buffer.from(p.image.data).toString("base64")
    : null;

  return {
    _id: p._id,
    name_en: p.name_en,
    name_ta: p.name_ta,
    price: p.price,
    weightValue: p.weightValue,
    weightUnit: p.weightUnit,
    stockQty: p.stockQty,
    isAvailable: p.isAvailable,
    category: p.categoryId?.name_en || "Uncategorized",
    image: imageData
      ? {
          data: imageData,
          contentType: p.image.contentType,
        }
      : null,
  };
};
