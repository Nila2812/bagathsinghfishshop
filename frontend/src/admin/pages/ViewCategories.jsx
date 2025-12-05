import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import DataTable from "../components/DataTable";
import EditCategoryModal from "../components/EditCategoryModal.jsx";

const ViewCategories = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name_ta", headerName: "Category Name (Tamil)", width: 200 },
    { field: "name_en", headerName: "Category Name (English)", width: 200 },
    { field: "description_ta", headerName: "Description (Tamil)", width: 220 },
    { field: "description_en", headerName: "Description (English)", width: 220 },
    {
      field: "parentCategory",
      headerName: "Main Category",
      width: 180,
      renderCell: (params) =>
        params.value?.name_en ? (
          <span>{params.value.name_en}</span>
        ) : (
          <em style={{ color: "#888" }}>None</em>
        ),
    },
    {
      field: "image",
      headerName: "Image",
      width: 120,
      renderCell: (params) => {
        const imageUrl = params.row.image?.data
          ? `data:${params.row.image.contentType};base64,${params.row.image.data}`
          : null;

        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Category"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <span style={{ color: "#888" }}>No Image</span>
        );
      },
    },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/category")
      .then((res) => {
        const enriched = res.data.map((cat, index) => ({
          ...cat,
          id: index + 1,
        }));
        setCategories(enriched);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  const handleEdit = (id) => {
    const category = categories.find((c) => c._id === id);
    setEditingCategory(category);
  };

  const handleSave = async (updated) => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      const enriched = res.data.map((cat, index) => ({
        ...cat,
        id: index + 1,
      }));
      setCategories(enriched);
    } catch (err) {
      console.error("Failed to refresh categories:", err);
    }
    setEditingCategory(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/category/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <Box
      sx={{
        p: {xs:0, md:3},
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          p: {xs:2, md:3},
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
          All Categories
        </Typography>

        <DataTable
          title=""
          columns={columns}
          rows={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSave}
        />
      )}
    </Box>
  );
};

export default ViewCategories;
