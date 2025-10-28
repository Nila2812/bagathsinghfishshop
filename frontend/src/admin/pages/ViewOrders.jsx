import React, { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import { Box } from "@mui/material";
// import axios from "axios"; // Uncomment when backend connects

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);

  // Table columns based on your admin requirements
  const columns = [
    { field: "id", headerName: "Order ID", width: 100 },
    { field: "customerName", headerName: "Customer Name", width: 180 },
    { field: "phone", headerName: "Phone Number", width: 150 },
    { field: "address", headerName: "Delivery Address", width: 250 },
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
    {
      field: "productNames",
      headerName: "Products",
      width: 250,
      renderCell: (params) => (
        <div>
          {params.value.map((name, index) => (
            <div key={index}>• {name}</div>
          ))}
        </div>
      ),
    },
    { field: "totalWeight", headerName: "Total Weight (kg)", width: 160 },
    { field: "totalAmount", headerName: "Total (₹)", width: 140 },
    { field: "deliveryCharge", headerName: "Delivery (₹)", width: 140 },
    { field: "grandTotal", headerName: "Grand Total (₹)", width: 150 },
    { field: "paymentMode", headerName: "Payment Mode", width: 150 },
    { field: "paymentStatus", headerName: "Payment Status", width: 150 },
    { field: "orderStatus", headerName: "Order Status", width: 150 },
    {
      field: "createdAt",
      headerName: "Order Date",
      width: 150,
      valueFormatter: (params) =>
        new Date(params?.value).toLocaleDateString("en-GB"),
    },
  ];

  // Sample order data (mock for now)
  const sampleOrders = [
    {
      id: "1",
      customerName: "Ravi Kumar",
      phone: "9876543210",
      address: "12, Beach Road, Chennai",
      mapLink: "https://maps.google.com/?q=13.0827,80.2707",
      productNames: ["Tilapia", "Crab Combo"],
      totalWeight: 3.5,
      totalAmount: 820,
      deliveryCharge: 30,
      grandTotal: 850,
      paymentMode: "COD",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      createdAt: "2025-10-25T10:00:00Z",
    },
    {
      id: "2",
      customerName: "Suresh Babu",
      phone: "9123456789",
      address: "45, Lake View Street, Madurai",
      mapLink: "https://maps.google.com/?q=9.9252,78.1198",
      productNames: ["Prawns", "Sea Bass"],
      totalWeight: 2.8,
      totalAmount: 1050,
      deliveryCharge: 0,
      grandTotal: 1050,
      paymentMode: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      createdAt: "2025-10-23T12:15:00Z",
    },
    {
      id: "3",
      customerName: "Lakshmi Devi",
      phone: "9000011122",
      address: "21, MG Road, Coimbatore",
      mapLink: "https://maps.google.com/?q=11.0168,76.9558",
      productNames: ["Anchovy", "King Fish"],
      totalWeight: 4.2,
      totalAmount: 1260,
      deliveryCharge: 20,
      grandTotal: 1280,
      paymentMode: "COD",
      paymentStatus: "Pending",
      orderStatus: "Confirmed",
      createdAt: "2025-10-26T09:45:00Z",
    },
  ];

  useEffect(() => {
    // Future: axios.get("/api/orders").then(res => setOrders(res.data))
    setOrders(sampleOrders);
  }, []);

  const handleEdit = (id) => {
    console.log("Edit order ID:", id);
    // Future enhancement: open edit modal for order status update
  };

  const handleDelete = (id) => {
    console.log("Delete order ID:", id);
    // Future enhancement: axios.delete(`/api/orders/${id}`)
  };

  return (
    <Box sx={{ ml: "20%", p: 3 }}>
      <DataTable
        title="Orders"
        columns={columns}
        rows={orders}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ViewOrders;
