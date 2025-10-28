import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment when backend is ready

const ViewProducts = () => {

  const [products, setProducts] = useState([]);

  // Columns for products view (as per requirements)
  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "name_en", headerName: "Product Name (EN)", width: 200 },
    { field: "name_ta", headerName: "Product Name (TA)", width: 200 },
    { field: "price", headerName: "Price (₹)", width: 120 },
     { field: "weightValue", headerName: "Weight Value", width: 120 },
    { field: "weightUnit", headerName: "Weight Unit", width: 120 },
    { field: "stockQty", headerName: "Stock Qty", width: 120 },
    {
      field: "isAvailable",
      headerName: "Available",
      width: 120,
      renderCell: (params) => (
        <span
          style={{
            color: params.value ? "green" : "red",
            fontWeight: 600,
          }}
        >
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Added On",
      width: 160,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Sample Data (mock)
  const sampleData = [
    {
      id: "1",
      name_en: "Tilapia Fish",
      name_ta: "திலாபியா மீன்",
      price: 250,
      weightValue: 1,
      weightUnit: "kg",
      stockQty: 25,
      isAvailable: true,
      createdAt: "2025-01-10T10:00:00Z",
    },
    {
      id: "2",
      name_en: "Crab",
      name_ta: "நண்டு",
      price: 450,
      weightValue: 500,
      weightUnit: "g",
      stockQty: 10,
      isAvailable: true,
      createdAt: "2025-02-05T15:30:00Z",
    },
    {
      id: "3",
      name_en: "Prawn",
      name_ta: "இறால்",
      price: 600,
      weightValue: 1,
      weightUnit: "kg",
      stockQty: 0,
      isAvailable: false,
      createdAt: "2025-03-20T12:00:00Z",
    },
  ];

  useEffect(() => {
    // Future: Fetch from backend
    // axios.get("/api/products").then((res) => setProducts(res.data));
    setProducts(sampleData);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit product ID:", id);
    // Future: open edit form modal here
  };

  const handleDelete = (id) => {
    console.log("Delete product ID:", id);
    // Future: axios.delete(`/api/products/${id}`)
  };

  return (
    <Box sx={{  p: 3 }}>
      <DataTable
        title="Products"
        columns={columns}
        rows={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewProducts;
