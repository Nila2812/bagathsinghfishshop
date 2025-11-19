import React, { useState, useEffect } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/category")
      .then(res => {
        const all = res.data;
        const parentIds = new Set(all.map(cat => cat.parentCategory?._id).filter(Boolean));
        const filtered = all.filter(cat => {
          const isSubCategory = !!cat.parentCategory;
          const isLonelyParent = !cat.parentCategory && !parentIds.has(cat._id);
          return isSubCategory || isLonelyParent;
        });
        const options = filtered.map(cat => ({
          value: cat._id,
          label: cat.name_en
        }));
        setCategoryOptions(options);
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  const [formData, setFormData] = useState({
    categoryId: "",
    name_en: "",
    name_ta: "",
    price: "",
    weightValue: "",
    weightUnit: "",
    baseUnit: "1kg",
    stockQty: "",
    isAvailable: true,
    image: null,
  });

  const handleChange = (e, fieldType) => {
    const { name, value, checked, files } = e.target;
    if (fieldType === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (fieldType === "file") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("categoryId", formData.categoryId);
    data.append("name_en", formData.name_en);
    data.append("name_ta", formData.name_ta);
    data.append("price", formData.price);
    data.append("weightValue", formData.weightValue);
    data.append("weightUnit", formData.weightUnit);
    data.append("stockQty", formData.stockQty);
    data.append("isAvailable", formData.isAvailable);
    data.append("baseUnit", formData.baseUnit);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.post("http://localhost:5000/api/products/add", data);
      alert("Product added successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product");
    }
  };

  const handleCancel = () => navigate(-1);

  const getBaseUnitOptions = (unit) => {
    return unit === "piece"
      ? [
          { value: "piece", label: "Piece" },
        ]
      : [
          { value: "250g", label: "250g" },
          { value: "500g", label: "500g" },
          { value: "1kg", label: "1kg" },
        ];
  };

  const fields = [
    {
      name: "categoryId",
      label: "Select Category",
      type: "select",
      options: categoryOptions,
      fullWidth: true,
      required: true
    },
    { name: "name_en", label: "Product Name (English)", required: true },
    { name: "name_ta", label: "Product Name (Tamil)", required: true },
    { name: "price", label: "Price (₹)", type: "number", required: true },
    { name: "weightValue", label: "Weight Value", type: "number", required: true },
    {
      name: "weightUnit",
      label: "Weight Unit",
      type: "select",
      options: [
        { value: "g", label: "g" },
        { value: "kg", label: "kg" },
        { value: "piece", label: "Piece" },
      ],
      required: true
    },
    {
      name: "baseUnit",
      label: "Base Unit",
      type: "select",
      options: getBaseUnitOptions(formData.weightUnit),
      required: true
    },
    { name: "stockQty", label: "Stock Quantity", type: "number", required: true },
    { name: "isAvailable", label: "Is Available", type: "checkbox" },
    {
      name: "image",
      label: "Product Image",
      type: "file",
      fullWidth: true,
      required: true
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