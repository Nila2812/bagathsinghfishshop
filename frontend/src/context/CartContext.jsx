// src/context/CartContext.jsx - COMPLETE FILE

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { getClientId, regenerateClientId } from "../utils/clientId";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

const API_BASE = "http://localhost:5000";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [clientId, setClientId] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    const sessionClientId = getClientId();
    setClientId(sessionClientId);

    const user = localStorage.getItem("user");
    const token = localStorage.getItem("sessionToken");
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserId(userData.id);
        setSessionToken(token);
        
        verifySessionValidity(userData.id, token);
        fetchCart(userData.id, "user");
      } catch (err) {
        console.error("Error parsing user:", err);
        fetchCart(sessionClientId, "client");
      }
    } else {
      fetchCart(sessionClientId, "client");
    }
  }, []);

  const verifySessionValidity = async (id, token) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/verify-session`, {
        userId: id,
        sessionToken: token
      });

      if (response.data.success) {
        console.log(`✅ Session verified for userId: ${id}`);
      }
    } catch (err) {
      if (err.response?.data?.forceLogout) {
        console.warn(`❌ Session invalidated - Forced logout from another device`);
        handleForceLogout();
      } else {
        console.error("Session verification failed:", err.message);
      }
    }
  };

  const handleForceLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("selectedAddressId");
    
    setIsLoggedIn(false);
    setUserId(null);
    setSessionToken(null);
    setCartItems([]);
    
    const newClientId = regenerateClientId();
    setClientId(newClientId);
    console.log(`🆕 New clientId generated after force logout: ${newClientId}`);
    
    fetchCart(newClientId, "client");
    window.dispatchEvent(new Event("logout"));
    alert("🔐 Your session has expired. Logged in from another device. Please login again.");
  };

  useEffect(() => {
    const handleLoginSuccess = () => {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("sessionToken");
      
      if (user && token) {
        try {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserId(userData.id);
          setSessionToken(token);
          console.log(`🔐 Login event received for userId: ${userData.id}`);
          
          migrateGuestCart(userData.id, token);
        } catch (err) {
          console.error("Error on login:", err);
        }
      }
    };

    const handleLogout = async () => {
      console.log(`🔓 Logout event received`);
      
      if (userId) {
        try {
          await axios.delete(`${API_BASE}/api/cart/clear/${userId}?type=user`);
          console.log(`🗑️ User cart cleared for userId: ${userId}`);
        } catch (err) {
          console.error("Error clearing user cart:", err);
        }
      }
      
      setIsLoggedIn(false);
      setUserId(null);
      setSessionToken(null);
      setCartItems([]);
      
      const newClientId = regenerateClientId();
      setClientId(newClientId);
      console.log(`🆕 New clientId generated: ${newClientId}`);
      
      fetchCart(newClientId, "client");
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("logout", handleLogout);
    };
  }, [userId]);

  const getIdentifier = () => isLoggedIn ? userId : clientId;
  const getIdentifierType = () => isLoggedIn ? "user" : "client";

  const fetchCart = async (identifier, type) => {
    if (!identifier) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/cart/${identifier}?type=${type}`);
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch cart:", err.response?.data || err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const identifier = getIdentifier();
      const identifierType = getIdentifierType();

      const payload = { productId };
      if (identifierType === "user") {
        payload.userId = identifier;
      } else {
        payload.clientId = identifier;
      }

      const res = await axios.post(`${API_BASE}/api/cart/add`, payload);
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

      window.dispatchEvent(new Event("cartUpdated"));
      return cartItem;
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  // 🔥 MODIFIED: incrementWeight now returns response with capped status
  const incrementWeight = async (cartItemId) => {
    try {
      const res = await axios.put(`${API_BASE}/api/cart/update/${cartItemId}`, {
        action: 'increment',
      });

      const updated = cartItems.map((item) =>
        item._id === cartItemId
          ? { ...item, totalWeight: res.data.cartItem.totalWeight, unit: res.data.cartItem.unit }
          : item
      );
      setCartItems(updated);
      window.dispatchEvent(new Event("cartUpdated"));
      
      // 🔥 Return full response so caller can check capped status
      return res.data;
    } catch (err) {
      console.error("Failed to increment:", err);
      throw err;
    }
  };

  const decrementWeight = async (cartItemId) => {
    try {
      const res = await axios.put(`${API_BASE}/api/cart/update/${cartItemId}`, {
        action: 'decrement',
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
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to decrement:", err);
      throw err;
    }
  };

  const addSpecificWeight = async (cartItemId, value, unit, stockQty) => {
    try {
      const res = await axios.put(`${API_BASE}/api/cart/update/${cartItemId}`, {
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

      window.dispatchEvent(new Event("cartUpdated"));
      return res.data;
    } catch (err) {
      console.error("Failed to add specific weight:", err);
      throw err;
    }
  };

  const removeSpecificWeight = async (cartItemId, value, unit) => {
    try {
      const res = await axios.put(`${API_BASE}/api/cart/update/${cartItemId}`, {
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

      window.dispatchEvent(new Event("cartUpdated"));
      return res.data;
    } catch (err) {
      console.error("Failed to remove specific weight:", err);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API_BASE}/api/cart/remove/${cartItemId}`);
      setCartItems(cartItems.filter((item) => item._id !== cartItemId));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const identifier = getIdentifier();
      const type = getIdentifierType();
      await axios.delete(`${API_BASE}/api/cart/clear/${identifier}?type=${type}`);
      setCartItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to clear cart:", err);
      throw err;
    }
  };

  const migrateGuestCart = async (newUserId, token) => {
    try {
      const currentClientId = clientId;
      console.log(`🔄 Starting cart migration...`);
      console.log(`   userId: ${newUserId}`);
      console.log(`   clientId: ${currentClientId}`);

      const res = await axios.post(`${API_BASE}/api/cart/migrate`, {
        userId: newUserId,
        clientId: currentClientId
      });

      console.log(`✅ Cart migrated successfully`);
      console.log(`   Deleted existing user items: ${res.data.deletedCount}`);
      console.log(`   Migrated guest items: ${res.data.migratedCount}`);
      
      fetchCart(newUserId, "user");
    } catch (err) {
      console.error("❌ Error migrating cart:", err);
      fetchCart(newUserId, "user");
    }
  };

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

  const isInCart = (productId) => {
    return cartItems.some((item) => {
      return item.productId?._id?.toString() === productId.toString() || 
             item.productId?.toString() === productId.toString();
    });
  };

  const getCartItemId = (productId) => {
    const item = cartItems.find((item) => {
      return item.productId?._id?.toString() === productId.toString() || 
             item.productId?.toString() === productId.toString();
    });
    return item ? item._id : null;
  };

  const getCartCount = () => cartItems.length;

  const calculateItemPrice = (item) => {
    const { productSnapshot, totalWeight, unit } = item;
    
    const toGrams = (value, unitType) => {
      if (unitType === 'kg') return value * 1000;
      if (unitType === 'g') return value;
      return value;
    };
    
    const addedInGrams = toGrams(totalWeight, unit);
    const priceForInGrams = toGrams(productSnapshot.weightValue, productSnapshot.weightUnit);
    
    const ratio = addedInGrams / priceForInGrams;
    return ratio * productSnapshot.price;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const value = {
    cartItems,
    clientId,
    userId,
    isLoggedIn,
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
    refreshCart: () => {
      const identifier = getIdentifier();
      const type = getIdentifierType();
      fetchCart(identifier, type);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};