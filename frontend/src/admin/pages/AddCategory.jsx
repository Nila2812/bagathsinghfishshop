import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AddCategory = () => {
  const navigate = useNavigate();

  const [parentCategories, setParentCategories] = useState([
    { value: "", label: "None (Main Category)" }
  ]);

  useEffect(() => {
  axios.get("http://localhost:5000/api/category")
    .then(res => {
      const topLevel = res.data.filter(cat => !cat.parentCategory); // ✅ Only categories with no parent
      const options = topLevel.map(cat => ({
        value: cat._id,
        label: cat.name_en
      }));
      setParentCategories([{ value: "", label: "None (Main Category)" }, ...options]);
    })
    .catch(err => console.error("Failed to fetch parent categories:", err));
}, []);


  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    parentCategory: "",
    description_en: "",
    description_ta: "",
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

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await axios.post("http://localhost:5000/api/category/add", data);
      alert("Category added successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const fields = [
    { name: "name_en", label: "Category Name (English)", required: true },
    { name: "name_ta", label: "Category Name (Tamil)", required: true },
    {
      name: "parentCategory",
      label: "SubCategory OF",
      type: "select",
      options: parentCategories,
    },
    { name: "description_en", label: "Description (English)", fullWidth: true },
    { name: "description_ta", label: "Description (Tamil)", fullWidth: true },
    { name: "image", label: "Upload Image", type: "file", fullWidth: true, required: true },
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
