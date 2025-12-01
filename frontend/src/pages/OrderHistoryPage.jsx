// src/pages/OrderHistoryPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Grid,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Topbar from '../components/Topbar';
import MainNavbar from '../components/MainNavbar';
import CategoryBar from '../components/CategoryBar';
import Footer from '../components/Footer';

const BRAND_COLOR = '#D31032';

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user ID from localStorage
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const id = userData.id || userData._id;
      setUserId(id);
      fetchOrders(id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/');
    }
  }, [navigate]);

  const fetchOrders = async (id) => {
    try {
      const response = await fetch(`/api/orders/user/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Confirmed': '#2196f3',
      'Processing': '#9c27b0',
      'Packed': '#673ab7',
      'Shipped': '#3f51b5',
      'Delivered': '#4caf50',
      'Cancelled': '#f44336',
    };
    return colors[status] || '#757575';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, bgcolor: '#fff', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' }}>
          <Topbar />
          <MainNavbar fixed />
        </Box>
        <Box sx={{ mt: { xs: '92px', sm: '108px', md: '110px' }, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: BRAND_COLOR }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Fixed Header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, bgcolor: '#fff', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' }}>
        <Topbar />
        <MainNavbar fixed />
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ mt: { xs: '92px', sm: '108px', md: '110px' }, flexGrow: 1 }}>
        <CategoryBar fixed={false} />

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {/* Header - Centered */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              My Orders
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and track all your orders
            </Typography>
          </Box>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No orders yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start shopping to see your orders here
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ bgcolor: BRAND_COLOR }}
              >
                Start Shopping
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {orders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order._id} sx={{ display: 'flex' }}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      transition: 'transform 0.2s',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Order Header */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Order ID: {order._id}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip
                          label={order.orderStatus}
                          sx={{
                            bgcolor: getStatusColor(order.orderStatus),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Products List */}
                      <Box sx={{ mb: 2, flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Items ({order.products.length})
                        </Typography>
                        {order.products.map((product, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 1,
                              borderBottom: index < order.products.length - 1 ? '1px solid' : 'none',
                              borderColor: 'divider',
                            }}
                          >
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {product.name_en}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatWeight(product.quantity, product.weightUnit)} × ₹{product.price}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{product.subtotal.toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Order Summary */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PaymentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Payment: {order.paymentMode}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Delivery: {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Amount
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLOR }}>
                            ₹{order.grandTotal.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Action Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/order-success?orderId=${order._id}`)}
                        sx={{
                          borderColor: BRAND_COLOR,
                          color: BRAND_COLOR,
                          mt: 'auto',
                          '&:hover': {
                            borderColor: BRAND_COLOR,
                            bgcolor: `${BRAND_COLOR}10`,
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
}