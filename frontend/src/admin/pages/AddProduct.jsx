import React, { useState } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Uncomment when backend is connected

const AddProduct = () => {
  const navigate = useNavigate();

  // Simulated category dropdown (replace with backend fetch later)
  const categoryOptions = [
    { value: "1", label: "Sea Fish" },
    { value: "2", label: "Fresh Water Fish" },
    { value: "3", label: "Shell Fish" },
  ];

  const [formData, setFormData] = useState({
    categoryId: "",
    name_en: "",
    name_ta: "",
    price: "",
    weightValue: "",
    weightUnit: "kg",
    stockQty: "",
    isAvailable: true,
    image: null,
  });

  const handleChange = (e, fieldType) => {
    const { name, value, checked, files } = e.target;
    if (fieldType === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (fieldType === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    console.log("New Product Added:", formData);
    // Example future API call:
    // const data = new FormData();
    // Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    // await axios.post("/api/products", data);
    navigate(-1);
  };

  const handleCancel = () => navigate(-1);

  const fields = [
    {
      name: "categoryId",
      label: "Select Category",
      type: "select",
      options: categoryOptions,
      fullWidth: true,
    },
    { name: "name_en", label: "Product Name (English)" },
    { name: "name_ta", label: "Product Name (Tamil)" },
    { name: "price", label: "Price (₹)", type: "number" },
    { name: "weightValue", label: "Weight Value", type: "number" },
    {
      name: "weightUnit",
      label: "Weight Unit",
      type: "select",
      options: [
        { value: "g", label: "g" },
        { value: "kg", label: "kg" },
        { value: "piece", label: "Piece" },
      ],
    },
    { name: "stockQty", label: "Stock Quantity", type: "number" },
    {
      name: "isAvailable",
      label: "Available",
      type: "checkbox",
    },
    {
      name: "image",
      label: "Product Image",
      type: "file",
      fullWidth: true,
    },
  ];

  return (
    <FormSection
      title="Add New Product"
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default AddProduct;
