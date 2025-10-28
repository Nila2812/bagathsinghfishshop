import React, { useState } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Uncomment later when connecting backend

const AddCategory = () => {
  const navigate = useNavigate();

  // Sample list of existing categories (for parent dropdown)
  const parentCategories = [
    { value: "", label: "None (Main Category)" },
    { value: "1", label: "Sea Fish" },
    { value: "2", label: "Freshwater Fish" },
  ];

  // Form data state
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    parentCategory: "",
    description_en: "",
    description_ta: "",
    image: null,
  });

  // Handle text / select / file change
  const handleChange = (e, fileField) => {
    if (fileField === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit handler
  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Future backend call:
    // const data = new FormData();
    // Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    // await axios.post("/api/categories", data);
    navigate(-1); // go back after submit
  };

  // Cancel handler
  const handleCancel = () => {
    navigate(-1);
  };

  // Fields config for FormSection
  const fields = [
    { name: "name_en", label: "Category Name (English)" },
    { name: "name_ta", label: "Category Name (Tamil)" },
    {
      name: "parentCategory",
      label: "SubCategory OF",
      type: "select",
      options: parentCategories,
    },
    { name: "description_en", label: "Description (English)", fullWidth: true },
    { name: "description_ta", label: "Description (Tamil)", fullWidth: true },
    { name: "image", label: "Upload Image", type: "file", fullWidth: true },
  ];

  return (
    <FormSection
      title="Add New Category"
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default AddCategory;
