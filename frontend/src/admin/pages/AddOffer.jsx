import React, { useState } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Uncomment later when connecting backend

const AddOffer = () => {
  const navigate = useNavigate();

  // Simulated product list for dropdown (replace with backend fetch later)
  const productOptions = [
    { value: "1", label: "Rohu Fish" },
    { value: "2", label: "Catla Fish" },
    { value: "3", label: "Sea Bass" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    title_en: "",
    title_ta: "",
    description_en: "",
    description_ta: "",
    discountPercent: "",
    productIds: [],
    costPrice: "",
    sellingPrice: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  // Handle input change
  const handleChange = (e, fieldType) => {
    const { name, value, checked } = e.target;
    if (fieldType === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (fieldType === "multiselect") {
      const selectedValues = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData({ ...formData, [name]: selectedValues });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    console.log("Offer created:", formData);
    // Future backend call example:
    // await axios.post("/api/offers", formData);
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Fields configuration for FormSection
  const fields = [
    { name: "title_en", label: "Offer Title (English)" },
    { name: "title_ta", label: "Offer Title (Tamil)" },
    { name: "description_en", label: "Description (English)", fullWidth: true },
    { name: "description_ta", label: "Description (Tamil)", fullWidth: true },
    {
      name: "discountPercent",
      label: "Discount Percentage (%)",
      type: "number",
    },
    { name: "costPrice", label: "Cost Price (₹)", type: "number" },
    { name: " sellingPrice", label: "Selling Price (₹)", type: "number" },
    {
      name: "productIds",
      label: "Select Products (Apply Offer To)",
      type: "multiselect",
      options: productOptions,
      fullWidth: true,
    },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
  ];

  return (
    <FormSection
      title="Add New Offer"
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default AddOffer;
