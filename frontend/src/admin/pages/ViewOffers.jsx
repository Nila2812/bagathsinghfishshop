import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
import axios from "axios"; // Uncomment later when backend connects
import EditOfferModel from "../components/EditOfferModel.jsx";

const ViewOffers = () => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);





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
    
    {
      field: "description_ta",
      headerName: "Description (TA)",
      width: 250,
    },
    { field: "productName", headerName: "Product", width: 180 },

    { field: "discountPercent", headerName: "Discount (%)", width: 140 },
   { field: "costPrice", headerName: "Cost Price (₹)", width: 140 },
{ field: "sellingPrice", headerName: "Selling Price (₹)", width: 150 },

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
  renderCell: (params) => {
    const dateStr = params.row.startDate;
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-GB")
      : "—";
  }
},
{
  field: "endDate",
  headerName: "End Date",
  width: 150,
  renderCell: (params) => {
    const dateStr = params.row.endDate;
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-GB")
      : "—";
  }
}



  ];

 

useEffect(() => {
  axios.get("http://localhost:5000/api/offers")
    .then((res) => {
      console.log("✅ RAW API Response:", res.data);
      if (Array.isArray(res.data)) {
        res.data.forEach((offer, i) => {
          console.log(
            `Offer ${i + 1}:`,
            "Start:", offer.startDate,
            "End:", offer.endDate
          );
        });
      }
      setOffers(res.data);
    })
    .catch((err) => console.error("❌ Failed to fetch offers:", err));
}, []);



const fetchOffers = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/offers");
    setOffers(res.data);
  } catch (err) {
    console.error("Failed to refresh offers:", err);
  }
};

  const handleEdit = (id) => {
  const offer = offers.find(o => o._id === id);
  setSelectedOffer(offer);
};



const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:5000/api/offers/${id}`);
    setOffers(prev => prev.filter(o => o._id !== id));
    console.log("Offer deleted:", id);
  } catch (err) {
    console.error("Failed to delete offer:", err);
  }
};



  return (
    <Box sx={{p: 3 }}>
      <DataTable
        title="Offers"
        columns={columns}
        rows={offers.map((o, index) => ({
  ...o,
  id: index + 1, // just for display numbering
  startDate: o.startDate ? new Date(o.startDate) : null,
  endDate: o.endDate ? new Date(o.endDate) : null,
}))}

        onEdit={handleEdit}
        onDelete={handleDelete}
      />
   
{selectedOffer && (
  <EditOfferModel
    offer={selectedOffer}
    onClose={() => setSelectedOffer(null)}
    onSave={(updated) => {
      fetchOffers(); // ✅ refresh full list
      setSelectedOffer(null); // ✅ close modal
    }}
  />
)}





    </Box>
    
  );
};

export default ViewOffers;
