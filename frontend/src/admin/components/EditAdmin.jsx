import React, { useState, useEffect } from "react";
import FormSection from "../components/FormSection";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const EditAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    username: "",
    shopName: "",
    address: "",
    phone: "",
    whatsappNumber: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Fetch admin details (excluding password)
    axios
      .get(`http://localhost:5000/api/admins/${id}`)
      .then((res) => {
        setFormData({
          username: res.data.username,
          shopName: res.data.shopName,
          address: res.data.address,
          phone: res.data.phone,
          whatsappNumber: res.data.whatsappNumber,
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((err) => {
        console.error("Failed to fetch admin:", err);
        alert("Failed to load admin details");
        navigate(-1);
      });
  }, [id, navigate]);

  const validateMobile = (name, value) => {
    const isValid = /^[6-9]\d{9}$/.test(value);
    setErrors((prev) => ({
      ...prev,
      [name]: isValid ? "" : "Invalid mobile number",
    }));
  };

  const validateNewPassword = (value) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
      return;
    }
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value);
    setErrors((prev) => ({
      ...prev,
      newPassword: isValid ? "" : "Password must be at least 6 characters and include a number",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "phone" || name === "whatsappNumber") && /\D/.test(value)) return;
    if ((name === "phone" || name === "whatsappNumber") && value.length > 10) return;

    setFormData({ ...formData, [name]: value });

    if (name === "phone" || name === "whatsappNumber") validateMobile(name, value);
    
    if (name === "newPassword") {
      validateNewPassword(value);
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }

    if (name === "confirmPassword") {
      if (value && formData.newPassword !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const handleVerifyPassword = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/admins/verify-password", {
        adminId: id,
        password: verifyPassword,
      });

      if (response.data.verified) {
        setIsVerified(true);
        alert("Password verified! You can now edit the details.");
      }
    } catch (err) {
      alert("Incorrect password. Please try again.");
      setVerifyPassword("");
    }
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      alert("Please verify your password first to save changes.");
      return;
    }

    // Check for validation errors
    const errorFields = Object.entries(errors)
      .filter(([_, msg]) => msg)
      .map(([field, msg]) => `${field}: ${msg}`);

    if (errorFields.length > 0) {
      alert("Errors found:\n" + errorFields.join("\n"));
      return;
    }

    // Check if both password fields are filled or both are empty
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.newPassword) {
        alert("Please enter new password");
        return;
      }
      if (!formData.confirmPassword) {
        alert("Please confirm your new password");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        alert("New passwords do not match");
        return;
      }
    }

    try {
      // Update admin details
      const payload = {
        username: formData.username.trim(),
        shopName: formData.shopName.trim(),
        address: formData.address.trim(),
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
      };

      await axios.put(`http://localhost:5000/api/admins/${id}`, payload);

      // If password fields are filled, update password
      if (formData.newPassword && formData.confirmPassword) {
        await axios.put(`http://localhost:5000/api/admins/${id}/update-password`, {
          newPassword: formData.newPassword,
        });
        alert("Admin details and password updated successfully!");
      } else {
        alert("Admin details updated successfully!");
      }

      navigate(-1);
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.errors) {
        setErrors((prev) => ({
          ...prev,
          ...err.response.data.errors,
        }));
      } else {
        console.error("Error updating admin:", err);
        alert("Failed to update admin");
      }
    }
  };

  const handleCancel = () => navigate(-1);

  const fields = [
    { 
      name: "username", 
      label: "Username", 
      required: true, 
      error: !!errors.username, 
      helperText: errors.username,
      readOnly: !isVerified 
    },
    { 
      name: "shopName", 
      label: "Shop Name", 
      required: true,
      readOnly: !isVerified 
    },
    { 
      name: "address", 
      label: "Address", 
      required: true,
      readOnly: !isVerified 
    },
    {
      name: "phone",
      label: "Phone Number",
      required: true,
      error: !!errors.phone,
      helperText: errors.phone,
      readOnly: !isVerified
    },
    {
      name: "whatsappNumber",
      label: "WhatsApp Number",
      required: true,
      error: !!errors.whatsappNumber,
      helperText: errors.whatsappNumber,
      readOnly: !isVerified
    },
    {
      name: "newPassword",
      label: "New Password (Optional)",
      type: showPasswords.new ? "text" : "password",
      error: !!errors.newPassword,
      helperText: errors.newPassword || "Leave empty if you don't want to change password",
      readOnly: !isVerified,
      endAdornment: (
        <IconButton
          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
          edge="end"
          size="small"
          disabled={!isVerified}
        >
          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      ),
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      type: showPasswords.confirm ? "text" : "password",
      error: !!errors.confirmPassword,
      helperText: errors.confirmPassword,
      readOnly: !isVerified,
      endAdornment: (
        <IconButton
          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
          edge="end"
          size="small"
          disabled={!isVerified}
        >
          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {!isVerified && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <TextField
            fullWidth
            type={showVerifyPassword ? "text" : "password"}
            label="Enter Password to Edit"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowVerifyPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showVerifyPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleVerifyPassword}
            fullWidth
          >
            Verify Password
          </Button>
        </Box>
      )}

      <FormSection
        title="Edit Admin"
        fields={fields}
        values={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default EditAdmin;