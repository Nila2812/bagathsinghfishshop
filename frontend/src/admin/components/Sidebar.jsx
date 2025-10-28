import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";

const Sidebar = ({ onSelect }) => {
  return (
    <Box
      sx={{
        width: "20%",
        height: "100vh",
        bgcolor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "20px",
        gap: 1,
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      {/* Admin Panel Header */}
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 2,
          letterSpacing: 1,
        }}
      >
        Admin Panel
      </Typography>

      {/* Add Section */}
      <Button
        variant="contained"
        onClick={() => onSelect("addProduct")}
        sx={{
          bgcolor: "#1976d2",
          "&:hover": { bgcolor: "#1565c0" },
          color: "white",
        }}
      >
        Add Product
      </Button>

      <Button
        variant="contained"
        onClick={() => onSelect("addCategory")}
        sx={{
          bgcolor: "#1976d2",
          "&:hover": { bgcolor: "#1565c0" },
          color: "white",
        }}
      >
        Add Category
      </Button>

      <Button
        variant="contained"
        onClick={() => onSelect("addOffer")}
        sx={{
          bgcolor: "#1976d2",
          "&:hover": { bgcolor: "#1565c0" },
          color: "white",
        }}
      >
        Add Offer
      </Button>

      {/* Divider between Add and View sections */}
      <Divider sx={{ bgcolor: "gray", my: 2 }} />

      {/* View Section */}
      <Button
        variant="outlined"
        onClick={() => onSelect("viewProducts")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Products
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect("viewCategories")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Categories
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect("viewOffers")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Offers
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect("viewCustomers")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Customers
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect("viewOrders")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Orders
      </Button>

      <Button
        variant="outlined"
        onClick={() => onSelect("viewAdmins")}
        sx={{
          color: "white",
          borderColor: "gray",
          "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
        }}
      >
        View Admin Details
      </Button>
    </Box>
  );
};

export default Sidebar;
