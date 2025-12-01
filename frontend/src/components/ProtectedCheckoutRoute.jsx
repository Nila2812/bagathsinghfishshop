// src/components/ProtectedCheckoutRoute.jsx - ONLY ALLOW VIA CART CHECKOUT BUTTON

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const ProtectedCheckoutRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckoutAllowed, setIsCheckoutAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');
    
    let userLoggedIn = false;
    if (user && userId) {
      try {
        JSON.parse(user); // Validate JSON
        userLoggedIn = true;
      } catch (err) {
        // Invalid user data
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      }
    }
    
    setIsLoggedIn(userLoggedIn);

    // 🔥 CHECK: Was checkout allowed via cart button?
    const checkoutAllowed = sessionStorage.getItem('checkoutAllowed');
    
    if (checkoutAllowed === 'true') {
      setIsCheckoutAllowed(true);
      // Clear the flag after reading it
      sessionStorage.removeItem('checkoutAllowed');
    }
    
    setIsChecking(false);
  }, [location.pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 🔥 BLOCK: Direct navigation not allowed
  if (!isCheckoutAllowed) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          gap: 3,
          px: 2,
        }}
      >
        <BlockIcon sx={{ fontSize: 80, color: '#e23a3a' }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Access Denied
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            maxWidth: 500
          }}
        >
          Please proceed to checkout through your shopping cart. Direct access to this page is not allowed.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#e23a3a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Home
          </button>
        </Box>
      </Box>
    );
  }

  // 🔥 REQUIRE LOGIN: If not logged in, redirect to home and trigger login
  if (!isLoggedIn) {
    setTimeout(() => {
      window.dispatchEvent(new Event('openLoginDrawer'));
    }, 300);
    
    return <Navigate to="/" replace />;
  }

  // ✅ All checks passed - render checkout page
  return children;
};

export default ProtectedCheckoutRoute;