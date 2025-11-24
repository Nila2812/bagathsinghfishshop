import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  Chip,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getClientId } from "../utils/clientId";

// Define the primary brand color for consistency
const BRAND_COLOR = "#D31032";

export default function CheckoutAddressList({
  userId,
  isLoggedIn,
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
  // Check for large screen (md and up) to determine layout of the Continue button
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Used for minor card padding adjustments

  // LOAD ADDRESSES - FIXED
  const loadAddresses = async () => {
    setLoading(true);

    // 🔥 FIX: Use userId if logged in, otherwise use clientId
    const idToFetch = isLoggedIn && userId ? userId : getClientId();
    const typeParam = isLoggedIn && userId ? 'user' : 'client';

    console.log('🔍 Loading addresses:', { idToFetch, typeParam, isLoggedIn, userId });

    try {
      // Fetching address from backend with proper type parameter
      const response = await fetch(`/api/address/${idToFetch}?type=${typeParam}`);
      const data = await response.json();
      console.log('✅ Addresses loaded:', data);
      setAddresses(data || []);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to load addresses:", error);
      setAddresses([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [userId, isLoggedIn, refreshFlag]);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/address/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      await loadAddresses();
      // Deselect if the deleted address was the selected one
      if (selectedAddressId === id) {
        onSelect?.(null);
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const getAddressIcon = (saveAs) => {
    switch (saveAs?.toLowerCase()) {
      case "home":
        return <HomeIcon fontSize="small" />;
      case "work":
        return <WorkIcon fontSize="small" />;
      default:
        return <LocationOnIcon fontSize="small" />;
    }
  };

  // Function to ensure the label is capitalized
  const formatSaveAsLabel = (saveAs) => {
    if (!saveAs) return "Other";
    // Capitalize the first letter and keep the rest lower case (e.g., 'home' -> 'Home')
    const lower = saveAs.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const handleEditClick = (e, addr) => {
    e.stopPropagation();
    onEdit?.(addr);
  };

  const handleDeleteClick = (e, addr) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this address?")) {
      handleDelete(addr._id);
    }
  };

  // Determine if the fixed footer should be visible (on smaller screens)
  const showFixedContinueButton = selectedAddressId && !isLargeScreen;

  return (
    <Box
      sx={{
        width: "100%",
        // Add bottom padding only if the fixed button is visible (mobile/tablet view)
        pb: showFixedContinueButton ? 10 : 0,
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: 600, mb: 3 }}
      >
        Select Delivery Address
      </Typography>

      {/* Loading State */}
      {loading && (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Loading addresses...
        </Typography>
      )}

      {/* No Address Saved */}
      {!loading && addresses.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <HomeIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 1, color: "text.secondary" }}>
            No address saved yet.
          </Typography>
          <Typography variant="caption" sx={{ mb: 3, color: "text.secondary" }}>
            Add your first delivery address to continue.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{ backgroundColor: BRAND_COLOR, "&:hover": { backgroundColor: BRAND_COLOR, opacity: 0.9 } }}
            >
              Add New Address
            </Button>
          </Box>
        </Box>
      )}

      {/* Address List */}
      {!loading && addresses.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;

            return (
              <Card
                key={addr._id}
                variant="outlined"
                sx={{
                  p: isMobile ? 2 : 3, // Responsive padding
                  cursor: "pointer",
                  borderRadius: 3,
                  border: isSelected ? `2px solid ${BRAND_COLOR}` : `1px solid ${theme.palette.divider}`,
                  boxShadow: isSelected ? `0 4px 12px rgba(211, 16, 50, 0.1)` : "none",
                  transition: "all 0.3s",
                  position: 'relative',
                  "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
                }}
                onClick={() => onSelect?.(addr)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: BRAND_COLOR,
                      fontSize: 24,
                    }}
                  />
                )}
                
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {/* Save As and Default Chip */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={formatSaveAsLabel(addr.saveAs)}
                      size="small"
                      icon={getAddressIcon(addr.saveAs)}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: isSelected ? `${BRAND_COLOR}15` : theme.palette.grey[100],
                        color: isSelected ? BRAND_COLOR : theme.palette.text.primary,
                        mr: 1
                      }}
                    />
                    {addr.isDefault && (
                      <Chip
                        label="DEFAULT"
                        size="small"
                        sx={{ bgcolor: BRAND_COLOR, color: "white", fontWeight: 500 }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  
                  {/* Contact Info */}
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
                    {addr.name} - {addr.phone}
                  </Typography>

                  {/* Address Details */}
                  <Typography variant="body2" color="text.secondary">
                    {addr.doorNo} {addr.street}, {addr.locality}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[addr.district, addr.state, addr.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>

                  {/* Actions (Edit/Delete) */}
                  <Box
                    sx={{
                      pt: 1,
                      display: "flex",
                      gap: 1,
                      // Align left on mobile, right on desktop/large screens
                      justifyContent: { xs: "flex-start", md: "flex-end" }, 
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={(e) => handleEditClick(e, addr)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      disabled={addr.isDefault}
                      onClick={(e) => handleDeleteClick(e, addr)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      
      {/* Add New Address Button */}
      <Box sx={{ p: 0.5 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddNew}
          sx={{
            borderColor: BRAND_COLOR,
            color: BRAND_COLOR,
            borderStyle: 'dashed',
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            "&:hover": {
                borderColor: BRAND_COLOR,
                backgroundColor: `${BRAND_COLOR}05`,
                borderStyle: 'dashed',
            }
          }}
        >
          Add New Address
        </Button>
      </Box>


      {/* CONTINUE BUTTON - FIXED FOOTER (Mobile/Tablet Only) */}
      {showFixedContinueButton && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            p: 2,
            px: { xs: 2, sm: 3 }, 
            backgroundColor: "white",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={onContinue}
            sx={{
              backgroundColor: BRAND_COLOR,
              p: 1.5,
              fontSize: { xs: 16, sm: 18 },
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { backgroundColor: BRAND_COLOR, opacity: 0.9 },
            }}
          >
            Continue
          </Button>
        </Box>
      )}

      {/* CONTINUE BUTTON - NORMAL (Desktop/Large Screens Only) */}
      {selectedAddressId && isLargeScreen && (
         <Box sx={{ pt: 3, pb: 2 }}>
            <Button
                fullWidth
                variant="contained"
                onClick={onContinue}
                sx={{
                    backgroundColor: BRAND_COLOR,
                    p: 1.5,
                    fontSize: 18,
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": { backgroundColor: BRAND_COLOR, opacity: 0.9 },
                }}
            >
                Continue
            </Button>
        </Box>
      )}
    </Box>
  );
}