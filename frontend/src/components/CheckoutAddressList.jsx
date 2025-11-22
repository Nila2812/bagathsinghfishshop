// Updated CheckoutAddressList.jsx with responsive UI, improved styling, and Add New Address button

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { getClientId } from "../utils/clientId";

export default function CheckoutAddressList({
  userId,
  onSelect,
  onAddNew,
  onEdit,
  onContinue,
  selectedAddressId,
  refreshFlag,
}) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // LOAD ADDRESSES
  const loadAddresses = async () => {
    setLoading(true);

    const idToFetch = userId || getClientId();

    fetch(`/api/address/${idToFetch}`)
      .then((r) => r.json())
      .then((data) => {
        setAddresses(data || []);
        setLoading(false);
      })
      .catch(() => {
        setAddresses([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAddresses();
  }, [userId, refreshFlag]);

  const handleDelete = async (id) => {
    await fetch(`/api/address/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    await loadAddresses();
  };

  const getAddressIcon = (saveAs) => {
    switch (saveAs?.toLowerCase()) {
      case "home":
        return <HomeIcon sx={{ fontSize: 20 }} />;
      case "work":
        return <WorkIcon sx={{ fontSize: 20 }} />;
      default:
        return <LocationOnIcon sx={{ fontSize: 20 }} />;
    }
  };

  const responsiveFont = {
    fontSize: isMobile ? 14 : isTablet ? 15 : 16,
  };

  return (
    <Box sx={{ width: "100%", pb: 12 }}>
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{ fontWeight: 700, mb: 2 }}
      >
        Select Delivery Address
      </Typography>

      {/* No Address Saved */}
      {loading ? (
        <Typography sx={{ textAlign: "center", py: 4 }}>
          Loading addresses...
        </Typography>
      ) : addresses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <HomeIcon sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
          <Typography sx={{ mb: 1, ...responsiveFont, color: "text.secondary" }}>
            No address saved
          </Typography>
          <Typography sx={{ mb: 3, fontSize: 14, color: "text.secondary" }}>
            Add your first delivery address to continue
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddNew}
            sx={{ backgroundColor: "#D31032", borderRadius: 2 }}
          >
            Add New Address
          </Button>
        </Box>
      ) : (
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}
        >
          {addresses.map((addr) => (
            <Card
              key={addr._id}
              sx={{
                p: isMobile ? 1.5 : 2,
                cursor: "pointer",
                border:
                  selectedAddressId === addr._id
                    ? "2px solid #D31032"
                    : "1px solid #e0e0e0",
                borderRadius: 3,
                transition: "0.2s",
                ":hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
              }}
              onClick={() => onSelect?.(addr)}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    {getAddressIcon(addr.saveAs)}
                    <Typography sx={{ fontWeight: 600, ...responsiveFont }}>
                      {addr.saveAs || "Home"}
                    </Typography>
                    {addr.isDefault && (
                      <Chip
                        label="DEFAULT"
                        size="small"
                        sx={{ bgcolor: "#D31032", color: "white" }}
                      />
                    )}
                  </Box>

                  <Typography sx={{ fontWeight: 600, mt: 1, ...responsiveFont }}>
                    {addr.name} • {addr.phone}
                  </Typography>

                  <Typography sx={{ fontSize: 14 }}>
                    {addr.doorNo} {addr.street}
                  </Typography>

                  <Typography sx={{ fontSize: 14, color: "gray" }}>
                    {[addr.locality, addr.district, addr.state, addr.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <Button
                    size="small"
                    sx={{ alignSelf: isMobile ? "flex-start" : "flex-end" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(addr);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    disabled={addr.isDefault}
                    sx={{ alignSelf: isMobile ? "flex-start" : "flex-end" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this address?")) handleDelete(addr._id);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* ADD NEW ADDRESS BUTTON BELOW LIST */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "2px dashed #D31032",
          borderRadius: 3,
          textAlign: "center",
          cursor: "pointer",
          color: "#D31032",
          fontWeight: 600,
        }}
        onClick={onAddNew}
      >
        + Add New Address
      </Box>

      {/* CONTINUE BUTTON */}
      {selectedAddressId && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            p: 2,
            backgroundColor: "white",
            borderTop: "1px solid #ddd",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: "#D31032", p: 1.5, fontSize: 16 }}
            onClick={onContinue}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  );
}
