import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import DataTable from "../components/DataTable";
import EditProductModal from "../components/EditProductModal";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "name_en", headerName: "Product Name (EN)", width: 200 },
    { field: "name_ta", headerName: "Product Name (TA)", width: 200 },
    { field: "price", headerName: "Price (₹)", width: 120 },
    { field: "weightValue", headerName: "Weight Value", width: 120 },
    { field: "weightUnit", headerName: "Weight Unit", width: 120 },
    {
      field: "baseUnit",
      headerName: "Base Unit",
      width: 120,
      renderCell: (params) => {
        const val = params.value;
        return val?.includes("piece") ? val.replace("piece", " Pieces") : val;
      },
    },
    { field: "stockQty", headerName: "Stock Qty", width: 120 },
    {
      field: "isAvailable",
      headerName: "Available",
      width: 120,
      renderCell: (params) => (
        <span style={{ color: params.value ? "green" : "red", fontWeight: 600 }}>
          {params.value ? "Yes" : "No"}
        </span>
      ),
    },
    { field: "subcategory", headerName: "Subcategory", width: 160 },
    {
      field: "image",
      headerName: "Product Image",
      width: 120,
      renderCell: (params) => {
        const imageUrl = params.row.image?.data
          ? `data:${params.row.image.contentType};base64,${params.row.image.data}`
          : null;

        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Product"
            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: "#888" }}>No Image</span>
        );
      },
    },
  ];

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/view-products")
      .then((res) => {
        const enriched = res.data.map((p, index) => {
          let available = false;

          if (["g", "kg"].includes(p.weightUnit)) {
            const weightInKg = p.weightUnit === "g"
              ? p.weightValue / 1000
              : p.weightValue;
            available = p.stockQty >= weightInKg;
          } else if (p.weightUnit === "piece") {
            available = p.stockQty >= p.weightValue;
          }

          return {
            ...p,
            id: index + 1,
            isAvailable: available,
            subcategory: p.subcategory || "None",
          };
        });

        setProducts(enriched);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
      });
  }, []);

  const handleEdit = (id) => {
    const product = products.find(p => p._id === id);
    setEditingProduct(product);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const grouped = products.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      {Object.entries(grouped).map(([category, rows]) => {
        const sortedRows = [...rows].sort((a, b) => {
          const subA = a.subcategory?.toLowerCase() || "";
          const subB = b.subcategory?.toLowerCase() || "";
          return subA.localeCompare(subB);
        });

        const numberedRows = sortedRows.map((row, index) => ({
          ...row,
          id: index + 1,
        }));

        return (
          <Box
            key={category}
            sx={{
              mb: 5,
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
              Category: {category}
            </Typography>

            <DataTable
              title=""
              columns={columns}
              rows={numberedRows}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        );
      })}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(updated) => {
            setProducts(prev =>
              prev.map(p => (p._id === updated._id ? updated : p))
            );
            setEditingProduct(null);
          }}
        />
      )}
    </Box>
  );
};

export default ViewProducts;