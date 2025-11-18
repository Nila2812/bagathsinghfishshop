import React, { useState } from "react";
import FormSection from "../components/FormSection";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AddAdmin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    address: "",
    phone: "",
    whatsappNumber: "",
    
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateMobile = (name, value) => {
    const isValid = /^[6-9]\d{9}$/.test(value);
    setErrors((prev) => ({
      ...prev,
      [name]: isValid ? "" : "Invalid mobile number",
    }));
  };

  const validatePassword = (value) => {
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value);
    setErrors((prev) => ({
      ...prev,
      password: isValid ? "" : "Password must be at least 6 characters and include a number",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "phone" || name === "whatsappNumber") && /\D/.test(value)) return;
    if ((name === "phone" || name === "whatsappNumber") && value.length > 10) return;

    setFormData({ ...formData, [name]: value });

    if (name === "phone" || name === "whatsappNumber") validateMobile(name, value);
    if (name === "password") validatePassword(value);

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Passwords do not match" : "",
      }));
    }

    
  };

  const handleSubmit = async () => {
    const errorFields = Object.entries(errors)
  .filter(([_, msg]) => msg)
  .map(([field, msg]) => `${field}: ${msg}`);

if (errorFields.length > 0) {
  alert("Errors found:\n" + errorFields.join("\n"));
  return;
}


    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        shopName: formData.shopName.trim(),
        address: formData.address.trim(),
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
      };

      await axios.post("http://localhost:5000/api/admins", payload);
      alert("Admin added successfully!");
      navigate(-1);
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.errors) {
        setErrors((prev) => ({
          ...prev,
          ...err.response.data.errors,
        }));
      } else {
        console.error("Error adding admin:", err);
        alert("Failed to add admin");
      }
    }
  };

  const handleCancel = () => navigate(-1);

  const fields = [
    { name: "username", label: "Username", required: true, error: !!errors.username, helperText: errors.username },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      required: true,
      error: !!errors.password,
      helperText: errors.password,
      endAdornment: (
        <IconButton
          onClick={() => setShowPassword((prev) => !prev)}
          edge="end"
          size="small"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      ),
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
      error: !!errors.confirmPassword,
      helperText: errors.confirmPassword,
    },
    { name: "shopName", label: "Shop Name", required: true },
    { name: "address", label: "Address", required: true },
    {
      name: "phone",
      label: "Phone Number",
      required: true,
      error: !!errors.phone,
      helperText: errors.phone,
    },
    {
      name: "whatsappNumber",
      label: "WhatsApp Number",
      required: true,
      error: !!errors.whatsappNumber,
      helperText: errors.whatsappNumber,
    },
    
  ];

  return (
    <FormSection
      title="Add New Admin"
      fields={fields}
      values={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
);

};
export default AddAdmin;
