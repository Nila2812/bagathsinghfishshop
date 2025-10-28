import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment later for backend connection

const ViewAdmins = () => {
  const [admins, setAdmins] = useState([]);

  // Table columns (only visible fields for admin view)
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "username", headerName: "Username", width: 180 },
    { field: "password", headerName: "Password", width: 180 },
    { field: "shopName", headerName: "Shop Name", width: 200 },
    { field: "address", headerName: "Address", width: 250 },
    {
      field: "mapLink",
      headerName: "Map Link",
      width: 200,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1976d2", textDecoration: "underline" }}
        >
          View Map
        </a>
      ),
    },
    { field: "phone", headerName: "Phone Number", width: 150 },
    { field: "whatsappNumber", headerName: "WhatsApp Number", width: 160 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Sample admin data
  const sampleAdmins = [
    {
      id: "1",
      username: "admin_main",
      password: "********",
      shopName: "Bagath Singh Fish Shop",
      address: "12, Marina Street, Chennai",
      mapLink: "https://maps.google.com/?q=13.0827,80.2707",
      phone: "9876543210",
      whatsappNumber: "9876543210",
      createdAt: "2025-08-10T12:00:00Z",
    },
    {
      id: "2",
      username: "admin2",
      password: "********",
      shopName: "Fresh Catch Store",
      address: "22, Lake View Road, Madurai",
      mapLink: "https://maps.google.com/?q=9.9252,78.1198",
      phone: "9123456789",
      whatsappNumber: "9123456789",
      createdAt: "2025-09-02T09:30:00Z",
    },
    {
      id: "3",
      username: "admin_backup",
      password: "********",
      shopName: "Coastal Fish Point",
      address: "MG Road, Coimbatore",
      mapLink: "https://maps.google.com/?q=11.0168,76.9558",
      phone: "9000011122",
      whatsappNumber: "9000011122",
      createdAt: "2025-10-01T11:45:00Z",
    },
  ];

  useEffect(() => {
    // Future backend call:
    // axios.get("/api/admins").then(res => setAdmins(res.data));
    setAdmins(sampleAdmins);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit admin ID:", id);
    // Future: Open inline edit or modal for save/cancel
  };

  const handleDelete = (id) => {
    console.log("Delete admin ID:", id);
    // Future: axios.delete(`/api/admins/${id}`)
  };

  return (
    <Box sx={{ ml: "20%", p: 3 }}>
      <DataTable
        title="Admin Details"
        columns={columns}
        rows={admins}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewAdmins;
