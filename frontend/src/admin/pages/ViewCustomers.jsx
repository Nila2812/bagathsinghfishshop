// admin/pages/ViewCustomers.jsx - COMPLETE WITH BACKEND INTEGRATION

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import PlaceIcon from '@mui/icons-material/Place';
import axios from "axios";

const BRAND_COLOR = "#D31032";

const ViewCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from User model
      const usersRes = await axios.get('/api/auth/users/all');
      const users = usersRes.data;

      // Fetch orders and addresses for each user
      const customersData = await Promise.all(
        users.map(async (user) => {
          try {
            // Get order count
            const ordersRes = await axios.get(`/api/orders/user/${user._id}`);
            const orders = ordersRes.data;

            // Get addresses
            const addressRes = await axios.get(`/api/address/${user._id}?type=user`);
            const addresses = addressRes.data;

            return {
              id: user._id,
              name: user.name || "N/A",
              mobile: user.mobile,
              email: user.email || "N/A",
              gender: user.gender || "N/A",
              orderCount: Array.isArray(orders) ? orders.length : 0,
              joinedAt: user.createdAt,
              addresses: Array.isArray(addresses) ? addresses : [],
            };
          } catch (err) {
            console.error(`Error fetching data for user ${user._id}:`, err);
            return {
              id: user._id,
              name: user.name || "N/A",
              mobile: user.mobile,
              email: user.email || "N/A",
              gender: user.gender || "N/A",
              orderCount: 0,
              joinedAt: user.createdAt,
              addresses: [],
            };
          }
        })
      );

      setCustomers(customersData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setLoading(false);
    }
  };

  const toggleRowExpand = (customerId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);
    try {
      // Delete user (this will cascade delete their orders and addresses)
      await axios.delete(`/api/auth/users/${selectedCustomer.id}`);

      // Remove from state
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
      
      alert("✅ Customer deleted successfully");
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("❌ Failed to delete customer. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSaveAsIcon = (saveAs) => {
    switch (saveAs) {
      case 'home':
        return <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'work':
        return <WorkIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return <PlaceIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    }
  };

  const getSaveAsColor = (saveAs) => {
    const colors = {
      home: "#4caf50",
      work: "#2196f3",
      other: "#ff9800",
    };
    return colors[saveAs] || "#757575";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Customer Management
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          📊 Total Customers: {customers.length}
        </Alert>
      </Box>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Expand</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleRowExpand(customer.id)}
                        disabled={customer.addresses.length === 0}
                      >
                        {customer.addresses.length === 0 ? (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            No Addr
                          </Typography>
                        ) : expandedRows[customer.id] ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {customer.id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customer.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.mobile}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${customer.orderCount} ${customer.orderCount === 1 ? 'order' : 'orders'}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: customer.orderCount > 0 ? '#e3f2fd' : '#f5f5f5',
                          color: customer.orderCount > 0 ? '#0277bd' : '#757575',
                          fontWeight: 600 
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(customer.joinedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(customer)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row - Addresses */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ p: 0 }}>
                      <Collapse in={expandedRows[customer.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Saved Addresses ({customer.addresses.length}):
                          </Typography>

                          {customer.addresses.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              No addresses saved
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {customer.addresses.map((address) => (
                                <Card 
                                  key={address._id} 
                                  sx={{ 
                                    p: 2, 
                                    border: address.isDefault ? `2px solid ${BRAND_COLOR}` : '1px solid #e0e0e0',
                                    position: 'relative'
                                  }}
                                >
                                  {/* Default Badge */}
                                  {address.isDefault && (
                                    <Chip 
                                      label="Default" 
                                      size="small" 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: 8, 
                                        right: 8,
                                        bgcolor: BRAND_COLOR,
                                        color: 'white',
                                        fontWeight: 600
                                      }}
                                    />
                                  )}

                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <LocationOnIcon sx={{ color: BRAND_COLOR, mt: 0.5 }} />
                                    <Box sx={{ flex: 1 }}>
                                      {/* Address Type */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        {getSaveAsIcon(address.saveAs)}
                                        <Chip
                                          label={address.saveAs.toUpperCase()}
                                          size="small"
                                          sx={{
                                            bgcolor: getSaveAsColor(address.saveAs),
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                          }}
                                        />
                                      </Box>

                                      {/* Contact Info */}
                                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {address.name} - {address.phone}
                                      </Typography>

                                      {/* Full Address */}
                                      <Typography variant="body2" color="text.secondary">
                                        {address.doorNo} {address.street}, {address.locality}
                                      </Typography>
                                      {address.landmark && (
                                        <Typography variant="body2" color="text.secondary">
                                          Near: {address.landmark}
                                        </Typography>
                                      )}
                                      <Typography variant="body2" color="text.secondary">
                                        {address.district}, {address.state} - {address.pincode}
                                      </Typography>

                                      {/* Map Link */}
                                      {address.lat && address.lon && (
                                        <Button
                                          size="small"
                                          variant="text"
                                          href={`https://maps.google.com/?q=${address.lat},${address.lon}`}
                                          target="_blank"
                                          sx={{ mt: 1, color: BRAND_COLOR, p: 0 }}
                                        >
                                          📍 View on Map →
                                        </Button>
                                      )}
                                    </Box>
                                  </Box>
                                </Card>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ Warning: This action cannot be undone!
              </Alert>
              <Typography variant="body2" gutterBottom>
                Are you sure you want to delete this customer?
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedCustomer.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCustomer.mobile}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {selectedCustomer.orderCount} orders • {selectedCustomer.addresses.length} addresses
                </Typography>
              </Box>
              <Alert severity="error" sx={{ mt: 2 }}>
                This will permanently delete the customer, their addresses, and order history.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewCustomers;