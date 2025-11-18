import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import axios from "axios";
import { Box, Typography } from "@mui/material"; // ✅ Added Typography import

const ViewAdmins = () => {
  const [admins, setAdmins] = useState([]);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "username", headerName: "Username", width: 180 },
    { field: "password", headerName: "Password", width: 180 },
    { field: "shopName", headerName: "Shop Name", width: 200 },
    { field: "address", headerName: "Address", width: 250 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "whatsappNumber", headerName: "WhatsApp", width: 150 },
    
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admins")
      .then((res) => {
        const formatted = res.data.map((admin, index) => ({
          id: index + 1, // Sequential ID for display
          _id: admin._id, // Real ID for actions
          username: admin.username,
          password: "********", // Masked for safety
          shopName: admin.shopName,
          address: admin.address,
          phone: admin.phone,
          whatsappNumber: admin.whatsappNumber,
         
          createdAt: admin.createdAt,
        }));
        setAdmins(formatted);
      })
      .catch((err) => console.error("Admin fetch error:", err));
  }, []);

  const handleEdit = (_id) => {
    console.log("Edit admin ID:", _id);
    // Future: Open inline edit or modal for save/cancel
  };

  const handleDelete = async (_id) => {
  try {
    await axios.delete(`http://localhost:5000/api/admins/${_id}`);
    setAdmins((prev) => prev.filter((admin) => admin._id !== _id));
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete admin");
  }
};


  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "capitalize",
          }}
        >
          Admin Details
        </Typography>

        <DataTable
          title=""
          columns={columns}
          rows={admins}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </Box>
  );
};

export default ViewAdmins;
