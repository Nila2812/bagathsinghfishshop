import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useCart } from "../context/CartContext";

const CartDrawer = ({ open, onClose }) => {
  const {
    cartItems,
    addSpecificWeight,
    removeSpecificWeight,
    removeFromCart,
    getTotalPrice,
    calculateItemPrice,
    clearCart,
  } = useCart();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [stockWarning, setStockWarning] = useState(false);

  const handleAddWeight = async (cartItemId, value, unit, stockQty) => {
    try {
      const result = await addSpecificWeight(cartItemId, value, unit, stockQty);
      if (result?.capped) {
        setStockWarning(true);
      }
    } catch (err) {
      if (err.response?.data?.error === 'OUT_OF_STOCK' || err.response?.data?.capped) {
        setStockWarning(true);
      }
    }
  };

  const handleRemoveWeight = async (cartItemId, value, unit) => {
    try {
      await removeSpecificWeight(cartItemId, value, unit);
    } catch (err) {
      console.error("Failed to remove weight:", err);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setConfirmClearOpen(false);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const formatWeight = (totalWeight, unit) => {
    if (unit === 'piece') {
      return `${totalWeight} ${totalWeight === 1 ? 'piece' : 'pieces'}`;
    } else if (unit === 'kg') {
      return `${totalWeight}kg`;
    } else if (unit === 'g') {
      if (totalWeight >= 1000) {
        return `${totalWeight / 1000}kg`;
      }
      return `${totalWeight}g`;
    }
    return `${totalWeight}${unit}`;
  };

  const getButtons = (baseUnit) => {
    if (baseUnit === 'piece') {
      return [
        { label: "1p", value: 1, unit: 'piece' },
        { label: "5p", value: 5, unit: 'piece' },
        { label: "10p", value: 10, unit: 'piece' },
      ];
    } else if (baseUnit === '250g') {
      return [
        { label: "250g", value: 250, unit: 'g' },
        { label: "1kg", value: 1000, unit: 'g' },
        { label: "5kg", value: 5000, unit: 'g' },
      ];
    } else if (baseUnit === '500g') {
      return [
        { label: "500g", value: 500, unit: 'g' },
        { label: "1kg", value: 1000, unit: 'g' },
        { label: "5kg", value: 5000, unit: 'g' },
      ];
    } else if (baseUnit === '1kg') {
      return [
        { label: "1kg", value: 1000, unit: 'g' },
        { label: "5kg", value: 5000, unit: 'g' },
        { label: "10kg", value: 10000, unit: 'g' },
      ];
    }
    return [];
  };

  const totalAmount = getTotalPrice();

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: { xs: "100%", sm: 420 }, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Shopping Cart
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {cartItems.length > 0 && (
                <IconButton
                  onClick={() => setConfirmClearOpen(true)}
                  sx={{ color: "error.main" }}
                  title="Clear Cart"
                >
                  <DeleteSweepIcon />
                </IconButton>
              )}
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, position: "relative" }}>
            {/* Stock Warning inside drawer */}
            {stockWarning && (
              <Alert 
                severity="warning" 
                onClose={() => setStockWarning(false)}
                sx={{ 
                  mb: 2,
                  position: "sticky",
                  top: 0,
                  zIndex: 10
                }}
              >
                Maximum stock limit reached!
              </Alert>
            )}

            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              cartItems.map((item) => {
                const { productSnapshot, totalWeight, unit, _id, productId } = item;
                const itemTotal = calculateItemPrice(item);
                const buttons = getButtons(productSnapshot.baseUnit);
                const stockQty = productId?.stockQty || productSnapshot.stockQty || 0;

                return (
                  <Box
                    key={_id}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <Box
                        component="img"
                        src={
                          productSnapshot.image?.data
                            ? `data:${productSnapshot.image.contentType};base64,${productSnapshot.image.data}`
                            : "https://via.placeholder.com/80"
                        }
                        alt={productSnapshot.name_en}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {productSnapshot.name_en}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{productSnapshot.price} for {productSnapshot.weightValue}
                          {productSnapshot.weightUnit}
                        </Typography>

                        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.3 }}>
                          <Box sx={{ display: "flex",  alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Total Quantity:&nbsp;
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#e23a3a" }}>
                              {formatWeight(totalWeight, unit)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: "flex",  alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Price:&nbsp;
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "#e23a3a" }}>
                              ₹{itemTotal.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleRemove(_id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {/* Add & Remove Buttons - Center Aligned */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1.5, gap: 1.2 }}>
                      
                      {/* Add Buttons with Label */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Increase quantity →
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", justifyContent: "center" }}>
                          {buttons.map((btn, index) => (
                            <Button
                              key={index}
                              size="small"
                              variant="contained"
                              onClick={() => handleAddWeight(_id, btn.value, btn.unit, stockQty)}
                              sx={{
                                minWidth: "auto",
                                px: 1.5,
                                py: 0.6,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "none",
                                backgroundColor: "#4caf50",
                                "&:hover": {
                                  backgroundColor: "#45a049",
                                },
                              }}
                            >
                              +{btn.label}
                            </Button>
                          ))}
                        </Box>
                      </Box>

                      {/* Remove Buttons with Label */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Decrease quantity →
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", justifyContent: "center" }}>
                          {buttons.map((btn, index) => (
                            <Button
                              key={index}
                              size="small"
                              variant="contained"
                              onClick={() => handleRemoveWeight(_id, btn.value, btn.unit)}
                              sx={{
                                minWidth: "auto",
                                px: 1.5,
                                py: 0.6,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textTransform: "none",
                                backgroundColor: "#f44336",
                                "&:hover": {
                                  backgroundColor: "#e53935",
                                },
                              }}
                            >
                              -{btn.label}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                  </Box>
                );
              })
            )}
          </Box>

          {cartItems.length > 0 && (
            <Box sx={{ p: 2, borderTop: "2px solid #e0e0e0", backgroundColor: "#f9f9f9" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Delivery charges calculated at checkout
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#e23a3a" }}>
                  ₹{totalAmount.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#e23a3a",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#cc3232" },
                }}
                onClick={() => alert("Checkout feature coming soon!")}
              >
                Proceed to Checkout
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Dialog open={confirmClearOpen} onClose={() => setConfirmClearOpen(false)}>
        <DialogTitle>Clear Cart?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove all items from your cart?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button onClick={handleClearCart} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CartDrawer;