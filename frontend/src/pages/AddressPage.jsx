import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Paper, Button, Container, Chip, IconButton, Skeleton 
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

// Components
import AddressFormModal from "../components/AddressFormModal"; 
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";

const AddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const userId = localStorage.getItem("userId");
  const mainColor = "#D31032";

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      if (!userId) { navigate('/'); return; }
      
      const response = await fetch(`/api/address/${userId}?type=user`);
      const data = await response.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching addresses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNew = () => { setEditingAddress(null); setFormOpen(true); };
  const handleEdit = (addr) => { setEditingAddress(addr); setFormOpen(true); };
  
  const handleFormSaved = () => {
    setFormOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this address?")) return;
    try {
      await fetch(`/api/address/${id}`, { method: "DELETE" });
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch (error) { console.error("Error deleting", error); }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(`/api/address/${id}/default`, { method: "PATCH" });
      if (res.ok) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
      }
    } catch (error) { console.error("Error setting default", error); }
  };

  const getIcon = (type) => {
    if (type?.toLowerCase() === 'home') return <HomeIcon />;
    if (type?.toLowerCase() === 'work') return <WorkIcon />;
    return <LocationOnIcon />;
  };

  return (
    <>
      {/* 🔹 Fixed Header Wrapper */}
      <Box
        sx={{
          position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1200,
          backgroundColor: "#fff", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Topbar />
        <MainNavbar />
        <CategoryBar />
      </Box>

      {/* 🔹 Main Content */}
      <Box
        sx={{
          mt: { xs: "125px", md: "150px", sm: "143px" }, // Matches HomePage
          minHeight: "80vh",
          backgroundColor: "#fafafa",
          pb: 4
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          
          {/* Page Title & Add Button */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#282828" }}>
                My Addresses
              </Typography>
            </Box>
            <Button 
              variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}
              sx={{ bgcolor: mainColor, "&:hover": { bgcolor: "#b00d29" } }}
            >
              Add New
            </Button>
          </Box>

          {/* Address List */}
          {loading ? (
            <Grid container spacing={3}>
               {[1,2,3].map(i => (
                 <Grid item xs={12} md={6} key={i}><Skeleton height={200} /></Grid>
               ))}
            </Grid>
          ) : addresses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, bgcolor: "#fff", borderRadius: 4, border: "1px dashed #ccc" }}>
              <LocationOnIcon sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No addresses saved yet.</Typography>
              <Button variant="outlined" sx={{ mt: 2, color: mainColor, borderColor: mainColor }} onClick={handleAddNew}>
                Add your first address
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Loop through addresses */}
              {addresses.map((addr) => (
                <Grid item xs={12} md={6} lg={4} key={addr._id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, height: "100%", bgcolor: "#fff",
                      border: addr.isDefault ? `2px solid ${mainColor}` : "1px solid #e0e0e0",
                      borderRadius: 3, position: "relative",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: addr.isDefault ? mainColor : "text.secondary" }}>
                          {getIcon(addr.saveAs)}
                          <Typography variant="h6" sx={{ textTransform: "capitalize", fontSize: "1rem", fontWeight: 700 }}>
                            {addr.saveAs || "Other"}
                          </Typography>
                        </Box>
                        {addr.isDefault && <Chip label="DEFAULT" size="small" sx={{ bgcolor: mainColor, color: "white", fontSize: "0.7rem", height: 20 }} />}
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {addr.name} 
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {addr.doorNo}, {addr.street}, <br/>
                        {addr.locality}, {addr.city} - {addr.pincode}<br/>
                        Phone: {addr.phone}
                      </Typography>
                    </Box>

                    <Box sx={{ pt: 2, borderTop: "1px dashed #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {!addr.isDefault ? (
                          <Button 
                            size="small" onClick={() => handleSetDefault(addr._id)}
                            sx={{ textTransform: "none", color: "text.secondary" }}
                          >
                            Set as Default
                          </Button>
                        ) : <Box />} 

                        <Box>
                          <IconButton size="small" onClick={() => handleEdit(addr)} sx={{ color: mainColor }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(addr._id)} color="error" disabled={addr.isDefault}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}

              {/* Add New Card (Visible at end of list) */}
              <Grid item xs={12} md={6} lg={4}>
                <Paper
                  elevation={0}
                  onClick={handleAddNew}
                  sx={{ 
                    p: 3, height: "100%", minHeight: 220, bgcolor: "#fff",
                    border: "2px dashed #ccc", borderRadius: 3,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "text.secondary",
                    "&:hover": { borderColor: mainColor, color: mainColor, bgcolor: "#fff5f6" }
                  }}
                >
                  <AddIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography fontWeight={600}>Add New Address</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          <AddressFormModal 
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSaved={handleFormSaved}
            defaultValues={editingAddress}
            isLoggedIn={true}
            userId={userId}
          />

        </Container>

        {/* Footer */}
        <Footer />
      </Box>
    </>
  );
};

export default AddressPage;