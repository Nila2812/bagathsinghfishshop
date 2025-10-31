import React, { useState, useEffect } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddOffer = () => {
  const navigate = useNavigate();

  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/offers/products")
      .then(res => setProductOptions(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  const [formData, setFormData] = useState({
    title_en: "",
    title_ta: "",
    description_en: "",
    description_ta: "",
    productIds: "",
    costPrice: "",
    weightValue: "",
    weightUnit: "",
    discountPercent: "0", // ✅ Default discount
    sellingPrice: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const handleChange = (e, fieldType) => {
    const { name, value, checked } = e.target;

    if (fieldType === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };

        // ✅ When product is selected
        if (name === "productIds") {
          const selected = productOptions.find(p => p.value === value);
          if (selected) {
            updated.costPrice = selected.price;
            updated.weightUnit = selected.weightUnit;
            updated.weightValue = selected.weightValue;
            setSelectedProduct(selected);

            // ✅ Recalculate selling price if discount already exists
            const discount = parseFloat(prev.discountPercent || "0");
            const cost = parseFloat(selected.price);
            if (!isNaN(discount) && !isNaN(cost)) {
              updated.sellingPrice = Math.round(cost - (cost * discount / 100));
            }
          }
        }

        // ✅ When discount is changed
        if (name === "discountPercent" && selectedProduct) {
          const discount = parseFloat(value);
          const cost = parseFloat(selectedProduct.price);
          if (!isNaN(discount) && !isNaN(cost)) {
            updated.sellingPrice = Math.round(cost - (cost * discount / 100));
          }
        }

        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.productIds) {
      alert("Please select a product. If none listed, add products first.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/offers/add", formData);
      alert("Offer created successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error creating offer:", err);
      alert("Failed to create offer");
    }
  };

  const handleCancel = () => navigate(-1);

  const fields = [
    // ✅ First 4 fields untouched
    { name: "title_en", label: "Offer Title (English)", required: true },
    { name: "title_ta", label: "Offer Title (Tamil)", required: true },
    { name: "description_en", label: "Description (English)", fullWidth: true, required: true },
    { name: "description_ta", label: "Description (Tamil)", fullWidth: true, required: true },

    // ✅ Product selection and pricing flow
    {
      name: "productIds",
      label: "Select Product",
      type: "select",
      options: productOptions,
      fullWidth: true,
      required: true,
    },
    { name: "costPrice", label: "Cost Price (₹)", type: "number", required: true, readOnly: true },
    { name: "weightValue", label: "Weight Value", type: "text", required: true, readOnly: true },
    { name: "weightUnit", label: "Weight Unit", type: "text", required: true, readOnly: true },
    { name: "discountPercent", label: "Discount Percentage (%)", type: "number", required: true },
    { name: "sellingPrice", label: "Selling Price (₹)", type: "number", required: true, readOnly: true },

    // ✅ Remaining fields
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
    { name: "isActive", label: "Is Active", type: "checkbox" },
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
