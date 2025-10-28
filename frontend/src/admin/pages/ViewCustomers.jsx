import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment when backend is ready

const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);

  // Define table columns based on your schema
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

  // Dummy data (replace with backend API data later)
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
    // Future backend connection:
    // axios.get("/api/users").then(res => setCustomers(res.data));
    setCustomers(sampleData);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit clicked for Customer ID:", id);
    // Future: enable edit mode (name/address editable inline)
  };

  const handleDelete = (id) => {
    console.log("Delete clicked for Customer ID:", id);
    // Future: axios.delete(`/api/users/${id}`).then(() => refresh list)
  };

  return (
    <Box sx={{ ml: "20%", p: 3 }}>
      <DataTable
        title="Customers"
        columns={columns}
        rows={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewCustomers;
