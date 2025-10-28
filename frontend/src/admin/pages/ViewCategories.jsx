import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment later for backend connection

const ViewCategories = () => {
  const [categories, setCategories] = useState([]);

  // Table columns for category view
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name_ta", headerName: "Category Name (Tamil)", width: 220 },
    { field: "name_en", headerName: "Category Name (English)", width: 220 },
    {
      field: "parentCategory",
      headerName: "Main Category",
      width: 220,
      renderCell: (params) =>
        params.value ? (
          <span>{params.value}</span>
        ) : (
          <em style={{ color: "#888" }}>None (Main Category)</em>
        ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 160,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Sample categories data
  const sampleCategories = [
    {
      id: "1",
      name_ta: "கடல் மீன்",
      name_en: "Sea Fish",
      parentCategory: null,
      createdAt: "2025-09-10T12:00:00Z",
    },
    {
      id: "2",
      name_ta: "நீர் மீன்",
      name_en: "Freshwater Fish",
      parentCategory: null,
      createdAt: "2025-09-15T10:00:00Z",
    },
    {
      id: "3",
      name_ta: "பாரா மீன்",
      name_en: "Barramundi",
      parentCategory: "Sea Fish",
      createdAt: "2025-09-18T09:30:00Z",
    },
    {
      id: "4",
      name_ta: "ரொஹு மீன்",
      name_en: "Rohu",
      parentCategory: "Freshwater Fish",
      createdAt: "2025-10-01T08:45:00Z",
    },
  ];

  useEffect(() => {
    // Future backend call example:
    // axios.get("/api/categories").then((res) => setCategories(res.data));
    setCategories(sampleCategories);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit category ID:", id);
    // Future inline edit or modal logic
  };

  const handleDelete = (id) => {
    console.log("Delete category ID:", id);
    // Future backend delete API call
  };

  return (
    <Box sx={{ ml: "20%", p: 3 }}>
      <DataTable
        title="Category List"
        columns={columns}
        rows={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewCategories;
