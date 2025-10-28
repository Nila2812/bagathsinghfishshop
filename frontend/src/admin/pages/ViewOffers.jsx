import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment later when backend connects

const ViewOffers = () => {
  const [offers, setOffers] = useState([]);

  // Columns for offers view (as per your requirements)
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "title_en", headerName: "Offer Title (EN)", width: 200 },
    { field: "title_ta", headerName: "Offer Title (TA)", width: 200 },
    {
      field: "description_en",
      headerName: "Description (EN)",
      width: 250,
    },
    { field: "discountPercent", headerName: "Discount (%)", width: 140 },
    { field: "cp", headerName: "Cost Price (₹)", width: 140 },
    { field: "sp", headerName: "Selling Price (₹)", width: 150 },
    {
      field: "isActive",
      headerName: "Active",
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
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Sample data (mock for now)
  const sampleData = [
    {
      id: "1",
      title_en: "Fresh Tilapia Offer",
      title_ta: "புதிய திலாபியா சலுகை",
      description_en: "Buy 1kg Tilapia and get 10% off!",
      discountPercent: 10,
      cp: 250,
      sp: 225,
      isActive: true,
      startDate: "2025-01-10T10:00:00Z",
      endDate: "2025-01-20T23:59:00Z",
    },
    {
      id: "2",
      title_en: "Crab Combo Discount",
      title_ta: "நண்டு காம்போ தள்ளுபடி",
      description_en: "Special 15% discount on crab combo pack.",
      discountPercent: 15,
      cp: 400,
      sp: 340,
      isActive: false,
      startDate: "2025-02-01T00:00:00Z",
      endDate: "2025-02-10T23:59:00Z",
    },
    {
      id: "3",
      title_en: "Weekend Prawn Sale",
      title_ta: "வார இறுதி இறால் விற்பனை",
      description_en: "Flat 20% off on all prawns this weekend.",
      discountPercent: 20,
      cp: 600,
      sp: 480,
      isActive: true,
      startDate: "2025-03-05T10:00:00Z",
      endDate: "2025-03-07T23:59:00Z",
    },
  ];

  useEffect(() => {
    // Future backend connection:
    // axios.get("/api/offers").then((res) => setOffers(res.data));
    setOffers(sampleData);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit offer ID:", id);
    // Future: open modal for edit
  };

  const handleDelete = (id) => {
    console.log("Delete offer ID:", id);
    // Future: axios.delete(`/api/offers/${id}`)
  };

  return (
    <Box sx={{p: 3 }}>
      <DataTable
        title="Offers"
        columns={columns}
        rows={offers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewOffers;
