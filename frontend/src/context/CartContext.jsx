import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize sessionId
  useEffect(() => {
    let session = localStorage.getItem("sessionId");
    if (!session) {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", session);
    }
    setSessionId(session);
    fetchCart(session);
  }, []);

  // Fetch cart from backend
  const fetchCart = async (session) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/cart/${session}`);
      setCartItems(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (productId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/cart/add", {
        sessionId,
        productId,
      });

      const { cartItem, isNew } = res.data;

      if (isNew) {
        setCartItems([...cartItems, cartItem]);
      } else {
        const updated = cartItems.map((item) => {
          const itemProductId = item.productId?._id?.toString() || item.productId?.toString();
          return itemProductId === productId.toString()
            ? { ...item, totalWeight: cartItem.totalWeight, unit: cartItem.unit, _id: cartItem._id }
            : item;
        });
        setCartItems(updated);
      }

      return cartItem;
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  // Increment by baseUnit
  const incrementWeight = async (cartItemId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/cart/update/${cartItemId}`, {
        action: 'increment',
      });

      const updated = cartItems.map((item) =>
        item._id === cartItemId
          ? { ...item, totalWeight: res.data.cartItem.totalWeight, unit: res.data.cartItem.unit }
          : item
      );
      setCartItems(updated);
    } catch (err) {
      console.error("Failed to increment:", err);
      throw err;
    }
  };

  // Decrement by baseUnit
  const decrementWeight = async (cartItemId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/cart/update/${cartItemId}`, {
        action: 'decrement',
      });

      if (res.data.removed) {
        // Item was removed (below minimum)
        setCartItems(cartItems.filter((item) => item._id !== cartItemId));
      } else {
        const updated = cartItems.map((item) =>
          item._id === cartItemId
            ? { ...item, totalWeight: res.data.cartItem.totalWeight, unit: res.data.cartItem.unit }
            : item
        );
        setCartItems(updated);
      }
    } catch (err) {
      console.error("Failed to decrement:", err);
      throw err;
    }
  };

  // Add specific weight/pieces
  const addSpecificWeight = async (cartItemId, value, unit, stockQty) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/cart/update/${cartItemId}`, {
        action: 'add_specific',
        value,
        unit,
        stockQty
      });

      if (res.data.removed) {
        setCartItems(cartItems.filter((item) => item._id !== cartItemId));
      } else {
        const updated = cartItems.map((item) =>
          item._id === cartItemId
            ? { ...item, totalWeight: res.data.cartItem.totalWeight, unit: res.data.cartItem.unit }
            : item
        );
        setCartItems(updated);
      }
      
      return res.data;
    } catch (err) {
      console.error("Failed to add specific weight:", err);
      throw err;
    }
  };

  // Remove specific weight/pieces
  const removeSpecificWeight = async (cartItemId, value, unit) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/cart/update/${cartItemId}`, {
        action: 'remove_specific',
        value,
        unit
      });

      if (res.data.removed) {
        setCartItems(cartItems.filter((item) => item._id !== cartItemId));
      } else {
        const updated = cartItems.map((item) =>
          item._id === cartItemId
            ? { ...item, totalWeight: res.data.cartItem.totalWeight, unit: res.data.cartItem.unit }
            : item
        );
        setCartItems(updated);
      }
      
      return res.data;
    } catch (err) {
      console.error("Failed to remove specific weight:", err);
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/remove/${cartItemId}`);
      setCartItems(cartItems.filter((item) => item._id !== cartItemId));
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      throw err;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/clear/${sessionId}`);
      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  // Get display weight for a product (e.g., "2kg", "500g", "5 pieces")
  const getProductWeight = (productId) => {
    const item = cartItems.find((item) => {
      return item.productId?._id?.toString() === productId.toString() || 
             item.productId?.toString() === productId.toString();
    });
    
    if (!item) return null;
    
    if (item.unit === 'piece') {
      return `${item.totalWeight} ${item.totalWeight === 1 ? 'piece' : 'pieces'}`;
    } else if (item.unit === 'kg') {
      return `${item.totalWeight}kg`;
    } else if (item.unit === 'g') {
      if (item.totalWeight >= 1000) {
        return `${item.totalWeight / 1000}kg`;
      }
      return `${item.totalWeight}g`;
    }
    return null;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some((item) => {
      return item.productId?._id?.toString() === productId.toString() || 
             item.productId?.toString() === productId.toString();
    });
  };

  // Get cart item ID for a product
  const getCartItemId = (productId) => {
    const item = cartItems.find((item) => {
      return item.productId?._id?.toString() === productId.toString() || 
             item.productId?.toString() === productId.toString();
    });
    return item ? item._id : null;
  };

  // Get total cart count (unique products)
  const getCartCount = () => cartItems.length;

  // Calculate price for a cart item
  const calculateItemPrice = (item) => {
    const { productSnapshot, totalWeight, unit } = item;
    
    // Convert everything to same unit for calculation
    const toGrams = (value, unitType) => {
      if (unitType === 'kg') return value * 1000;
      if (unitType === 'g') return value;
      return value; // piece
    };
    
    const addedInGrams = toGrams(totalWeight, unit);
    const priceForInGrams = toGrams(productSnapshot.weightValue, productSnapshot.weightUnit);
    
    // Calculate: (addedWeight / priceWeight) × price
    const ratio = addedInGrams / priceForInGrams;
    return ratio * productSnapshot.price;
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const value = {
    cartItems,
    sessionId,
    loading,
    addToCart,
    incrementWeight,
    decrementWeight,
    addSpecificWeight,
    removeSpecificWeight,
    removeFromCart,
    clearCart,
    getProductWeight,
    isInCart,
    getCartItemId,
    getCartCount,
    getTotalPrice,
    calculateItemPrice,
    refreshCart: () => fetchCart(sessionId),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};