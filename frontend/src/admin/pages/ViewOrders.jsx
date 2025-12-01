// admin/pages/ViewOrders.jsx - COMPLETE WITH DATE FILTER
// PART 1 OF 3 (Lines 1-250)

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  TextField,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import axios from "axios";

const BRAND_COLOR = "#D31032";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [counts, setCounts] = useState({ 
    pending: 0, 
    delivered: 0, 
    cancelled: 0,
    pendingOrders: 0,
    pendingRefunds: 0
  });
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Date Filter States
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const statusOptions = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
  const paymentOptions = ["Pending", "Paid", "Refunded"];

  useEffect(() => {
    fetchOrders();
    fetchCounts();
    const interval = setInterval(() => {
      fetchOrders();
      fetchCounts();
    }, 30000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  useEffect(() => {
    applyDateFilter();
  }, [orders, dateFilter, customStartDate, customEndDate]);

  const applyDateFilter = () => {
    if (dateFilter === 'all') {
      setFilteredOrders(orders);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate, endDate;

    switch (dateFilter) {
      case 'today':
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        break;
      
      case 'yesterday':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      
      case 'last7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      
      case 'last30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      
      case 'custom':
        if (!customStartDate || !customEndDate) {
          setFilteredOrders(orders);
          return;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      default:
        setFilteredOrders(orders);
        return;
    }

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
  };

  const clearDateFilter = () => {
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const fetchOrders = async () => {
    try {
      let url = `/api/orders/admin/all`;
      
      if (filterStatus === 'pending-orders') {
        url += `?status=pending`;
      } else if (filterStatus === 'pending-refund') {
        const res = await axios.get(`/api/orders/admin/all?status=all`);
        const filtered = res.data.filter(order => 
          order.orderStatus === 'Cancelled' && order.paymentStatus === 'Paid'
        );
        setOrders(filtered);
        setLoading(false);
        return;
      } else if (filterStatus === 'Cancelled') {
        const res = await axios.get(`/api/orders/admin/all?status=all`);
        const filtered = res.data.filter(order => 
          order.orderStatus === 'Cancelled' && order.paymentStatus !== 'Paid'
        );
        setOrders(filtered);
        setLoading(false);
        return;
      } else if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      
      const res = await axios.get(url);
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await axios.get('/api/orders/admin/counts');
      setCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };

  const orderMatchesFilter = (order) => {
    if (filterStatus === 'all') return true;
    
    if (filterStatus === 'pending-orders') {
      return !['Delivered', 'Cancelled'].includes(order.orderStatus) && 
             order.paymentStatus !== 'Refunded';
    }
    
    if (filterStatus === 'pending-refund') {
      return order.orderStatus === 'Cancelled' && order.paymentStatus === 'Paid';
    }
    
    if (filterStatus === 'Cancelled') {
      return order.orderStatus === 'Cancelled' && order.paymentStatus !== 'Paid';
    }
    
    return order.orderStatus === filterStatus;
  };

  const handleBulkUpdate = async (action) => {
    const confirmMessage = action === 'deliver' 
      ? `Mark all ${filteredOrders.length} pending orders as DELIVERED?`
      : `Mark all ${filteredOrders.length} cancelled orders as REFUNDED?`;
    
    if (!window.confirm(confirmMessage)) return;

    setBulkUpdating(true);
    try {
      const orderIds = filteredOrders.map(order => order._id);
      
      await axios.post('/api/orders/admin/bulk-update', {
        orderIds,
        action
      });

      setOrders(prevOrders => prevOrders.filter(order => !orderIds.includes(order._id)));
      setFilteredOrders(prevFiltered => prevFiltered.filter(order => !orderIds.includes(order._id)));
      
      fetchCounts();
      
      alert(`✅ Successfully updated ${orderIds.length} orders`);
    } catch (err) {
      console.error("Bulk update failed:", err);
      alert("Failed to update orders. Please try again.");
    } finally {
      setBulkUpdating(false);
    }
  };
  // PART 2 OF 3 (Lines 251-500)

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return;

    setUpdating(true);
    try {
      const response = await axios.put(`/api/orders/${selectedOrder._id}/status`, {
        status: newStatus,
      });

      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order._id === selectedOrder._id) {
            return {
              ...order,
              orderStatus: newStatus,
              paymentStatus: response.data.order.paymentStatus || order.paymentStatus
            };
          }
          return order;
        });

        return updatedOrders.filter(order => orderMatchesFilter(order));
      });

      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
      
      fetchCounts();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!newPaymentStatus || !selectedOrder) return;

    setUpdating(true);
    try {
      await axios.put(`/api/orders/${selectedOrder._id}/payment-status`, {
        paymentStatus: newPaymentStatus,
      });

      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order._id === selectedOrder._id) {
            return {
              ...order,
              paymentStatus: newPaymentStatus
            };
          }
          return order;
        });

        return updatedOrders.filter(order => orderMatchesFilter(order));
      });

      setPaymentDialogOpen(false);
      setSelectedOrder(null);
      setNewPaymentStatus("");
      
      fetchCounts();
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const toggleRowExpand = (orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: "#ff9800",
      Packed: "#9c27b0",
      Shipped: "#3f51b5",
      Delivered: "#4caf50",
      Cancelled: "#f44336",
    };
    return colors[status] || "#757575";
  };

  const getPaymentColor = (status) => {
    const colors = {
      Pending: "#ff9800",
      Paid: "#4caf50",
      Refunded: "#2196f3",
    };
    return colors[status] || "#757575";
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

  const formatWeight = (quantity, unit) => {
    if (unit === 'piece') {
      return `${quantity} ${quantity === 1 ? 'pc' : 'pcs'}`;
    }
    return `${quantity}${unit}`;
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
      {/* Header with Counts */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Order Management
        </Typography>
        
        <Alert 
          severity={counts.pendingOrders > 0 || counts.pendingRefunds > 0 ? "info" : "success"} 
          sx={{ mb: 1 }}
        >
          📦 {counts.pendingOrders} pending {counts.pendingOrders === 1 ? "order" : "orders"} 
          • 💰 {counts.pendingRefunds} pending {counts.pendingRefunds === 1 ? "refund" : "refunds"}
        </Alert>

        <Alert severity="success" sx={{ mb: 1 }}>
          ✅ {counts.delivered} {counts.delivered === 1 ? "order" : "orders"} delivered 
          • ❌ {counts.cancelled} {counts.cancelled === 1 ? "order" : "orders"} cancelled
        </Alert>
      </Box>

      {/* Date Filter Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ color: BRAND_COLOR }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Date Filter
            </Typography>
          </Box>
          {dateFilter !== 'all' && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearDateFilter}
              sx={{ color: BRAND_COLOR }}
            >
              Clear Filter
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="All Time"
                onClick={() => setDateFilter('all')}
                color={dateFilter === 'all' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'all' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'all' ? BRAND_COLOR : undefined }
                }}
              />
              <Chip
                label="Today"
                onClick={() => setDateFilter('today')}
                color={dateFilter === 'today' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'today' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'today' ? BRAND_COLOR : undefined }
                }}
              />
              <Chip
                label="Yesterday"
                onClick={() => setDateFilter('yesterday')}
                color={dateFilter === 'yesterday' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'yesterday' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'yesterday' ? BRAND_COLOR : undefined }
                }}
              />
              <Chip
                label="Last 7 Days"
                onClick={() => setDateFilter('last7days')}
                color={dateFilter === 'last7days' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'last7days' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'last7days' ? BRAND_COLOR : undefined }
                }}
              />
              <Chip
                label="Last 30 Days"
                onClick={() => setDateFilter('last30days')}
                color={dateFilter === 'last30days' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'last30days' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'last30days' ? BRAND_COLOR : undefined }
                }}
              />
              <Chip
                label="Custom Range"
                icon={<FilterListIcon />}
                onClick={() => {
                  setDateFilter('custom');
                  setDateFilterOpen(true);
                }}
                color={dateFilter === 'custom' ? 'primary' : 'default'}
                sx={{ 
                  bgcolor: dateFilter === 'custom' ? BRAND_COLOR : undefined,
                  '&:hover': { bgcolor: dateFilter === 'custom' ? BRAND_COLOR : undefined }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Alert severity="info" sx={{ py: 0.5 }}>
              📊 Showing {filteredOrders.length} of {orders.length} orders
            </Alert>
          </Grid>
        </Grid>

        {dateFilter !== 'all' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {dateFilter === 'today' && '📅 Showing orders from Today'}
            {dateFilter === 'yesterday' && '📅 Showing orders from Yesterday'}
            {dateFilter === 'last7days' && '📅 Showing orders from Last 7 Days'}
            {dateFilter === 'last30days' && '📅 Showing orders from Last 30 Days'}
            {dateFilter === 'custom' && customStartDate && customEndDate && 
              `📅 Showing orders from ${new Date(customStartDate).toLocaleDateString()} to ${new Date(customEndDate).toLocaleDateString()}`
            }
          </Alert>
        )}
      </Card>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={filterStatus} 
          onChange={(e, newValue) => {
            setFilterStatus(newValue);
            setExpandedRows({});
          }} 
          variant="scrollable" 
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="Pending Orders" value="pending-orders" />
          <Tab label="Pending Refunds" value="pending-refund" />
          <Tab label="Placed" value="Placed" />
          <Tab label="Packed" value="Packed" />
          <Tab label="Shipped" value="Shipped" />
          <Tab label="Delivered" value="Delivered" />
          <Tab label="Cancelled" value="Cancelled" />
        </Tabs>
      </Card>

      {/* Bulk Action Buttons */}
      {filterStatus === 'pending-orders' && filteredOrders.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            disabled={bulkUpdating}
            onClick={() => handleBulkUpdate('deliver')}
            sx={{ fontWeight: 600 }}
          >
            {bulkUpdating ? "Processing..." : `✅ Mark All as Delivered (${filteredOrders.length})`}
          </Button>
        </Box>
      )}

      {filterStatus === 'pending-refund' && filteredOrders.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="info"
            disabled={bulkUpdating}
            onClick={() => handleBulkUpdate('refund')}
            sx={{ fontWeight: 600 }}
          >
            {bulkUpdating ? "Processing..." : `💰 Mark All as Refunded (${filteredOrders.length})`}
          </Button>
        </Box>
      )}

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Expand</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total (₹)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment Mode</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {orders.length === 0 
                      ? "No orders found in this category"
                      : "No orders found for the selected date range"
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton size="small" onClick={() => toggleRowExpand(order._id)}>
                        {expandedRows[order._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {order._id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.userId?.name || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.userId?.mobile}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${order.products.length} items`} size="small" sx={{ bgcolor: "#e3f2fd" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{order.grandTotal.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentMode}
                        size="small"
                        sx={{ 
                          bgcolor: order.paymentMode === 'COD' ? '#fff3e0' : '#e3f2fd',
                          color: order.paymentMode === 'COD' ? '#e65100' : '#0277bd',
                          fontWeight: 600 
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        size="small"
                        sx={{ bgcolor: getPaymentColor(order.paymentStatus), color: "white", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        size="small"
                        sx={{ bgcolor: getStatusColor(order.orderStatus), color: "white", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(order.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexDirection: "column" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.orderStatus);
                            setStatusDialogOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewPaymentStatus(order.paymentStatus);
                            setPaymentDialogOpen(true);
                          }}
                        >
                          Update Payment
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Row Details */}
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0 }}>
                      <Collapse in={expandedRows[order._id]} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                            Products Ordered:
                          </Typography>
                          <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.products.map((product, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{product.name_en}</TableCell>
                                    <TableCell>{formatWeight(product.quantity, product.weightUnit)}</TableCell>
                                    <TableCell>₹{product.price}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>₹{product.subtotal.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={3} sx={{ fontWeight: 600, textAlign: "right" }}>Subtotal:</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>₹{order.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={3} sx={{ fontWeight: 600, textAlign: "right" }}>Delivery Charge:</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>
                                    {order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={3} sx={{ fontWeight: 700, textAlign: "right", fontSize: "1rem" }}>
                                    Grand Total:
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem", color: BRAND_COLOR }}>
                                    ₹{order.grandTotal.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                            <LocationOnIcon sx={{ color: BRAND_COLOR, mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Delivery Address:
                              </Typography>
                              <Typography variant="body2">
                                {order.deliveryAddress.name} - {order.deliveryAddress.phone}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {order.deliveryAddress.doorNo} {order.deliveryAddress.street}, {order.deliveryAddress.locality}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                              </Typography>
                              {order.mapLink && (
                                <Button
                                  size="small"
                                  variant="text"
                                  href={order.mapLink}
                                  target="_blank"
                                  sx={{ mt: 1, color: BRAND_COLOR }}
                                >
                                  View on Map →
                                </Button>
                              )}
                            </Box>
                          </Box>
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

      {/* Custom Date Range Dialog */}
      <Dialog open={dateFilterOpen} onClose={() => setDateFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ color: BRAND_COLOR }} />
            Custom Date Range
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: customStartDate }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDateFilterOpen(false);
            setDateFilter('all');
            setCustomStartDate('');
            setCustomEndDate('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setDateFilterOpen(false)}
            disabled={!customStartDate || !customEndDate}
            sx={{ bgcolor: BRAND_COLOR }}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID: {selectedOrder._id}
              </Typography>
              {selectedOrder.paymentMode === 'COD' && newStatus === 'Delivered' && (
                <Alert severity="info" sx={{ my: 2 }}>
                  💡 Payment status will be automatically set to "Paid" for COD orders marked as Delivered
                </Alert>
              )}
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select value={newStatus} label="New Status" onChange={(e) => setNewStatus(e.target.value)}>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: getStatusColor(status) }} />
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updating || !newStatus}
            sx={{ bgcolor: BRAND_COLOR }}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID: {selectedOrder._id}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth>
                <InputLabel>New Payment Status</InputLabel>
                <Select value={newPaymentStatus} label="New Payment Status" onChange={(e) => setNewPaymentStatus(e.target.value)}>
                  {paymentOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: getPaymentColor(status) }} />
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePaymentUpdate}
            disabled={updating || !newPaymentStatus}
            sx={{ bgcolor: BRAND_COLOR }}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewOrders;