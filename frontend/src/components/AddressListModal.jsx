import { useEffect, useState } from "react";
import { Box, Button, Typography, Card, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { getClientId } from "../utils/clientId";

export default function AddressListModal({ open, onClose, onSelect, onAddNew, onEdit }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const clientId = getClientId();
    fetch(`/api/address/${clientId}`)
      .then(r => r.json())
      .then(data => {
        setAddresses(data);
        setLoading(false);
      })
      .catch(() => {
        setAddresses([]);
        setLoading(false);
      });
  }, [open]);

  const handleDelete = async (id) => {
    await fetch(`/api/address/${id}`, { method: "DELETE" });
    setAddresses(prev => prev.filter(a => a._id !== id));
  };

  const getAddressIcon = (saveAs) => {
    switch(saveAs?.toLowerCase()) {
      case "home": return <HomeIcon sx={{ fontSize: 20 }} />;
      case "work": return <WorkIcon sx={{ fontSize: 20 }} />;
      default: return <LocationOnIcon sx={{ fontSize: 20 }} />;
    }
  };

  if (!open) return null;

  return (
    <Box sx={{
      position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.5)", zIndex: 1300,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <Box sx={{
        width: { xs: "95%", sm: 600 }, maxHeight: "85vh",
        bgcolor: "#fff", borderRadius: 3, overflow: "hidden",
        display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <Box sx={{ p: 2.5, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Delivery Address
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loading ? (
            <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              Loading addresses...
            </Typography>
          ) : addresses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <HomeIcon sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
                No address saved
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                Add your first delivery address to continue
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddNew}
                sx={{
                  backgroundColor: "#D31032",
                  "&:hover": { backgroundColor: "#b00" }
                }}
              >
                Add New Address
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {addresses.map(addr => (
                <Card
                  key={addr._id}
                  sx={{
                    p: 2, cursor: "pointer",
                    border: addr.isDefault ? "2px solid #D31032" : "1px solid #e0e0e0",
                    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }
                  }}
                  onClick={() => onSelect?.(addr)}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        {getAddressIcon(addr.saveAs)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                          {addr.saveAs || "Home"}
                        </Typography>
                        {addr.isDefault && (
                          <Chip
                            label="DEFAULT"
                            size="small"
                            sx={{
                              bgcolor: "#D31032",
                              color: "#fff",
                              fontWeight: 600,
                              height: 20,
                              fontSize: "0.7rem"
                            }}
                          />
                        )}
                      </Box>
                      
                      {addr.name && (
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {addr.name} {addr.phone && `• ${addr.phone}`}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                        {`${addr.doorNo || ""} ${addr.street || ""}`.trim()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {[addr.locality, addr.district, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ml: 2 }}>
                      {!addr.isDefault && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetch(`/api/address/${addr._id}/default`, { method: "PATCH" })
                              .then(r => r.json())
                              .then(() => {
                                setAddresses(prev =>
                                  prev.map(a => ({ ...a, isDefault: a._id === addr._id }))
                                );
                                onSelect?.(addr);
                              });
                          }}
                          sx={{ fontSize: "0.75rem", textTransform: "none" }}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(addr);
                        }}
                        sx={{ fontSize: "0.75rem", textTransform: "none" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="error"
                        disabled={addr.isDefault}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this address?")) {
                            handleDelete(addr._id);
                          }
                        }}
                        sx={{ fontSize: "0.75rem", textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Footer */}
        {addresses.length > 0 && (
          <Box sx={{
            p: 2, borderTop: "1px solid #e0e0e0",
            display: "flex", justifyContent: "space-between", gap: 2
          }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{ flex: 1 }}
            >
              Add New Address
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}