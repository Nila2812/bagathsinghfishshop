import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkStyle = {
    textDecoration: "none",
    width: "100%",
  };

  const addButtons = [
    { label: "Add Product", path: "/admin/add-product" },
    { label: "Add Category", path: "/admin/add-category" },
    { label: "Add Offer", path: "/admin/add-offer" },
    { label: "Add Admin", path: "/admin/add-admin" },
  ];

  const viewButtons = [
    { label: "View Products", path: "/admin/view-products" },
    { label: "View Categories", path: "/admin/view-categories" },
    { label: "View Offers", path: "/admin/view-offers" },
    { label: "View Customers", path: "/admin/view-customers" },
    { label: "View Orders", path: "/admin/view-orders" },
    { label: "View Admin Details", path: "/admin/view-admins" },
  ];

  return (
    <Box
      sx={{
        width: "240px",
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

<NavLink
  to="/admin"
  style={({ isActive }) => ({
    ...linkStyle,
    borderRadius: "4px",
  })}
>
  {({ isActive }) => (
    <Button
      fullWidth
      variant={isActive ? "contained" : "outlined"}
      sx={{
        bgcolor: isActive ? "#d21414ff" : "transparent",
        color: "white",
        borderColor: "gray",
        "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
      }}
    >
      Dashboard
    </Button>
  )}
</NavLink>
<Divider sx={{ bgcolor: "gray", my: 2 }} />

      {/* ADD SECTION */}
      {addButtons.map((btn) => (
        <NavLink
          key={btn.path}
          to={btn.path}
          style={({ isActive }) => ({
            ...linkStyle,
            borderRadius: "4px",
          })}
        >
          {({ isActive }) => (
            <Button
              fullWidth
              variant={isActive ? "contained" : "outlined"}
              sx={{
                bgcolor: isActive ? "#1565c0" : "transparent",
                color: "white",
                borderColor: "gray",
                "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
              }}
            >
              {btn.label}
            </Button>
          )}
        </NavLink>
      ))}

      <Divider sx={{ bgcolor: "gray", my: 2 }} />

      {/* VIEW SECTION */}
      {viewButtons.map((btn) => (
        <NavLink
          key={btn.path}
          to={btn.path}
          style={({ isActive }) => ({
            ...linkStyle,
            borderRadius: "4px",
          })}
        >
          {({ isActive }) => (
            <Button
              fullWidth
              variant={isActive ? "contained" : "outlined"}
              sx={{
                bgcolor: isActive ? "#1565c0" : "transparent",
                color: "white",
                borderColor: "gray",
                "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
              }}
            >
              {btn.label}
            </Button>
          )}
        </NavLink>
      ))}
    </Box>
  );
};

export default Sidebar;
