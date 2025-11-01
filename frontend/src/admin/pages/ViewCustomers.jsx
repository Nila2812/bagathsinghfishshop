import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box, Typography } from "@mui/material";
// import axios from "axios"; // Uncomment when backend is ready

const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "phone", headerName: "Phone Number", width: 150 },
    {
      field: "address",
      headerName: "Address",
      width: 250,
    },
    {
      field: "mapLink",
      headerName: "Map Link",
      width: 220,
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
    {
      field: "createdAt",
      headerName: "Joined On",
      width: 180,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Temporary dummy data (replace later with backend data)
  const sampleData = [
    {
      id: "1",
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Beach Road, Chennai",
      mapLink: "https://maps.google.com/?q=13.0827,80.2707",
      createdAt: "2024-08-10T10:00:00Z",
    },
    {
      id: "2",
      name: "Priya S",
      phone: "+91 9123456789",
      address: "45 Sea Street, Kochi",
      mapLink: "https://maps.google.com/?q=9.9312,76.2673",
      createdAt: "2024-09-15T15:30:00Z",
    },
  ];

  useEffect(() => {
    // Future backend integration:
    // axios.get("/api/users").then(res => setCustomers(res.data));
    setCustomers(sampleData);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit clicked for Customer ID:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete clicked for Customer ID:", id);
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
          All Customers
        </Typography>

        <DataTable
          title=""
          columns={columns}
          rows={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </Box>
  );
};

export default ViewCustomers;
