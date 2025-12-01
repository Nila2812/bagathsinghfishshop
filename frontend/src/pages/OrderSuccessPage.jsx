// src/pages/OrderSuccessPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import Topbar from '../components/Topbar';
import MainNavbar from '../components/MainNavbar';
import CategoryBar from '../components/CategoryBar';
import Footer from '../components/Footer';

const BRAND_COLOR = '#D31032';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Placed': {
        icon: CheckCircleIcon,
        color: '#ff9800',
        bgColor: '#fff3e0',
        borderColor: '#ff9800',
        title: 'Order Placed Successfully!',
        message: 'Your order has been placed and is being prepared.',
      },
      'Packed': {
        icon: InventoryIcon,
        color: '#9c27b0',
        bgColor: '#f3e5f5',
        borderColor: '#9c27b0',
        title: 'Order Packed!',
        message: 'Your order has been packed and is ready for shipping.',
      },
      'Shipped': {
        icon: LocalShippingIcon,
        color: '#3f51b5',
        bgColor: '#e8eaf6',
        borderColor: '#3f51b5',
        title: 'Order Shipped!',
        message: 'Your order is on the way to your delivery address.',
      },
      'Delivered': {
        icon: LocalMallIcon,
        color: '#4caf50',
        bgColor: '#e8f5e9',
        borderColor: '#4caf50',
        title: 'Order Delivered!',
        message: 'Your order has been successfully delivered. Enjoy your products!',
      },
      'Cancelled': {
        icon: ErrorOutlineIcon,
        color: '#f44336',
        bgColor: '#ffebee',
        borderColor: '#f44336',
        title: 'Order Cancelled',
        message: 'We\'re sorry for the inconvenience. Your order has been cancelled.',
      },
    };
    return configs[status] || configs['Placed'];
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeight = (quantity, unit) => {
    if (unit === 'piece') {
      return `${quantity} ${quantity === 1 ? 'piece' : 'pieces'}`;
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

  if (error || !order) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, bgcolor: '#fff', boxShadow: '0px 2px 6px rgba(0,0,0,0.1)' }}>
          <Topbar />
          <MainNavbar fixed />
        </Box>
        
        <Box sx={{ mt: { xs: '92px', sm: '108px', md: '110px' }, flexGrow: 1 }}>
          <CategoryBar fixed={false} />
          
          <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {error || 'Order not found'}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mt: 3, bgcolor: BRAND_COLOR }}
              >
                Go to Home
              </Button>
            </Paper>
          </Container>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Footer />
        </Box>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;

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
          {/* Success/Cancelled Header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 3,
              textAlign: 'center',
              bgcolor: statusConfig.bgColor,
              border: `2px solid ${statusConfig.borderColor}`,
              borderRadius: 3,
            }}
          >
            <StatusIcon sx={{ fontSize: 80, color: statusConfig.color, mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: statusConfig.color }}>
              {statusConfig.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {statusConfig.message}
            </Typography>

            {order.orderStatus === 'Cancelled' && order.paymentStatus === 'Paid' && (
              <Alert severity="info" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                Your refund will be processed within 5-7 business days.
              </Alert>
            )}

            <Chip
              label={`Order ID: ${order._id}`}
              sx={{ mt: 2, fontWeight: 600, fontSize: '14px' }}
            />
          </Paper>

          {/* 4 Equal Boxes in Single Row - Centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Grid container spacing={2} sx={{ maxWidth: '1400px' }}>
              {/* Box 1: Order Status */}
              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalShippingIcon sx={{ fontSize: 28, color: BRAND_COLOR, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Order Status
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current Status:
                        </Typography>
                        <Chip
                          label={order.orderStatus}
                          sx={{
                            bgcolor: getStatusColor(order.orderStatus),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Status:
                        </Typography>
                        <Chip
                          label={order.paymentStatus}
                          color={order.paymentStatus === 'Paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Ordered on {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Box 2: Payment Details */}
              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PaymentIcon sx={{ fontSize: 28, color: BRAND_COLOR, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Payment Details
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Payment Mode:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.paymentMode}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                        <Typography variant="body2">₹{order.totalAmount.toFixed(2)}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Delivery Charge:</Typography>
                        <Typography variant="body2">
                          {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Paid:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_COLOR }}>
                          ₹{order.grandTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Box 3: Products Ordered */}
              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ShoppingBagIcon sx={{ fontSize: 28, color: BRAND_COLOR, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Products ({order.products.length})
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ 
                      flexGrow: 1, 
                      maxHeight: order.products.length > 2 ? '240px' : 'none',
                      overflowY: order.products.length > 2 ? 'auto' : 'visible',
                      pr: order.products.length > 2 ? 1 : 0
                    }}>
                      {order.products.map((product, index) => (
                        <Box key={index}>
                          <Box sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {product.name_en}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatWeight(product.quantity, product.weightUnit)} × ₹{product.price}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                ₹{product.subtotal.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                          {index < order.products.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Box 4: Delivery Address */}
              <Grid item xs={12} sm={6} lg={3}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnIcon sx={{ fontSize: 28, color: BRAND_COLOR, mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Delivery Address
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ flexGrow: 1, mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        {order.deliveryAddress.name} - {order.deliveryAddress.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {order.deliveryAddress.doorNo} {order.deliveryAddress.street}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {order.deliveryAddress.locality}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                      </Typography>
                    </Box>

                    {order.mapLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={order.mapLink}
                        target="_blank"
                        sx={{ borderColor: BRAND_COLOR, color: BRAND_COLOR, width: '100%' }}
                      >
                        View on Map
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ bgcolor: BRAND_COLOR, px: 4 }}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/orders')}
              sx={{ borderColor: BRAND_COLOR, color: BRAND_COLOR, px: 4 }}
            >
              View All Orders
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
}